'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OverlayData, POIType } from '@/types';
import { getPOIIcon, getPOITypeLabel } from '@/lib/utils';

interface OverlayComponentProps {
  data: OverlayData;
  onClose: () => void;
  onAddPOI: () => void;
  onCorrectPOI: () => void;
  onAddWarning: () => void;
  onCorrectWarning: () => void;
}

export default function OverlayComponent({
  data,
  onClose,
  onAddPOI,
  onCorrectPOI,
  onAddWarning,
  onCorrectWarning,
}: OverlayComponentProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  console.log('[OverlayComponent] Rendering with data:', data);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getDisplayData = () => {
    if (data.poi) {
      return {
        type: data.poi.type,
        name: data.poi.name || 'Unnamed POI',
        address: data.poi.address || 'No address available',
        coordinates: data.coordinates,
        source: data.poi.source,
        tags: data.poi.tags,
        hasData: true,
      };
    }

    if (data.warning) {
      return {
        type: data.warning.type,
        name: data.warning.name || 'Unnamed Warning',
        address: data.warning.address || 'No address available',
        coordinates: data.coordinates,
        source: 'warning' as const,
        tags: data.warning.tags,
        hasData: true,
        severity: data.warning.severity,
        expiresAt: data.warning.expiresAt,
      };
    }

    return {
      type: POIType.OTHER,
      name: 'No detail',
      address: 'No address available',
      coordinates: data.coordinates,
      source: 'none' as const,
      tags: {},
      hasData: false,
    };
  };

  const displayData = getDisplayData();

  if (!mounted) return null;

  const overlayContent = (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-transform duration-200 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              {displayData.hasData ? (
                <span className="text-lg">{getPOIIcon(displayData.type)}</span>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {displayData.name}
              </h3>
              <p className="text-sm text-gray-500">
                {getPOITypeLabel(displayData.type)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <p className="text-sm text-gray-900">{displayData.address}</p>
          </div>

          {/* Coordinates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinates
            </label>
            <p className="text-sm text-gray-900 font-mono">
              {displayData.coordinates.lat.toFixed(6)}, {displayData.coordinates.lng.toFixed(6)}
            </p>
          </div>

          {/* Source */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                displayData.source === 'osm' 
                  ? 'bg-green-100 text-green-800'
                  : displayData.source === 'warning'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {displayData.source === 'osm' ? 'OpenStreetMap' : 
                 displayData.source === 'warning' ? 'Private Warning' : 'No Data'}
              </span>
            </div>
          </div>

          {/* Warning specific info */}
          {displayData.source === 'warning' && 'severity' in displayData && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                displayData.severity === 'critical' ? 'bg-red-100 text-red-800' :
                displayData.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                displayData.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {displayData.severity.toUpperCase()}
              </span>
            </div>
          )}

          {/* Expiration date for warnings */}
          {displayData.source === 'warning' && 'expiresAt' in displayData && displayData.expiresAt && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires
              </label>
              <p className="text-sm text-gray-900">
                {new Date(displayData.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Tags */}
          {displayData.hasData && Object.keys(displayData.tags).length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(displayData.tags).slice(0, 6).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                  >
                    <span className="font-medium">{key}:</span>
                    <span className="ml-1">{value}</span>
                  </span>
                ))}
                {Object.keys(displayData.tags).length > 6 && (
                  <span className="text-xs text-gray-500">
                    +{Object.keys(displayData.tags).length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-200">
          {/* Left button - POI actions */}
          <button
            onClick={data.hasOSMData ? onCorrectPOI : onAddPOI}
            className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-r border-gray-200"
          >
            {data.hasOSMData ? 'Correct POI' : 'Add POI'}
          </button>
          
          {/* Right button - Warning actions */}
          <button
            onClick={data.hasFirestoreData ? onCorrectWarning : onAddWarning}
            className="flex-1 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
          >
            {data.hasFirestoreData ? 'Correct Warning' : 'Add Warning'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
