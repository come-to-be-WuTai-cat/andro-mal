import type { StoredScan } from '../../types';

const STORAGE_KEY = 'andromal.scan-history.v1';
const MAX_SCANS = 30;

export function loadScans(): StoredScan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredScan[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_SCANS) : [];
  } catch {
    return [];
  }
}

export function saveScans(scans: StoredScan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans.slice(0, MAX_SCANS)));
  } catch {
    // Storage can be unavailable in private browsing. The in-memory history still works.
  }
}

