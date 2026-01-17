interface HeartIconProps {
  isLiked: boolean;
}

/**
 * Reusable heart icon component
 * Extracted from inline SVG to improve maintainability
 */
export function HeartIcon({ isLiked }: HeartIconProps) {
  const fillColor = isLiked ? '#EF4444' : 'none';
  const strokeColor = isLiked ? '#EF4444' : 'white';

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-200"
    >
      <path
        d="M15.775 26.0125C15.35 26.1625 14.65 26.1625 14.225 26.0125C10.6 24.775 2.5 19.6125 2.5 10.8625C2.5 7 5.6125 3.875 9.45 3.875C11.725 3.875 13.7375 4.975 15 6.675C16.2625 4.975 18.2875 3.875 20.55 3.875C24.3875 3.875 27.5 7 27.5 10.8625C27.5 19.6125 19.4 24.775 15.775 26.0125Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

