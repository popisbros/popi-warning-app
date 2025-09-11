'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Coordinates, SearchResult, POI } from '@/types';
import { searchOSMPOIs, osmNodeToPOI } from '@/lib/api';

interface MapComponentProps {
  onPointSelect: (coordinates: Coordinates, poi?: POI) => void;
  searchResults: SearchResult[];
  selectedPoint?: Coordinates;
  onMapCenterChange?: (center: { lat: number; lng: number }) => void;
  centerOnCoordinates?: Coordinates | null;
  onCenterComplete?: () => void;
  debugPanelOpen?: boolean;
}

export default function MapComponent({ onPointSelect, searchResults, selectedPoint, onMapCenterChange, centerOnCoordinates, onCenterComplete, debugPanelOpen }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasCenteredOnStartup, setHasCenteredOnStartup] = useState(false);

  const centerOnCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      // Fallback to world view
      if (map.current) {
        map.current.flyTo({
          center: [0, 0],
          zoom: 2,
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
          map.current.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 16,
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to world view
        if (map.current) {
          map.current.flyTo({
            center: [0, 0],
            zoom: 2,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!mapTilerApiKey) {
      console.error('MapTiler API key not found');
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${mapTilerApiKey}`,
      center: [0, 0], // Default to world center
      zoom: 2,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Track map center changes
    map.current.on('moveend', () => {
      if (onMapCenterChange && map.current) {
        const center = map.current.getCenter();
        onMapCenterChange({
          lat: center.lat,
          lng: center.lng
        });
      }
    });

    // Handle map interactions - both mouse clicks and touch events
    let touchStartTime = 0;
    let touchStartPos: { lat: number; lng: number } | null = null;
    let isDragging = false;

    // Handle touch start
    map.current.on('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartPos = {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      };
      isDragging = false;
      console.log('MapComponent: Touch start at:', touchStartPos);
    });

    // Handle touch move (indicates dragging)
    map.current.on('touchmove', () => {
      isDragging = true;
      console.log('MapComponent: Touch move detected - dragging');
    });

    // Handle touch end
    map.current.on('touchend', async (e) => {
      const touchDuration = Date.now() - touchStartTime;
      console.log('MapComponent: Touch end, duration:', touchDuration, 'isDragging:', isDragging);

      // Only handle as intentional tap if:
      // 1. Touch duration is short (< 500ms)
      // 2. Not dragging
      // 3. Touch position hasn't moved much
      if (touchDuration < 500 && !isDragging && touchStartPos) {
        const distance = Math.sqrt(
          Math.pow(e.lngLat.lng - touchStartPos.lng, 2) + 
          Math.pow(e.lngLat.lat - touchStartPos.lat, 2)
        );

        if (distance < 0.001) {
          console.log('MapComponent: Intentional touch detected, searching for POIs');
          const coordinates: Coordinates = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          };

          // Search for existing POIs at this location
          const osmPOIs = await searchOSMPOIs(coordinates);
          const poi = osmPOIs.length > 0 ? osmNodeToPOI(osmPOIs[0]) : undefined;

          onPointSelect(coordinates, poi);
        } else {
          console.log('MapComponent: Touch moved too much, ignoring');
        }
      } else {
        console.log('MapComponent: Touch was part of navigation, ignoring');
      }

      // Reset state
      touchStartPos = null;
      isDragging = false;
    });

    // Handle mouse clicks (for desktop)
    map.current.on('click', async (e) => {
      // Only handle mouse clicks if no touch events are being used
      if (touchStartTime === 0) {
        const coordinates: Coordinates = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        };

        // Add a small delay to distinguish between navigation and intentional clicks
        setTimeout(async () => {
          // Check if map is still at the same position (not being dragged)
          if (map.current) {
            const currentCenter = map.current.getCenter();
            const distance = Math.sqrt(
              Math.pow(currentCenter.lng - e.lngLat.lng, 2) + 
              Math.pow(currentCenter.lat - e.lngLat.lat, 2)
            );
            
            // Only open overlay if map hasn't moved much (indicating intentional click)
            if (distance < 0.001) {
              console.log('MapComponent: Intentional mouse click detected, searching for POIs');
              // Search for existing POIs at this location
              const osmPOIs = await searchOSMPOIs(coordinates);
              const poi = osmPOIs.length > 0 ? osmNodeToPOI(osmPOIs[0]) : undefined;

              onPointSelect(coordinates, poi);
            } else {
              console.log('MapComponent: Mouse click was part of navigation, ignoring');
            }
          }
        }, 100);
      }
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
  }, []); // Remove dependencies to prevent reinitialization

  // Center on GPS location on startup (only once)
  useEffect(() => {
    if (isMapLoaded && !hasCenteredOnStartup) {
      centerOnCurrentLocation();
      setHasCenteredOnStartup(true);
    }
  }, [isMapLoaded, hasCenteredOnStartup, centerOnCurrentLocation]);

  // Handle search results - auto-center to show all results
  useEffect(() => {
    if (!map.current || !isMapLoaded || searchResults.length === 0) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.search-result-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for search results and collect bounds
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

      // Add click handler to marker - center on result and open overlay
      marker.getElement().addEventListener('click', () => {
        // Center map on this search result
        map.current?.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 16,
        });
        
        // Open POI/Warning overlay for this location
        onPointSelect(coordinates);
      });
    });

    // Auto-center to show all search results
    if (searchResults.length > 1) {
      // Multiple results: fit bounds to show all
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } else if (searchResults.length === 1) {
      // Single result: center on it
      const coordinates: Coordinates = {
        lat: parseFloat(searchResults[0].lat),
        lng: parseFloat(searchResults[0].lon),
      };
      map.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 16,
      });
    }
  }, [searchResults, isMapLoaded, onPointSelect]);

  // Handle selected point - NO auto-centering
  useEffect(() => {
    if (!map.current || !isMapLoaded || !selectedPoint) return;

    // Clear existing selected point marker
    const existingSelectedMarker = document.querySelector('.selected-point-marker');
    if (existingSelectedMarker) {
      existingSelectedMarker.remove();
    }

    // Add marker for selected point
    new maplibregl.Marker({
      element: createSelectedPointMarker(),
      anchor: 'center',
    })
      .setLngLat([selectedPoint.lng, selectedPoint.lat])
      .addTo(map.current);
  }, [selectedPoint, isMapLoaded]);

  // Handle external centering request
  useEffect(() => {
    console.log('🗺️ MAP_CENTER_EFFECT: Triggered');
    console.log('🗺️ MAP_CENTER_EFFECT: map exists:', !!map.current, 'loaded:', isMapLoaded, 'coords:', centerOnCoordinates);
    
    if (!map.current || !isMapLoaded || !centerOnCoordinates) {
      console.log('🗺️ MAP_CENTER_EFFECT: Early return - missing requirements');
      return;
    }

    console.log('🗺️ MAP_CENTER_EFFECT: Calling flyTo to:', [centerOnCoordinates.lng, centerOnCoordinates.lat]);

    // Center map on the requested coordinates
    map.current.flyTo({
      center: [centerOnCoordinates.lng, centerOnCoordinates.lat],
      zoom: 16,
    });

    // Listen for moveend event to know when centering is complete
    const handleMoveEnd = () => {
      console.log('🗺️ MAP_MOVE_END: Centering complete, calling onCenterComplete');
      if (onCenterComplete) {
        onCenterComplete();
      }
      map.current?.off('moveend', handleMoveEnd);
    };

    map.current.on('moveend', handleMoveEnd);
  }, [centerOnCoordinates, isMapLoaded, onCenterComplete]);

  // Handle debug panel state changes - trigger map resize
  useEffect(() => {
    if (map.current && isMapLoaded) {
      // Small delay to allow CSS transition to complete
      setTimeout(() => {
        map.current?.resize();
        console.log('MapComponent: Map resized due to debug panel state change');
      }, 350); // Slightly longer than CSS transition (300ms)
    }
  }, [debugPanelOpen, isMapLoaded]);

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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* GPS Center Button */}
      <button
        onClick={centerOnCurrentLocation}
        className="absolute top-4 left-4 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200 z-10"
        title="Center on my location"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      {/* Map attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-xs text-gray-600">
        © MapTiler © OpenStreetMap contributors
      </div>
    </div>
  );
}