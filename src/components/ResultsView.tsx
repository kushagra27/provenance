'use client';

import { ProvenanceResult, TimelineEvent } from '@/lib/types';
import { RotateCcw, GitBranch } from 'lucide-react';
import ProvenanceTree from './ProvenanceTree';

interface ResultsViewProps {
  result: ProvenanceResult;
  imageBase64: string;
  onScanAgain: () => void;
}

export default function ResultsView({
  result,
  imageBase64,
  onScanAgain,
}: ResultsViewProps) {
  const handleExpandComponent = async (componentName: string): Promise<TimelineEvent[]> => {
    const response = await fetch('/api/expand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        componentName,
        objectTitle: result.title,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to expand component');
    }

    const data = await response.json();
    return data.history;
  };

  return (
    <div className="pb-24 min-h-dvh">
      {/* Image header with gradient fade */}
      <div className="relative h-56">
        <img
          src={imageBase64}
          alt={result.title}
          className="w-full h-full object-cover"
        />
        <div className="image-gradient absolute inset-0" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl font-bold text-foreground mb-1.5 drop-shadow-lg">
            {result.title}
          </h1>
          <p className="text-foreground/90 italic text-sm leading-relaxed drop-shadow">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Section header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            Origin Tree
          </h2>
        </div>
        <p className="text-xs text-foreground/50 mt-1">
          Tap components to explore their history
        </p>
      </div>

      {/* Provenance Tree */}
      <ProvenanceTree
        result={result}
        objectTitle={result.title}
        onExpandComponent={handleExpandComponent}
      />

      {/* Floating Scan Again button */}
      <button
        onClick={onScanAgain}
        className="fixed bottom-6 left-1/2 -translate-x-1/2
                   flex items-center gap-2 px-6 py-3
                   bg-accent text-background font-semibold rounded-full
                   shadow-lg shadow-accent/30
                   hover:bg-accent-light transition-colors
                   active:scale-95"
      >
        <RotateCcw className="w-5 h-5" />
        Scan Again
      </button>
    </div>
  );
}
