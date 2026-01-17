export const CAROUSEL_CONFIG = {
  desktop: {
    centerWidth: 320,
    sideWidth: 288,
    outerWidth: 224,
    centerScale: 1.12,
    sideScale: 0.94,
    outerScale: 0.8,
    translateAdjacent: 260,
    translateOuter: 210,
    maxVisibleRange: 2,
  },
  mobile: {
    centerWidth: 256,
    sideWidth: 224,
    outerWidth: 224,
    centerScale: 1.0,
    sideScale: 0.85,
    outerScale: 0.85,
    translateAdjacent: 140,
    translateOuter: 0,
    maxVisibleRange: 1,
  },
  animation: {
    transitionDuration: 500,
    autoPlayInterval: 5000,
    springStiffness: 220,
    springDamping: 22,
    hoverScale: 1.15,
    hoverScaleSide: 0.9,
  },
  fetch: {
    visibleThreshold: {
      desktop: 2,
      mobile: 1,
    },
    bufferSize: 3,
    pageSize: 10,
    minPostsRequired: 5,
  },
  swipe: {
    minSwipeDistance: 50,
  },
} as const;

