"use client";

import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownPortalProps {
  trigger: (props: { ref: React.RefObject<HTMLButtonElement | null>; open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  width?: number;
  align?: "left" | "right";
}

export function DropdownPortal({ trigger, children, width = 320, align = "right" }: DropdownPortalProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setPos({ top: rect.bottom + 8, left });
  }, [width, align]);

  const toggle = () => {
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-xl border border-gray-200 shadow-2xl z-[9999]"
      style={{ top: pos.top, left: pos.left, width }}
    >
      {typeof children === "function" ? children(close) : children}
    </div>
  ) : null;

  return (
    <>
      {trigger({ ref: triggerRef, open, toggle })}
      {typeof document !== "undefined" && menu && createPortal(menu, document.body)}
    </>
  );
}
