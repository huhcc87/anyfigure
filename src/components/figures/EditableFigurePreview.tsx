"use client";

import { memo, useEffect, useRef } from "react";

interface EditableFigurePreviewProps {
  svgContent: string;
  canvasWidth: number;
  canvasHeight: number;
  className?: string;
}

/** Renders stored SVG using the same viewBox as text_nodes — guarantees overlay alignment. */
export const EditableFigurePreview = memo(function EditableFigurePreview({
  svgContent,
  canvasWidth,
  canvasHeight,
  className = "",
}: EditableFigurePreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lastSvgRef = useRef("");

  useEffect(() => {
    const host = hostRef.current;
    if (!host || svgContent === lastSvgRef.current) return;
    host.innerHTML = svgContent.replace(/<\?xml[^?]*\?>/, "");
    lastSvgRef.current = svgContent;
  }, [svgContent]);

  return (
    <div
      className={`w-full ${className}`}
      style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
    >
      <div
        ref={hostRef}
        className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
      />
    </div>
  );
});
