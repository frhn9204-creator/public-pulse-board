import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '@/hooks/useIssues';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MapProps {
  issues: Issue[];
}

const Map: React.FC<MapProps> = ({ issues }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Geoapify token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.primaryKey) {
          setApiKey(data.primaryKey);
        } else if (data?.secondaryKey) {
          setApiKey(data.secondaryKey);
        }
      } catch (error) {
        console.error('Failed to fetch Geoapify API key:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || !apiKey) return;

    // Initialize map with Leaflet and Geoapify tiles
    map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5);

    // Add Geoapify tiles
    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
      {
        attribution: '© OpenStreetMap contributors | © Geoapify',
        maxZoom: 20,
      }
    ).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter issues that have coordinates
    const issuesWithCoordinates = issues.filter(
      issue => issue.latitude && issue.longitude
    );

    // Add markers for each issue
    issuesWithCoordinates.forEach((issue) => {
      const urgencyColors: Record<string, string> = {
        low: '#22c55e',
        medium: '#eab308',
        high: '#f97316',
        critical: '#ef4444',
      };

      const color = urgencyColors[issue.urgency || 'medium'];

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Create marker
      const marker = L.marker([issue.latitude!, issue.longitude!], { icon })
        .addTo(map.current!);

      // Add click handler
      marker.on('click', () => {
        setSelectedIssue(issue);
        map.current?.flyTo([issue.latitude!, issue.longitude!], 12, {
          duration: 1,
        });
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (issuesWithCoordinates.length > 0) {
      const bounds = L.latLngBounds(
        issuesWithCoordinates.map(issue => [issue.latitude!, issue.longitude!])
      );
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [issues, apiKey]);

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'bg-success',
      medium: 'bg-warning',
      high: 'bg-orange-500',
      critical: 'bg-destructive',
    };
    return colors[urgency as keyof typeof colors] || 'bg-warning';
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Failed to load map. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {selectedIssue && (
        <Card className="absolute top-4 left-4 z-[1000] w-80 p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-2">{selectedIssue.title}</h3>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{selectedIssue.category}</Badge>
              <Badge className={getUrgencyColor(selectedIssue.urgency || 'medium')}>
                {selectedIssue.urgency}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {selectedIssue.description}
            </p>

            <div className="text-xs text-muted-foreground">
              {selectedIssue.organization} • {selectedIssue.location}
            </div>

            <button
              onClick={() => navigate(`/issues/${selectedIssue.id}`)}
              className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 z-[1000] p-3 shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Urgency Levels</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Critical</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Map;
