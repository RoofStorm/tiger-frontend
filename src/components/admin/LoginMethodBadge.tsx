import React from 'react';

interface LoginMethodBadgeProps {
  method: string;
}

export const LoginMethodBadge: React.FC<LoginMethodBadgeProps> = ({
  method,
}) => {
  const getLoginMethodInfo = (loginMethod: string) => {
    switch (loginMethod) {
      case 'GOOGLE':
        return {
          label: 'Google',
          className: 'bg-red-100 text-red-800',
          emoji: '🔴',
        };
      case 'FACEBOOK':
        return {
          label: 'Facebook',
          className: 'bg-blue-100 text-blue-800',
          emoji: '🔵',
        };
      case 'LOCAL':
      default:
        return {
          label: 'Local',
          className: 'bg-gray-100 text-gray-800',
          emoji: '⚪',
        };
    }
  };

  const { label, className, emoji } = getLoginMethodInfo(method);

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${className}`}
    >
      <span className="text-xs">{emoji}</span>
      <span>{label}</span>
    </span>
  );
};
