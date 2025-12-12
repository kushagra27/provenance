'use client';

import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { ProvenanceResult, Component, TimelineEvent, BRANCH_COLORS } from '@/lib/types';

interface ProvenanceTreeProps {
  result: ProvenanceResult;
  objectTitle: string;
  onExpandComponent: (componentName: string) => Promise<TimelineEvent[]>;
}

interface ExpandedState {
  [key: string]: {
    loading: boolean;
    expanded: boolean;
    history?: TimelineEvent[];
  };
}

export default function ProvenanceTree({
  result,
  objectTitle,
  onExpandComponent,
}: ProvenanceTreeProps) {
  const [expandedComponents, setExpandedComponents] = useState<ExpandedState>({});

  const handleExpandComponent = async (componentName: string) => {
    const current = expandedComponents[componentName];

    // If already expanded, collapse it
    if (current?.expanded) {
      setExpandedComponents((prev) => ({
        ...prev,
        [componentName]: { ...prev[componentName], expanded: false },
      }));
      return;
    }

    // If we already have the data, just expand
    if (current?.history) {
      setExpandedComponents((prev) => ({
        ...prev,
        [componentName]: { ...prev[componentName], expanded: true },
      }));
      return;
    }

    // Fetch expanded history
    setExpandedComponents((prev) => ({
      ...prev,
      [componentName]: { loading: true, expanded: false },
    }));

    try {
      const history = await onExpandComponent(componentName);
      setExpandedComponents((prev) => ({
        ...prev,
        [componentName]: { loading: false, expanded: true, history },
      }));
    } catch {
      setExpandedComponents((prev) => ({
        ...prev,
        [componentName]: { loading: false, expanded: false },
      }));
    }
  };

  // Safely access components (handles old data format)
  const components = result.components || [];

  // Find which components connect at which timeline events
  const getComponentsAtYear = (year: string): Component[] => {
    return components.filter((c) => c.connectsAtYear === year);
  };

  return (
    <div className="relative px-4 py-6">
      {/* Main Timeline */}
      <div className="relative">
        {result.timeline.map((event, index) => {
          const componentsAtYear = getComponentsAtYear(event.year);
          const isLast = index === result.timeline.length - 1;

          return (
            <div key={index} className="relative">
              {/* Main timeline node and content */}
              <div className="flex gap-4">
                {/* Left side: Timeline line and node */}
                <div className="flex flex-col items-center w-12 flex-shrink-0">
                  {/* Node */}
                  <div className="w-4 h-4 rounded-full bg-accent border-2 border-background z-10 shadow-lg shadow-accent/30" />
                  {/* Connecting line to next event */}
                  {!isLast && (
                    <div className="w-0.5 flex-1 min-h-16 bg-gradient-to-b from-accent to-accent/50" />
                  )}
                </div>

                {/* Right side: Event content */}
                <div className="flex-1 pb-8">
                  <div className="bg-surface/80 backdrop-blur rounded-xl p-4 border border-border/50 transition-all duration-300 hover:border-accent/30">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-accent font-mono font-bold text-lg">
                        {event.year}
                      </span>
                    </div>
                    <h3 className="text-foreground font-semibold mb-1">
                      {event.event}
                    </h3>
                    <p className="text-sm text-foreground/60">{event.description}</p>
                  </div>

                  {/* Component branches at this year */}
                  {componentsAtYear.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {componentsAtYear.map((component, cIndex) => {
                        const colorIndex = components.indexOf(component) % BRANCH_COLORS.length;
                        const color = BRANCH_COLORS[colorIndex];
                        const expanded = expandedComponents[component.name];

                        return (
                          <ComponentBranch
                            key={cIndex}
                            component={component}
                            color={color}
                            expanded={expanded}
                            objectTitle={objectTitle}
                            onExpand={() => handleExpandComponent(component.name)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ComponentBranchProps {
  component: Component;
  color: { name: string; primary: string; glow: string };
  expanded?: {
    loading: boolean;
    expanded: boolean;
    history?: TimelineEvent[];
  };
  objectTitle: string;
  onExpand: () => void;
}

function ComponentBranch({
  component,
  color,
  expanded,
  onExpand,
}: ComponentBranchProps) {
  const displayHistory = expanded?.expanded && expanded.history
    ? expanded.history
    : component.history;

  return (
    <div className="relative pl-4">
      {/* Curved branch connector */}
      <svg
        className="absolute -left-8 top-0 w-12 h-12 overflow-visible"
        style={{ transform: 'translateY(-4px)' }}
      >
        <path
          d={`M 24 0 Q 24 24, 48 24`}
          fill="none"
          stroke={color.primary}
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-60"
        />
      </svg>

      {/* Branch content */}
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${color.primary}10 0%, transparent 50%)`,
          borderLeft: `3px solid ${color.primary}`,
        }}
      >
        {/* Component header */}
        <button
          onClick={onExpand}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color.primary, boxShadow: `0 0 10px ${color.glow}` }}
            />
            <span className="font-semibold text-foreground">{component.name}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/50">
            {expanded?.loading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: color.primary }} />
            ) : (
              <>
                <span className="text-xs">
                  {expanded?.expanded ? 'Collapse' : 'Expand'}
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-300"
                  style={{
                    transform: expanded?.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: color.primary,
                  }}
                />
              </>
            )}
          </div>
        </button>

        {/* Component timeline */}
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: expanded?.expanded ? '1000px' : '160px',
          }}
        >
          <div className="px-4 pb-4">
            {displayHistory.map((event, eIndex) => (
              <div key={eIndex} className="flex gap-3 mb-3 last:mb-0">
                {/* Mini timeline */}
                <div className="flex flex-col items-center w-6 flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  />
                  {eIndex < displayHistory.length - 1 && (
                    <div
                      className="w-0.5 flex-1 min-h-8"
                      style={{ backgroundColor: `${color.primary}40` }}
                    />
                  )}
                </div>
                {/* Event content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: color.primary }}
                    >
                      {event.year}
                    </span>
                    <span className="text-sm text-foreground/80">{event.event}</span>
                  </div>
                  <p className="text-xs text-foreground/50 mt-0.5">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
