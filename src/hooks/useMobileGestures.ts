import { useState, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface GestureState {
  isPanning: boolean;
  isZooming: boolean;
  lastTouch: TouchPosition;
  initialDistance: number;
}

export const useMobileGestures = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isPanning: false,
    isZooming: false,
    lastTouch: { x: 0, y: 0 },
    initialDistance: 0
  });

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: Touch, touch2: Touch): TouchPosition => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start panning
      setGestureState(prev => ({
        ...prev,
        isPanning: true,
        lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }));
    } else if (e.touches.length === 2) {
      // Two touches - start zooming
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      
      setGestureState(prev => ({
        ...prev,
        isZooming: true,
        isPanning: false,
        initialDistance: distance,
        lastTouch: center
      }));
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent, onPan?: (deltaX: number, deltaY: number) => void, onZoom?: (scale: number, center: TouchPosition) => void) => {
    if (gestureState.isPanning && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - gestureState.lastTouch.x;
      const deltaY = e.touches[0].clientY - gestureState.lastTouch.y;
      
      if (onPan) {
        onPan(deltaX, deltaY);
      }
      
      setGestureState(prev => ({
        ...prev,
        lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }));
    } else if (gestureState.isZooming && e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      const scale = distance / gestureState.initialDistance;
      
      if (onZoom) {
        onZoom(scale, center);
      }
      
      setGestureState(prev => ({
        ...prev,
        lastTouch: center
      }));
    }
  }, [gestureState]);

  const handleTouchEnd = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isPanning: false,
      isZooming: false
    }));
  }, []);

  const handleTouchCancel = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isPanning: false,
      isZooming: false
    }));
  }, []);

  return {
    gestureState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel
  };
};
