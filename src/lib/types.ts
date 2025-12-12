export interface TimelineEvent {
  year: string;
  event: string;
  description: string;
}

export interface Component {
  name: string;
  connectsAtYear: string; // Which year in main timeline this component branches from
  history: TimelineEvent[]; // 2 events initially, more after expansion
}

export interface ProvenanceResult {
  title: string;
  summary: string;
  timeline: TimelineEvent[]; // Main object timeline (4 events, recent first)
  components: Component[]; // Components with their history branches
}

export interface ComponentDetailResult {
  name: string;
  history: TimelineEvent[]; // Expanded history (4-6 events)
}

export interface Scan {
  id: string;
  timestamp: number;
  imageBase64: string;
  result: ProvenanceResult;
}

// Branch colors for components
export const BRANCH_COLORS = [
  { name: 'cyan', primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)' },
  { name: 'purple', primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' },
  { name: 'emerald', primary: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  { name: 'rose', primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)' },
  { name: 'blue', primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
];
