'use client';

import { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';

const STATUS_MESSAGES = [
  'Analyzing Material Composition...',
  'Querying Historical Archives...',
  'Deconstructing Supply Chain...',
  'Tracing Technological Origins...',
  'Assembling Provenance Data...',
];

interface LoadingStateProps {
  imagePreview?: string;
}

export default function LoadingState({ imagePreview }: LoadingStateProps) {
  const [currentStatus, setCurrentStatus] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Image preview with scanning overlay */}
      {imagePreview && (
        <div className="relative w-48 h-48 mb-8 rounded-xl overflow-hidden">
          <img
            src={imagePreview}
            alt="Scanning"
            className="w-full h-full object-cover"
          />
          {/* Scanning overlay */}
          <div className="absolute inset-0 bg-background/50" />
          {/* Radar sweep effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 radar-sweep"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, var(--accent) 30deg, transparent 60deg)',
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan className="w-12 h-12 text-accent status-blink" />
          </div>
        </div>
      )}

      {/* Radar circles (shown when no image preview) */}
      {!imagePreview && (
        <div className="relative w-48 h-48 mb-8">
          {/* Concentric circles */}
          <div className="absolute inset-0 rounded-full border border-accent/20" />
          <div className="absolute inset-4 rounded-full border border-accent/30" />
          <div className="absolute inset-8 rounded-full border border-accent/40" />
          <div className="absolute inset-12 rounded-full border border-accent/50" />

          {/* Radar sweep */}
          <div
            className="absolute inset-0 radar-sweep rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, var(--accent) 30deg, transparent 60deg)',
              opacity: 0.3,
            }}
          />

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-accent pulse-glow" />
          </div>
        </div>
      )}

      {/* Status message */}
      <p className="text-lg font-mono text-accent status-blink text-center">
        {STATUS_MESSAGES[currentStatus]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {STATUS_MESSAGES.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentStatus ? 'bg-accent' : 'bg-surface-light'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
