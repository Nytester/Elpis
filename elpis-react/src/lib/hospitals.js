// Verified real Ochsner Health locations (addresses confirmed against ochsner.org
// and other sources) — a curated list rather than a live nationwide places API,
// which would require a paid key. Coordinates are resolved at request time via
// geocodeZip(), not hardcoded here.
// `phone` is only set where actually verified — left undefined otherwise
// rather than guessed, since this is real location data shown to patients.
// `shortLabel` is a compact name for the map panel only — full names on a
// tilted 3D grid become wide text boxes that distort badly under the rotation
// (a small dot doesn't have this problem, which is why only the labels broke).
export const HOSPITALS = [
  { name: 'Ochsner Medical Center', shortLabel: 'Medical Center', address: '1514 Jefferson Highway', city: 'Jefferson', state: 'LA', zip: '70121', phone: '504-842-3000' },
  { name: 'Ochsner Baptist', shortLabel: 'Baptist', address: '2700 Napoleon Ave', city: 'New Orleans', state: 'LA', zip: '70115' },
  { name: 'Ochsner Medical Center – Kenner', shortLabel: 'Kenner', address: '180 W Esplanade Ave', city: 'Kenner', state: 'LA', zip: '70065' },
  { name: 'Ochsner Medical Center – Baton Rouge', shortLabel: 'Baton Rouge', address: '17000 Medical Center Drive', city: 'Baton Rouge', state: 'LA', zip: '70816', phone: '225-752-2470' },
];
