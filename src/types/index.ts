// Map and location types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// POI and Warning types
export interface POI {
  id: string;
  type: POIType;
  name?: string;
  address?: string;
  coordinates: Coordinates;
  tags: Record<string, string>;
  source: 'osm' | 'firestore';
  osmId?: string;
  changesetId?: string;
  version?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Warning extends POI {
  source: 'firestore';
  isPrivate: true;
  userId: string;
  expiresAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// POI Types enum
export enum POIType {
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  GAS_STATION = 'fuel',
  PHARMACY = 'pharmacy',
  HOSPITAL = 'hospital',
  SCHOOL = 'school',
  BANK = 'bank',
  ATM = 'atm',
  PARKING = 'parking',
  TOILET = 'toilets',
  WIFI = 'wifi',
  CHARGING_STATION = 'charging_station',
  TRAFFIC_LIGHT = 'traffic_signals',
  SPEED_CAMERA = 'speed_camera',
  CONSTRUCTION = 'construction',
  ACCIDENT = 'accident',
  ROAD_CLOSURE = 'road_closed',
  WEATHER_WARNING = 'weather_warning',
  OTHER = 'other'
}

// Search types
export interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// OSM API types
export interface OSMNode {
  id: string;
  lat: string;
  lon: string;
  tags: Record<string, string>;
  version: number;
  changeset: string;
  user: string;
  uid: string;
  visible: boolean;
  timestamp: string;
}

export interface OSMChangeset {
  id: string;
  created_at: string;
  closed_at?: string;
  open: boolean;
  user: string;
  uid: string;
  minlat: number;
  minlon: number;
  maxlat: number;
  maxlon: number;
  comments_count: number;
  changes_count: number;
  tags: Record<string, string>;
}

// User types
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
  fcmToken?: string;
  preferences: {
    notifications: boolean;
    mapStyle: 'streets' | 'satellite' | 'terrain';
    defaultZoom: number;
  };
}

// Map state types
export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedPoint?: Coordinates;
  selectedPOI?: POI;
  searchResults: SearchResult[];
  isLoading: boolean;
  error?: string;
}

// Overlay types
export interface OverlayData {
  poi?: POI;
  warning?: Warning;
  coordinates: Coordinates;
  hasOSMData: boolean;
  hasFirestoreData: boolean;
}
