import { useCallback } from 'react';

/**
 * Custom hook to fix space input issue after numbers and on mobile devices
 * This addresses the problem where some browsers/IMEs don't trigger onChange
 * when typing space after a number or when typing space with only text on mobile
 */
export function useInputFix() {
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

          // Only handle space after digit (both mobile and desktop)
          // For mobile devices, only fix space after numbers, not after text
          // This prevents duplicate space issues when typing normally
          if (isAfterDigit) {
            e.preventDefault();
            e.stopPropagation();

            // Create new value with space inserted
            const newValue = 
              value.substring(0, selectionStart) + 
              ' ' + 
              value.substring(selectionEnd);
            
            // Update the input value directly
            target.value = newValue;
            
            // Set cursor position after the inserted space
            const newCursorPos = selectionStart + 1;
            target.setSelectionRange(newCursorPos, newCursorPos);

            // Create a proper InputEvent that React will recognize
            const inputEvent = new InputEvent('input', {
              bubbles: true,
              cancelable: false,
              inputType: 'insertText',
              data: ' ',
            });
            
            target.dispatchEvent(inputEvent);
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
