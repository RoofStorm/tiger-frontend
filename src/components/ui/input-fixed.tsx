import React from 'react';
import { useInputFix } from '@/hooks/useInputFix';

interface InputFixedProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'textarea';
}

/**
 * Input component with automatic space-after-number fix
 * Use this instead of regular input/textarea when you need to handle
 * the space input issue after numbers
 */
export function InputFixed({
  as: Component = 'input',
  ...props
}: InputFixedProps) {
  const { onKeyDown } = useInputFix();

  return <Component {...props} onKeyDown={onKeyDown} />;
}
