import { Scan } from './types';

const STORAGE_KEY = 'provenance_scans';
const MAX_SCANS = 6;

// Check if a scan has the new data format (components instead of ingredients)
function isValidScan(scan: Scan): boolean {
  return !!(
    scan.result &&
    scan.result.components &&
    Array.isArray(scan.result.components) &&
    scan.result.timeline &&
    Array.isArray(scan.result.timeline)
  );
}

export function getRecentScans(): Scan[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const scans = JSON.parse(stored) as Scan[];
    // Filter out old incompatible scans
    const validScans = scans.filter(isValidScan);

    // If we filtered some out, update storage
    if (validScans.length !== scans.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validScans));
    }

    return validScans;
  } catch {
    return [];
  }
}

export function saveScan(scan: Scan): void {
  if (typeof window === 'undefined') return;

  try {
    const scans = getRecentScans();
    // Add new scan at the beginning
    scans.unshift(scan);
    // Keep only the most recent scans
    const trimmedScans = scans.slice(0, MAX_SCANS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedScans));
  } catch (error) {
    console.error('Failed to save scan:', error);
  }
}

export function clearScans(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear scans:', error);
  }
}
