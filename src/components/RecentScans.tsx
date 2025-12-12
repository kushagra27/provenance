'use client';

import { Scan } from '@/lib/types';
import { History, Trash2 } from 'lucide-react';

interface RecentScansProps {
  scans: Scan[];
  onSelectScan: (scan: Scan) => void;
  onClearHistory: () => void;
}

export default function RecentScans({
  scans,
  onSelectScan,
  onClearHistory,
}: RecentScansProps) {
  if (scans.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-md px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            Recent Scans
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {scans.map((scan) => (
          <button
            key={scan.id}
            onClick={() => onSelectScan(scan)}
            className="group relative aspect-square rounded-lg overflow-hidden
                       border border-border hover:border-accent transition-colors"
          >
            <img
              src={scan.imageBase64}
              alt={scan.result.title}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100
                          transition-opacity flex items-center justify-center p-2">
              <span className="text-xs text-center text-foreground font-medium line-clamp-3">
                {scan.result.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
