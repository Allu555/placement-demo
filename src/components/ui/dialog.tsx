import * as React from "react"
import { cn } from "@/core/utils/cn"
import { X } from "lucide-react"

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-lg glass-panel p-6 scale-100 transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none cursor-pointer p-1 rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {title && <h2 className="text-lg font-semibold leading-none tracking-tight mb-4">{title}</h2>}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
