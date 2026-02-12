import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { REGION_COORDINATES, LEBANON_CENTER, LEBANON_DEFAULT_ZOOM } from '@/lib/regionCoordinates';
import { MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for the current vendor (highlighted)
const currentVendorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for similar vendors
const similarVendorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Vendor {
  id: string;
  business_name: string;
  region: string;
  category: string;
  starting_price_usd: number | null;
  cover_image_url: string | null;
}

interface VendorLocationMapProps {
  currentVendor: Vendor;
  category: string;
}

export function VendorLocationMap({ currentVendor, category }: VendorLocationMapProps) {
  const [similarVendors, setSimilarVendors] = useState<Vendor[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilarVendors() {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, region, category, starting_price_usd, cover_image_url')
        .eq('category', category as any)
        .eq('status', 'approved')
        .neq('id', currentVendor.id)
        .limit(20);

      if (!error && data) {
        setSimilarVendors(data);
      }
      setLoading(false);
    }

    fetchSimilarVendors();
  }, [category, currentVendor.id]);

  const currentCoords = REGION_COORDINATES[currentVendor.region];
  
  if (!currentCoords) {
    return null;
  }

  // Add slight offset to markers in the same region to prevent overlap
  const getOffsetPosition = (region: string, index: number): [number, number] => {
    const coords = REGION_COORDINATES[region];
    if (!coords) return [LEBANON_CENTER.lat, LEBANON_CENTER.lng];
    
    // Create a slight random offset based on index
    const offsetLat = (Math.sin(index * 2.5) * 0.02);
    const offsetLng = (Math.cos(index * 3.7) * 0.02);
    
    return [coords.lat + offsetLat, coords.lng + offsetLng];
  };

  const allPositions: [number, number][] = [
    [currentCoords.lat, currentCoords.lng],
    ...similarVendors
      .filter(v => REGION_COORDINATES[v.region])
      .map((v, i) => getOffsetPosition(v.region, i)),
  ];

  const formatPrice = (price: number | null) => {
    if (!price) return 'Contact for pricing';
    return `From $${price.toLocaleString()}`;
  };

  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Location & Similar Venues</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {currentCoords.name} • {similarVendors.length} similar venues nearby
        </p>
      </div>
      
      <div className="h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <MapContainer
            center={[currentCoords.lat, currentCoords.lng]}
            zoom={LEBANON_DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            ref={(map) => {
              if (map && allPositions.length > 0) {
                const bounds = L.latLngBounds(allPositions.map(p => L.latLng(p[0], p[1])));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
              }
            }}
          >
            <TileLayer
              attribution=""
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* Current vendor marker */}
            <Marker 
              position={[currentCoords.lat, currentCoords.lng]} 
              icon={currentVendorIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-primary">{currentVendor.business_name}</p>
                  <p className="text-sm text-muted-foreground">{currentCoords.name}</p>
                  <p className="text-sm font-medium mt-1">You are viewing this venue</p>
                </div>
              </Popup>
            </Marker>

            {/* Similar vendors markers */}
            {similarVendors.map((vendor, index) => {
              const coords = REGION_COORDINATES[vendor.region];
              if (!coords) return null;
              
              const position = getOffsetPosition(vendor.region, index);
              
              return (
                <Marker 
                  key={vendor.id} 
                  position={position}
                  icon={similarVendorIcon}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      {vendor.cover_image_url && (
                        <img 
                          src={vendor.cover_image_url} 
                          alt={vendor.business_name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <p className="font-semibold">{vendor.business_name}</p>
                      <p className="text-sm text-muted-foreground">{coords.name}</p>
                      <p className="text-sm font-medium mt-1">{formatPrice(vendor.starting_price_usd)}</p>
                      <Link 
                        to={`/vendors/${vendor.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                      >
                        View Details <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive" />
          <span>Current venue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span>Similar venues</span>
        </div>
      </div>
    </div>
  );
}
