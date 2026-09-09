export const viewModes = [
  { id: 'A', name: 'Documentary', description: 'Stay awhile. Let the ocean come to you.' },
  { id: 'B', name: 'Drift', description: 'A continuous, quietly moving dive.' },
  { id: 'C', name: 'Intimate', description: 'Close encounters with room to breathe.' },
  { id: 'D', name: 'Deep', description: 'Open water. A patient descent.' },
  { id: 'explore', name: 'Explore', description: 'Leave the path. Find your own perspective.' },
];
const key = 'pelagic.view.v1';
export function readViewPreferences(storage) {
  let value; try { value = JSON.parse(storage?.getItem(key) || '{}'); } catch { value = {}; }
  if (!value || typeof value !== 'object') value = {};
  return {
    mode: viewModes.some(m => m.id === value.mode) ? value.mode : 'B',
    expanded: value.expanded === true,
    response: ['cinematic','balanced','responsive'].includes(value.response) ? value.response : 'balanced',
  };
}
export function writeViewPreferences(storage, value) {
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Private/blocked storage must not break the ocean. */ }
}
