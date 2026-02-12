// Center coordinates for Lebanese regions
export const REGION_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  beirut: { lat: 33.8938, lng: 35.5018, name: 'Beirut' },
  mount_lebanon: { lat: 33.8333, lng: 35.6833, name: 'Mount Lebanon' },
  north: { lat: 34.4333, lng: 35.8333, name: 'North Lebanon' },
  south: { lat: 33.2667, lng: 35.2000, name: 'South Lebanon' },
  bekaa: { lat: 33.8500, lng: 35.9000, name: 'Bekaa' },
  nabatieh: { lat: 33.3833, lng: 35.4833, name: 'Nabatieh' },
};

// Lebanon center for default map view
export const LEBANON_CENTER = { lat: 33.8547, lng: 35.8623 };
export const LEBANON_DEFAULT_ZOOM = 8;
