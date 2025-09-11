'use client';

import { useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import MapComponent from '@/components/MapComponent';
import SearchComponent from '@/components/SearchComponent';
import OverlayComponent from '@/components/OverlayComponent';
import AuthComponent from '@/components/AuthComponent';
import { Coordinates, SearchResult, OverlayData, POI } from '@/types';
import { searchOSMPOIs, osmNodeToPOI } from '@/lib/api';

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayData, setOverlayData] = useState<OverlayData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Coordinates | undefined>();
  const [, setSelectedPOI] = useState<POI | undefined>();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();

  const { user, loading } = useAuth();

  const handlePointSelect = async (coordinates: Coordinates, poi?: POI) => {
    setSelectedPoint(coordinates);
    setSelectedPOI(poi);

    // Search for both OSM and Firestore data
    const osmPOIs = await searchOSMPOIs(coordinates);
    const osmPOI = osmPOIs.length > 0 ? osmNodeToPOI(osmPOIs[0]) : undefined;

    // TODO: Search Firestore for warnings
    const firestoreWarning = undefined; // Will implement later

    const overlay: OverlayData = {
      coordinates,
      poi: osmPOI,
      warning: firestoreWarning,
      hasOSMData: !!osmPOI,
      hasFirestoreData: !!firestoreWarning,
    };

    setOverlayData(overlay);
    setShowOverlay(true);
  };

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  const handleResultSelect = (result: SearchResult) => {
    const coordinates: Coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    handlePointSelect(coordinates);
    // The map will center on this point via the MapComponent
  };

  const handleMapCenterChange = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter(center);
  }, []);

  const handleAddPOI = () => {
    // TODO: Implement POI addition
    console.log('Add POI clicked');
    setShowOverlay(false);
  };

  const handleCorrectPOI = () => {
    // TODO: Implement POI correction
    console.log('Correct POI clicked');
    setShowOverlay(false);
  };

  const handleAddWarning = () => {
    // TODO: Implement warning addition
    console.log('Add Warning clicked');
    setShowOverlay(false);
  };

  const handleCorrectWarning = () => {
    // TODO: Implement warning correction
    console.log('Correct Warning clicked');
    setShowOverlay(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed top bar with search and user info */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchComponent
              onSearchResults={handleSearchResults}
              onResultSelect={handleResultSelect}
              mapCenter={mapCenter}
            />
          </div>

          {/* User section */}
          <div className="flex items-center space-x-4 ml-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email || 'User'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map - takes remaining space */}
      <div className="flex-1 relative">
        <MapComponent
          onPointSelect={handlePointSelect}
          searchResults={searchResults}
          selectedPoint={selectedPoint}
          onMapCenterChange={handleMapCenterChange}
        />
      </div>

      {/* Overlay */}
      {showOverlay && overlayData && (
        <OverlayComponent
          data={overlayData}
          onClose={() => setShowOverlay(false)}
          onAddPOI={handleAddPOI}
          onCorrectPOI={handleCorrectPOI}
          onAddWarning={handleAddWarning}
          onCorrectWarning={handleCorrectWarning}
        />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthComponent onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
