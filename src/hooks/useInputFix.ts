import { useCallback } from 'react';

/**
 * Custom hook to fix space input issue after numbers
 * This addresses the problem where some browsers/IMEs don't trigger onChange
 * when typing space after a number
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

          // Check if the character before cursor is a digit
          if (/\d/.test(prevChar)) {
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
        }
      }
    },
    []
  );

  return {
    onKeyDown: handleKeyDown,
  };
}
