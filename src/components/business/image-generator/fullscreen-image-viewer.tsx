"use client";

import { useEffect, useRef } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FullscreenImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export function FullscreenImageViewer({
  imageUrl,
  onClose,
}: FullscreenImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // 阻止滚动
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleCloseFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 只在点击背景色区域时关闭（不是点击图像）
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-black/90"
      style={{ zIndex: 99999 }}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <img
          src={imageUrl}
          alt="Fullscreen"
          className="max-h-screen max-w-screen"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseFullscreen}
          className="absolute top-4 right-4 cursor-pointer rounded-lg bg-black/50 p-2 transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
