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

          // Handle space after digit OR on mobile devices (to fix mobile space input issues)
          // This ensures space works correctly in all cases:
          // - After numbers (both mobile and desktop)
          // - After text on mobile (fixes mobile IME issues)
          // - After text on desktop (browser handles normally, but we can also handle it for consistency)
          if (isAfterDigit || isMobile) {
            e.preventDefault();

            // Manually insert space
            target.setRangeText(' ', selectionStart, selectionEnd, 'end');

            // Dispatch a native input event so React onChange fires
            const inputEvent = new InputEvent('input', {
              bubbles: true,
              cancelable: false,
              data: ' ',
              inputType: 'insertText',
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
