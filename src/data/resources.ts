import { Resource } from '../types';

// Added `category` to demonstrate query param filtering and
// optionally `bookedBy` to demonstrate availability.
export const initialResources: Resource[] = [
  { id: 'microscope', name: 'Microscope', emoji: '🔬', category: 'Electronics' },
  { id: 'printer-3d', name: '3D Printer', emoji: '🖨️', category: 'Electronics' },
  { id: 'meeting-room', name: 'Meeting Room', emoji: '🏢', category: 'Room' },
];
