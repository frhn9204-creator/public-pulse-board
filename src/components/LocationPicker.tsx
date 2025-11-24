import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// Fix Leaflet default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export const LocationPicker = ({
  open,
  onOpenChange,
  onLocationSelect,
  initialLat = 20.5937,
  initialLng = 78.9629,
}: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch Geoapify API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        const data = await response.json();
        setApiKey(data.primaryKey);
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    if (open) {
      fetchApiKey();
    }
  }, [open]);

  // Initialize map
  useEffect(() => {
    if (!open || !mapContainer.current || !apiKey || map.current) return;

    // Wait for dialog animation to complete before initializing map
    const initTimer = setTimeout(() => {
      if (!mapContainer.current) return;

      map.current = L.map(mapContainer.current).setView([initialLat, initialLng], 5);

      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        {
          attribution: '© OpenStreetMap contributors | © Geoapify',
          maxZoom: 20,
        }
      ).addTo(map.current);

      // Recalculate map size after tiles start loading
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
        }
      }, 100);

      // Add click handler
      if (map.current) {
        map.current.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;

          // Remove existing marker if any
          if (marker.current) {
            marker.current.remove();
          }

          // Add new marker
          marker.current = L.marker([lat, lng]).addTo(map.current!);

          // Zoom to marker
          map.current!.setView([lat, lng], 16);

          // Update coordinates
          onLocationSelect(lat, lng);
        });
      }
    }, 400);

    return () => {
      clearTimeout(initTimer);
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [open, apiKey, initialLat, initialLng, onLocationSelect]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pick Location on Map
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click anywhere on the map to select a location. The coordinates will be automatically filled in the form.
          </p>
          <div
            ref={mapContainer}
            className="w-full h-[400px] rounded-md border"
          />
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
