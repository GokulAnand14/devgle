import { useState, useEffect, useCallback, useRef } from "react";

interface Position {
    x: number;
    y: number;
}

interface DragOptions {
    initialPosition?: Position;
    snapThreshold?: number;
    gridSize?: number;
    headerHeight?: number;
    bounds?: { left: number; top: number; right: number; bottom: number };
}

export function useDraggable({
    initialPosition = { x: 20, y: 80 },
    snapThreshold = 15,
    gridSize = 20,
    headerHeight = 60,
}: DragOptions = {}) {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // We store the initial click offset relative to the element
    const dragRef = useRef<{
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
        offsetX: number;
        offsetY: number;
    } | null>(null);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        setIsDragging(true);
        dragRef.current = {
            startX: clientX,
            startY: clientY,
            initialX: position.x,
            initialY: position.y,
            offsetX: clientX - position.x,
            offsetY: clientY - position.y
        };
    }, [position]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only left click
        if (e.button !== 0) return;
        handleStart(e.clientX, e.clientY);
    }, [handleStart]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    }, [handleStart]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging || !dragRef.current) return;

        let newX = clientX - dragRef.current.offsetX;
        let newY = clientY - dragRef.current.offsetY;

        // 1. Boundary Constraints
        let elementWidth = 200; // Fallback
        let elementHeight = 40; // Fallback

        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            elementWidth = rect.width;
            elementHeight = rect.height;
        }

        const maxX = window.innerWidth - elementWidth;
        const maxY = window.innerHeight - elementHeight;

        // Strict containment
        newX = Math.max(0, Math.min(maxX, newX));
        newY = Math.max(headerHeight, Math.min(maxY, newY)); // Respect header top offset

        // 2. Snapping Logic
        if (Math.abs(newX) < snapThreshold) newX = 0;
        if (Math.abs(newX - maxX) < snapThreshold) newX = maxX;
        if (Math.abs(newY - headerHeight) < snapThreshold) newY = headerHeight;
        if (Math.abs(newY - maxY) < snapThreshold) newY = maxY;

        setPosition({ x: newX, y: newY });
    }, [isDragging, headerHeight, snapThreshold]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
    }, [handleMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, [handleMove]);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
        dragRef.current = null;
    }, []);

    useEffect(() => {
        if (isDragging) {
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
    }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

    return {
        position,
        isDragging,
        handleMouseDown,
        handleTouchStart,
        elementRef
    };
}
