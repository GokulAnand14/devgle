import { useState, useEffect, useCallback, useRef } from "react";

interface Size {
    width: number;
    height: number;
}

interface ResizeOptions {
    initialSize?: Size;
    minSize?: Size;
    maxSize?: Size;
    aspectRatio?: boolean;
}

export function useResizable({
    initialSize = { width: 320, height: 180 },
    minSize = { width: 160, height: 90 },
    maxSize = { width: 800, height: 450 },
    aspectRatio = false
}: ResizeOptions = {}) {
    const [size, setSize] = useState<Size>(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<{
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    } | null>(null);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        setIsResizing(true);
        resizeRef.current = {
            startX: clientX,
            startY: clientY,
            startWidth: size.width,
            startHeight: size.height
        };
    }, [size]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent drag from starting
        handleStart(e.clientX, e.clientY);
    }, [handleStart]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    }, [handleStart]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isResizing || !resizeRef.current) return;

        const deltaX = clientX - resizeRef.current.startX;
        const deltaY = clientY - resizeRef.current.startY;

        let newWidth = resizeRef.current.startWidth + deltaX;
        let newHeight = resizeRef.current.startHeight + deltaY;

        // Aspect Ratio
        if (aspectRatio) {
            const ratio = initialSize.width / initialSize.height;
            newHeight = newWidth / ratio;
        }

        // Constraints
        newWidth = Math.max(minSize.width, Math.min(maxSize.width, newWidth));
        newHeight = Math.max(minSize.height, Math.min(maxSize.height, newHeight));

        setSize({ width: newWidth, height: newHeight });
    }, [isResizing, minSize, maxSize, aspectRatio, initialSize]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
    }, [handleMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, [handleMove]);

    const handleEnd = useCallback(() => {
        setIsResizing(false);
        resizeRef.current = null;
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isResizing, handleMouseMove, handleTouchMove, handleEnd]);

    return {
        size,
        isResizing,
        resizeHandleProps: {
            onMouseDown: handleMouseDown,
            onTouchStart: handleTouchStart
        },
        elementRef
    };
}
