'use client';

import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface ScanButtonProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ScanButton({ onImageSelect, disabled }: ScanButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring */}
      <div className="absolute w-40 h-40 rounded-full border-2 border-accent pulse-ring" />

      {/* Middle ring */}
      <div className="absolute w-36 h-36 rounded-full border border-accent/30" />

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className="relative w-32 h-32 rounded-full bg-surface border-2 border-accent
                   flex flex-col items-center justify-center gap-2
                   pulse-glow transition-all duration-300
                   hover:bg-surface-light hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Camera className="w-10 h-10 text-accent" />
        <span className="text-sm font-medium text-accent">Scan Object</span>
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
