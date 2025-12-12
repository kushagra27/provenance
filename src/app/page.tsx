'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import ScanButton from '@/components/ScanButton';
import LoadingState from '@/components/LoadingState';
import ResultsView from '@/components/ResultsView';
import RecentScans from '@/components/RecentScans';
import { ProvenanceResult, Scan } from '@/lib/types';
import { compressImage, generateId } from '@/lib/imageUtils';
import { getRecentScans, saveScan, clearScans } from '@/lib/storage';

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ProvenanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);

  // Load recent scans on mount
  useEffect(() => {
    setRecentScans(getRecentScans());
  }, []);

  const handleImageSelect = async (file: File) => {
    setAppState('loading');
    setError(null);

    try {
      // Compress the image
      const compressedImage = await compressImage(file);
      setCurrentImage(compressedImage);

      // Send to API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: compressedImage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const result: ProvenanceResult = await response.json();
      setCurrentResult(result);

      // Save to history
      const scan: Scan = {
        id: generateId(),
        timestamp: Date.now(),
        imageBase64: compressedImage,
        result,
      };
      saveScan(scan);
      setRecentScans(getRecentScans());

      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('error');
    }
  };

  const handleSelectScan = (scan: Scan) => {
    setCurrentImage(scan.imageBase64);
    setCurrentResult(scan.result);
    setAppState('results');
  };

  const handleScanAgain = () => {
    setAppState('idle');
    setCurrentImage(null);
    setCurrentResult(null);
    setError(null);
  };

  const handleClearHistory = () => {
    clearScans();
    setRecentScans([]);
  };

  const handleRetry = () => {
    setAppState('idle');
    setError(null);
  };

  return (
    <main className="min-h-dvh bg-background">
      {/* Header */}
      {appState !== 'results' && (
        <header className="pt-12 pb-8 px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Provenance</h1>
          <p className="text-foreground/60 text-sm">
            Discover the history behind everyday objects
          </p>
        </header>
      )}

      {/* Main Content */}
      {appState === 'idle' && (
        <div className="flex flex-col items-center gap-12 px-4">
          <div className="flex-1 flex items-center justify-center py-8">
            <ScanButton onImageSelect={handleImageSelect} />
          </div>
          <RecentScans
            scans={recentScans}
            onSelectScan={handleSelectScan}
            onClearHistory={handleClearHistory}
          />
        </div>
      )}

      {appState === 'loading' && (
        <LoadingState imagePreview={currentImage || undefined} />
      )}

      {appState === 'results' && currentResult && currentImage && (
        <ResultsView
          result={currentResult}
          imageBase64={currentImage}
          onScanAgain={handleScanAgain}
        />
      )}

      {appState === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Analysis Failed
          </h2>
          <p className="text-foreground/70 mb-6 max-w-xs">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-accent text-background font-semibold rounded-full
                     hover:bg-accent-light transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </main>
  );
}
