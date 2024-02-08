// import { useEffect, useRef, useState } from "react";

// interface Point {
//   x: number;
//   y: number;
// }

// interface Draw {
//   ctx: CanvasRenderingContext2D;
//   currentPoint: Point;
//   prevPoint: Point | null;
// }

// export const useDraw = (
//   onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
// ) => {
//   const [isDrawing, setIsDrawing] = useState(false);

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const prevPoint = useRef<Point | null>(null);

//   // Separate handlers for mouse and touch to satisfy type requirements
//   const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) =>
//     setIsDrawing(true);
//   const onTouchStart = () => setIsDrawing(true);

//   const clear = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   };

//   const computePointInCanvas = (
//     e: MouseEvent | TouchEvent
//   ): Point | undefined => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const rect = canvas.getBoundingClientRect();
//     let clientX, clientY;

//     if (e instanceof TouchEvent && e.touches.length > 0) {
//       clientX = e.touches[0].clientX;
//       clientY = e.touches[0].clientY;
//     } else if (e instanceof MouseEvent) {
//       clientX = e.clientX;
//       clientY = e.clientY;
//     } else {
//       return;
//     }

//     const x = clientX - rect.left;
//     const y = clientY - rect.top;

//     return { x, y };
//   };

//   useEffect(() => {
//     const moveHandler = (e: MouseEvent | TouchEvent) => {
//       if (!isDrawing) return;

//       e.preventDefault();

//       const currentPoint = computePointInCanvas(e);

//       const ctx = canvasRef.current?.getContext("2d");
//       if (!ctx || !currentPoint) return;

//       onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
//       prevPoint.current = currentPoint;
//     };

//     const endDrawing = () => {
//       setIsDrawing(false);
//       prevPoint.current = null;
//     };

//     const canvas = canvasRef.current;
//     if (canvas) {
//       // Marking the touchstart, touchmove, and touchend event listeners as passive
//       canvas.addEventListener("touchstart", onTouchStart, { passive: true });
//       canvas.addEventListener("touchmove", moveHandler, { passive: false }); // False because you might want to preventDefault in specific cases
//       canvas.addEventListener("touchend", endDrawing, { passive: true });
//     }

//     return () => {
//       if (canvas) {
//         canvas.removeEventListener("touchstart", onTouchStart);
//         canvas.removeEventListener("touchmove", moveHandler);
//         canvas.removeEventListener("touchend", endDrawing);
//       }
//     };
//   }, [onDraw]);

//   return { canvasRef, onMouseDown, clear };
// };

import React, { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface Draw {
  ctx: CanvasRenderingContext2D;
  currentPoint: Point;
  prevPoint: Point | null;
}

export const useDraw = (
  onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPoint = useRef<Point | null>(null);

  // Function to start drawing
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    setIsDrawing(true);
    // Optionally, update the starting point here if necessary
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    // Handle mouse down event
    // console.log("Mouse down");
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    // e.preventDefault(); // Prevent scrolling when touching canvas
    // console.log("Touch start");
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Compute point in canvas (adjusted for both mouse and touch events)
  const computePointInCanvas = (
    e: MouseEvent | TouchEvent
  ): Point | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e instanceof TouchEvent && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      if (e instanceof TouchEvent) e.preventDefault();
      const currentPoint = computePointInCanvas(e);

      const ctx = canvas.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
      prevPoint.current = currentPoint;
    };

    const handleStop = () => {
      setIsDrawing(false);
      prevPoint.current = null;
    };

    // Attach touch event listeners
    // canvas.addEventListener("touchmove", moveHandler);
    // canvas.addEventListener("touchend", endDrawing);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleStop);
    document.addEventListener("touchend", handleStop);
    // Note: onTouchStart is handled via React's onTouchStart prop for consistency with onMouseDown

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleStop);
      document.removeEventListener("touchend", handleStop);
    };
  }, [onDraw]); // Make sure to include all dependencies here

  return { canvasRef, handleMouseDown, handleTouchStart, clear };
};
