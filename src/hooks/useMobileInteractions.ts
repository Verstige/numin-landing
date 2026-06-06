import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface MobileInteractionState {
  isScrolling: boolean;
  isDragging: boolean;
  isZooming: boolean;
  lastTouchTime: number;
  touchCount: number;
}

export const useMobileInteractions = () => {
  const isMobile = useIsMobile();
  const [interactionState, setInteractionState] = useState<MobileInteractionState>({
    isScrolling: false,
    isDragging: false,
    isZooming: false,
    lastTouchTime: 0,
    touchCount: 0
  });

  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll-based bottom nav visibility
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (scrollDelta > 5 && currentScrollY > 100) {
        // Scrolling down - hide bottom nav
        setIsBottomNavVisible(false);
      } else if (scrollDelta < -5) {
        // Scrolling up - show bottom nav
        setIsBottomNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollY]);

  // Handle touch interactions
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touchCount = e.touches.length;
    const currentTime = Date.now();
    
    setInteractionState(prev => ({
      ...prev,
      touchCount,
      lastTouchTime: currentTime,
      isDragging: touchCount === 1,
      isZooming: touchCount === 2
    }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setInteractionState(prev => ({
        ...prev,
        isScrolling: true,
        isDragging: true
      }));
    } else if (e.touches.length === 2) {
      setInteractionState(prev => ({
        ...prev,
        isZooming: true,
        isDragging: false
      }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      isScrolling: false,
      isDragging: false,
      isZooming: false,
      touchCount: 0
    }));
  }, []);

  // Handle double tap
  const handleDoubleTap = useCallback((callback: () => void) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - interactionState.lastTouchTime;
    
    if (timeDiff < 300) {
      callback();
    }
  }, [interactionState.lastTouchTime]);

  // Handle long press
  const handleLongPress = useCallback((callback: () => void, delay: number = 500) => {
    let timeoutId: NodeJS.Timeout;
    
    const startLongPress = () => {
      timeoutId = setTimeout(callback, delay);
    };
    
    const cancelLongPress = () => {
      clearTimeout(timeoutId);
    };
    
    return { startLongPress, cancelLongPress };
  }, []);

  // Handle swipe gestures
  const handleSwipe = useCallback((
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void
  ) => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const touchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const touchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;
      
      if (deltaTime < maxSwipeTime) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (deltaX < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && onSwipeDown) {
              onSwipeDown();
            } else if (deltaY < 0 && onSwipeUp) {
              onSwipeUp();
            }
          }
        }
      }
    };

    return { touchStart, touchEnd };
  }, []);

  // Handle pull-to-refresh
  const handlePullToRefresh = useCallback((callback: () => void) => {
    let startY = 0;
    let isPulling = false;
    const threshold = 100;

    const touchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isPulling = window.scrollY === 0;
    };

    const touchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > threshold) {
        callback();
        isPulling = false;
      }
    };

    return { touchStart, touchMove };
  }, []);

  // Handle keyboard shortcuts for mobile
  const handleMobileKeyboard = useCallback((callback: (key: string) => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobile) {
        // Mobile-specific keyboard shortcuts
        switch (e.key) {
          case 'Escape':
            callback('escape');
            break;
          case 'Enter':
            callback('enter');
            break;
          case ' ':
            e.preventDefault();
            callback('space');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  return {
    isMobile,
    interactionState,
    isBottomNavVisible,
    setIsBottomNavVisible,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleTap,
    handleLongPress,
    handleSwipe,
    handlePullToRefresh,
    handleMobileKeyboard
  };
};
