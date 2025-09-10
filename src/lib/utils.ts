import { POIType } from '@/types';

export const getPOIIcon = (type: POIType): string => {
  const iconMap: Record<POIType, string> = {
    [POIType.RESTAURANT]: '🍽️',
    [POIType.HOTEL]: '🏨',
    [POIType.GAS_STATION]: '⛽',
    [POIType.PHARMACY]: '💊',
    [POIType.HOSPITAL]: '🏥',
    [POIType.SCHOOL]: '🏫',
    [POIType.BANK]: '🏦',
    [POIType.ATM]: '🏧',
    [POIType.PARKING]: '🅿️',
    [POIType.TOILET]: '🚻',
    [POIType.WIFI]: '📶',
    [POIType.CHARGING_STATION]: '🔌',
    [POIType.TRAFFIC_LIGHT]: '🚦',
    [POIType.SPEED_CAMERA]: '📷',
    [POIType.CONSTRUCTION]: '🚧',
    [POIType.ACCIDENT]: '⚠️',
    [POIType.ROAD_CLOSURE]: '🚫',
    [POIType.WEATHER_WARNING]: '🌧️',
    [POIType.OTHER]: '📍',
  };
  
  return iconMap[type] || '📍';
};

export const getPOITypeLabel = (type: POIType): string => {
  const labelMap: Record<POIType, string> = {
    [POIType.RESTAURANT]: 'Restaurant',
    [POIType.HOTEL]: 'Hotel',
    [POIType.GAS_STATION]: 'Gas Station',
    [POIType.PHARMACY]: 'Pharmacy',
    [POIType.HOSPITAL]: 'Hospital',
    [POIType.SCHOOL]: 'School',
    [POIType.BANK]: 'Bank',
    [POIType.ATM]: 'ATM',
    [POIType.PARKING]: 'Parking',
    [POIType.TOILET]: 'Toilet',
    [POIType.WIFI]: 'WiFi',
    [POIType.CHARGING_STATION]: 'Charging Station',
    [POIType.TRAFFIC_LIGHT]: 'Traffic Light',
    [POIType.SPEED_CAMERA]: 'Speed Camera',
    [POIType.CONSTRUCTION]: 'Construction',
    [POIType.ACCIDENT]: 'Accident',
    [POIType.ROAD_CLOSURE]: 'Road Closure',
    [POIType.WEATHER_WARNING]: 'Weather Warning',
    [POIType.OTHER]: 'Other',
  };
  
  return labelMap[type] || 'Other';
};

export const getPOITypeColor = (type: POIType): string => {
  const colorMap: Record<POIType, string> = {
    [POIType.RESTAURANT]: 'bg-orange-100 text-orange-800',
    [POIType.HOTEL]: 'bg-blue-100 text-blue-800',
    [POIType.GAS_STATION]: 'bg-yellow-100 text-yellow-800',
    [POIType.PHARMACY]: 'bg-green-100 text-green-800',
    [POIType.HOSPITAL]: 'bg-red-100 text-red-800',
    [POIType.SCHOOL]: 'bg-purple-100 text-purple-800',
    [POIType.BANK]: 'bg-gray-100 text-gray-800',
    [POIType.ATM]: 'bg-gray-100 text-gray-800',
    [POIType.PARKING]: 'bg-blue-100 text-blue-800',
    [POIType.TOILET]: 'bg-green-100 text-green-800',
    [POIType.WIFI]: 'bg-blue-100 text-blue-800',
    [POIType.CHARGING_STATION]: 'bg-green-100 text-green-800',
    [POIType.TRAFFIC_LIGHT]: 'bg-yellow-100 text-yellow-800',
    [POIType.SPEED_CAMERA]: 'bg-red-100 text-red-800',
    [POIType.CONSTRUCTION]: 'bg-orange-100 text-orange-800',
    [POIType.ACCIDENT]: 'bg-red-100 text-red-800',
    [POIType.ROAD_CLOSURE]: 'bg-red-100 text-red-800',
    [POIType.WEATHER_WARNING]: 'bg-blue-100 text-blue-800',
    [POIType.OTHER]: 'bg-gray-100 text-gray-800',
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-800';
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const formatAddress = (address: Record<string, string> | null): string => {
  if (!address) return 'No address available';
  
  const parts = [
    address.house_number,
    address.road,
    address.city,
    address.state,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ') || 'No address available';
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
