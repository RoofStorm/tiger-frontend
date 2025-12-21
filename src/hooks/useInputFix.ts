import { useCallback, useRef } from 'react';

/**
 * Custom hook to fix space input issue after numbers and on mobile devices
 * This addresses the problem where some browsers/IMEs don't trigger onChange
 * when typing space after a number or when typing space with only text on mobile
 */
export function useInputFix() {
  // Track if we're currently handling a space input to prevent duplicate events
  const isHandlingSpaceRef = useRef(false);
  // Track the last processed value to detect browser auto-insertion
  const lastProcessedValueRef = useRef<string>('');

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Only handle space key
      if (e.key === ' ' || e.code === 'Space') {
        const target = e.currentTarget;
        const { selectionStart, selectionEnd, value } = target;

        if (selectionStart != null && selectionEnd != null) {
          const prevChar = value.substring(selectionStart - 1, selectionStart);
          const isAfterDigit = /\d/.test(prevChar);
          
          // Detect mobile devices
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                          ('ontouchstart' in window || navigator.maxTouchPoints > 0);

          // On mobile, handle all space inputs to ensure onChange is triggered
          // On desktop, only handle space after digits (where browsers sometimes fail)
          if (isMobile || isAfterDigit) {
            // Prevent default to avoid duplicate space from browser
            e.preventDefault();
            e.stopPropagation();

            // Check if there's already a space at the cursor position to avoid duplicates
            const nextChar = value.substring(selectionStart, selectionStart + 1);
            if (nextChar === ' ' && selectionStart === selectionEnd) {
              // Already a space, just move cursor
              target.setSelectionRange(selectionStart + 1, selectionStart + 1);
              return;
            }

            // Prevent duplicate handling
            if (isHandlingSpaceRef.current) {
              return;
            }
            isHandlingSpaceRef.current = true;

            // Store original value and cursor position
            const originalValue = value;
            const originalSelectionStart = selectionStart;
            const originalSelectionEnd = selectionEnd;
            const newCursorPos = selectionStart + 1;

            // Calculate expected value with space inserted
            const expectedValue = 
              originalValue.substring(0, originalSelectionStart) + 
              ' ' + 
              originalValue.substring(originalSelectionEnd);

            // Use setTimeout with 0 delay to check after browser's default behavior
            // This ensures we can detect if browser auto-inserted the space
            setTimeout(() => {
              const currentValue = target.value;
              const currentSelectionStart = target.selectionStart;
              
              // Check if browser already inserted the space correctly
              if (currentValue === expectedValue) {
                // Browser already handled it correctly
                // Update cursor position if needed
                if (currentSelectionStart !== newCursorPos) {
                  target.setSelectionRange(newCursorPos, newCursorPos);
                }
                // Manually trigger input event to ensure React's onChange is called
                // This is important for mobile browsers that might insert space but not trigger onChange
                const inputEvent = new Event('input', {
                  bubbles: true,
                  cancelable: false,
                });
                target.dispatchEvent(inputEvent);
                isHandlingSpaceRef.current = false;
                lastProcessedValueRef.current = currentValue;
                return;
              }

              // Check if browser inserted space but value is different from expected
              if (currentValue !== originalValue) {
                // Check if space was inserted at cursor position
                const spaceAtCursor = currentValue.substring(originalSelectionStart, originalSelectionStart + 1) === ' ';
                const lengthIncreased = currentValue.length === originalValue.length + 1;
                
                if (spaceAtCursor && lengthIncreased) {
                  // Browser inserted space, but value doesn't match expected (might be duplicate or different content)
                  // Update cursor and trigger onChange to sync React state
                  target.setSelectionRange(newCursorPos, newCursorPos);
                  const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: false,
                  });
                  target.dispatchEvent(inputEvent);
                  isHandlingSpaceRef.current = false;
                  lastProcessedValueRef.current = currentValue;
                  return;
                }
              }

              // Browser didn't insert or inserted incorrectly
              // Only insert if value hasn't changed (browser didn't auto-insert)
              if (currentValue === originalValue) {
                // Set value directly
                target.value = expectedValue;
                
                // Set cursor position after the inserted space
                target.setSelectionRange(newCursorPos, newCursorPos);
                
                // Dispatch input event to trigger React's onChange handler
                // Since we prevented default, browser won't trigger onChange, so we need to do it manually
                // Use a native input event that React will recognize
                const inputEvent = new Event('input', {
                  bubbles: true,
                  cancelable: false,
                });
                target.dispatchEvent(inputEvent);
                
                isHandlingSpaceRef.current = false;
                lastProcessedValueRef.current = expectedValue;
              } else {
                // Value changed but not as expected - might be browser auto-insertion with different content
                // Update cursor position and trigger onChange to sync React state
                target.setSelectionRange(newCursorPos, newCursorPos);
                const inputEvent = new Event('input', {
                  bubbles: true,
                  cancelable: false,
                });
                target.dispatchEvent(inputEvent);
                isHandlingSpaceRef.current = false;
                lastProcessedValueRef.current = currentValue;
              }
            }, 0);
          }
          // Note: On desktop, if not after digit, browser handles space normally
          // This is fine because desktop browsers typically handle space correctly
        }
      }
    },
    []
  );

  return {
    onKeyDown: handleKeyDown,
  };
}
