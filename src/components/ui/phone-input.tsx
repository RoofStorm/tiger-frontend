import React from 'react';
import { useInputFix } from '@/hooks/useInputFix';

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange'
  > {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Phone input component that only allows numbers
 * Automatically handles space-after-number fix and number-only input
 */
export function PhoneInput({
  value,
  onChange,
  onKeyDown,
  ...props
}: PhoneInputProps) {
  const { onKeyDown: handleInputKeyDown } = useInputFix();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers, backspace, delete, arrow keys, tab, enter
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
      'Enter',
      'Home',
      'End',
    ];

    // Allow numbers (0-9)
    if (e.key >= '0' && e.key <= '9') {
      return; // Allow the default behavior
    }

    // Allow allowed keys
    if (allowedKeys.includes(e.key)) {
      return; // Allow the default behavior
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
      return; // Allow the default behavior
    }

    // Block all other keys
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters
    const numericValue = e.target.value.replace(/\D/g, '');
    onChange(numericValue);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={handleChange}
      onKeyDown={e => {
        handleKeyDown(e);
        handleInputKeyDown(e);
        onKeyDown?.(e);
      }}
    />
  );
}
