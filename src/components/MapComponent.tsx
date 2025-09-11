'use client';

import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Coordinates, SearchResult, POI } from '@/types';
import { searchOSMPOIs, osmNodeToPOI } from '@/lib/api';

interface MapComponentProps {
  onPointSelect: (coordinates: Coordinates, poi?: POI) => void;
  searchResults: SearchResult[];
  selectedPoint?: Coordinates;
  onMapCenterChange?: (center: { lat: number; lng: number }) => void;
}

export default function MapComponent({ onPointSelect, searchResults, selectedPoint, onMapCenterChange }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const isProgrammaticMove = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!mapTilerApiKey) {
      console.error('MapTiler API key not found');
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/osm-cycling/style.json?key=${mapTilerApiKey}`,
      center: [0, 0], // Default to world center, will be overridden by GPS
      zoom: 2,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Track map center changes (only for user-initiated moves)
    map.current.on('moveend', () => {
      // Only trigger center change if it's not a programmatic move
      if (!isProgrammaticMove.current && onMapCenterChange && map.current) {
        const center = map.current.getCenter();
        onMapCenterChange({
          lat: center.lat,
          lng: center.lng
        });
      }
      // Reset the flag
      isProgrammaticMove.current = false;
    });

    // Handle map clicks
    map.current.on('click', async (e) => {
      const coordinates: Coordinates = {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      };

      // Center map on clicked point
      isProgrammaticMove.current = true;
      map.current?.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 16,
      });

      // Search for existing POIs at this location
      const osmPOIs = await searchOSMPOIs(coordinates);
      const poi = osmPOIs.length > 0 ? osmNodeToPOI(osmPOIs[0]) : undefined;

      onPointSelect(coordinates, poi);
    });

    // Handle long press on mobile
    let pressTimer: NodeJS.Timeout;
    map.current.on('mousedown', () => {
      pressTimer = setTimeout(() => {
        // Long press detected - could add custom behavior here
      }, 500);
    });

    map.current.on('mouseup', () => {
      clearTimeout(pressTimer);
    });

    map.current.on('mouseleave', () => {
      clearTimeout(pressTimer);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onPointSelect]);

  // Center on GPS location on startup (only if no search results)
  useEffect(() => {
    if (isMapLoaded && searchResults.length === 0) {
      centerOnCurrentLocation();
    }
  }, [isMapLoaded, searchResults.length]);

  // Handle search results
  useEffect(() => {
    if (!map.current || !isMapLoaded || searchResults.length === 0) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.search-result-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for search results
    const bounds = new maplibregl.LngLatBounds();
    
    searchResults.forEach((result, index) => {
      const coordinates: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };

      // Extend bounds to include this point
      bounds.extend([coordinates.lng, coordinates.lat]);

      const marker = new maplibregl.Marker({
        element: createSearchResultMarker(result, index),
        anchor: 'bottom',
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current!);

      // Add click handler to marker
      marker.getElement().addEventListener('click', () => {
        onPointSelect(coordinates);
        isProgrammaticMove.current = true;
        map.current?.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 16,
        });
      });
    });

    // Fit map to show all search results
    if (searchResults.length > 1) {
      isProgrammaticMove.current = true;
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } else if (searchResults.length === 1) {
      // Center on single result
      const coordinates: Coordinates = {
        lat: parseFloat(searchResults[0].lat),
        lng: parseFloat(searchResults[0].lon),
      };
      isProgrammaticMove.current = true;
      map.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 16,
      });
    }
  }, [searchResults, isMapLoaded, onPointSelect]);

  // Handle selected point
  useEffect(() => {
    if (!map.current || !isMapLoaded || !selectedPoint) return;

    // Clear existing selected point marker
    const existingSelectedMarker = document.querySelector('.selected-point-marker');
    if (existingSelectedMarker) {
      existingSelectedMarker.remove();
    }

    // Add marker for selected point
    const marker = new maplibregl.Marker({
      element: createSelectedPointMarker(),
      anchor: 'center',
    })
      .setLngLat([selectedPoint.lng, selectedPoint.lat])
      .addTo(map.current);

    // Center map on selected point
    isProgrammaticMove.current = true;
    map.current.flyTo({
      center: [selectedPoint.lng, selectedPoint.lat],
      zoom: 16,
    });
  }, [selectedPoint, isMapLoaded]);

  const createSearchResultMarker = (result: SearchResult, index: number) => {
    const marker = document.createElement('div');
    marker.className = 'search-result-marker';
    marker.innerHTML = `
      <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
        <span class="text-sm font-bold">${index + 1}</span>
      </div>
    `;
    return marker;
  };

  const createSelectedPointMarker = () => {
    const marker = document.createElement('div');
    marker.className = 'selected-point-marker';
    marker.innerHTML = `
      <div class="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>
    `;
    return marker;
  };

  const centerOnCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      // Fallback to a reasonable default location (London)
      if (map.current) {
        isProgrammaticMove.current = true;
        map.current.flyTo({
          center: [-0.1276, 51.5074], // London coordinates
          zoom: 10,
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map.current) {
          isProgrammaticMove.current = true;
          map.current.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 16,
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to a reasonable default location (London) instead of alert
        if (map.current) {
          isProgrammaticMove.current = true;
          map.current.flyTo({
            center: [-0.1276, 51.5074], // London coordinates
            zoom: 10,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-xs text-gray-600">
        © MapTiler © OpenStreetMap contributors
      </div>
    </div>
  );
}