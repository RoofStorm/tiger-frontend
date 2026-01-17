/**
 * Skeleton loading card for grid
 * Shows while fetching new posts
 */
export function SkeletonCard() {
  return (
    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-200 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
    </div>
  );
}

