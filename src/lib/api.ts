import { Coordinates, SearchResult, OSMNode, POI, POIType } from '@/types';

// LocationIQ API functions
export const searchLocation = async (query: string, mapCenter?: { lat: number; lng: number }): Promise<SearchResult[]> => {
  const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
  let url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(query)}&format=json&limit=10`;
  
  // Add proximity bias if map center is provided
  if (mapCenter) {
    url += `&bounded=1&viewbox=${mapCenter.lng - 0.1},${mapCenter.lat - 0.1},${mapCenter.lng + 0.1},${mapCenter.lat + 0.1}`;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};

export const reverseGeocode = async (coordinates: Coordinates): Promise<SearchResult | null> => {
  const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
  const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// OSM API functions
const getOSMAuth = () => {
  const login = process.env.OSM_LOGIN;
  const password = process.env.OSM_PASSWORD;
  if (!login || !password) {
    throw new Error('OSM credentials not configured');
  }
  return btoa(`${login}:${password}`);
};

const getOSMBaseURL = () => {
  return process.env.OSM_API_URL || 'https://api06.dev.openstreetmap.org/';
};

export const searchOSMPOIs = async (coordinates: Coordinates, _radius: number = 100): Promise<OSMNode[]> => {
  const baseURL = getOSMBaseURL();
  const { lat, lng } = coordinates;
  const bbox = `${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}`;
  
  const url = `${baseURL}api/0.6/map?bbox=${bbox}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    // Parse XML and extract nodes with POI tags
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const nodes = xmlDoc.getElementsByTagName('node');
    
    const pois: OSMNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const tags = node.getElementsByTagName('tag');
      const nodeTags: Record<string, string> = {};
      
      for (let j = 0; j < tags.length; j++) {
        const tag = tags[j];
        const key = tag.getAttribute('k');
        const value = tag.getAttribute('v');
        if (key && value) {
          nodeTags[key] = value;
        }
      }
      
      // Check if this node has POI tags
      if (Object.keys(nodeTags).length > 0 && hasPOITags(nodeTags)) {
        pois.push({
          id: node.getAttribute('id') || '',
          lat: node.getAttribute('lat') || '',
          lon: node.getAttribute('lon') || '',
          tags: nodeTags,
          version: parseInt(node.getAttribute('version') || '1'),
          changeset: node.getAttribute('changeset') || '',
          user: node.getAttribute('user') || '',
          uid: node.getAttribute('uid') || '',
          visible: node.getAttribute('visible') !== 'false',
          timestamp: node.getAttribute('timestamp') || '',
        });
      }
    }
    
    return pois;
  } catch (error) {
    console.error('Error searching OSM POIs:', error);
    return [];
  }
};

const hasPOITags = (tags: Record<string, string>): boolean => {
  const poiKeys = [
    'amenity', 'shop', 'tourism', 'leisure', 'office', 'craft',
    'healthcare', 'emergency', 'public_transport', 'highway'
  ];
  return poiKeys.some(key => tags[key]);
};

export const createOSMChangeset = async (): Promise<string> => {
  const baseURL = getOSMBaseURL();
  const auth = getOSMAuth();
  
  const changesetXML = `
    <osm>
      <changeset>
        <tag k="created_by" v="PopiWarningApp"/>
        <tag k="comment" v="Adding/updating POI via PopiWarningApp"/>
      </changeset>
    </osm>
  `;
  
  try {
    const response = await fetch(`${baseURL}api/0.6/changeset/create`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/xml',
      },
      body: changesetXML,
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error creating OSM changeset:', error);
    throw error;
  }
};

export const closeOSMChangeset = async (changesetId: string): Promise<void> => {
  const baseURL = getOSMBaseURL();
  const auth = getOSMAuth();
  
  try {
    const response = await fetch(`${baseURL}api/0.6/changeset/${changesetId}/close`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error closing OSM changeset:', error);
    throw error;
  }
};

export const addOSMNode = async (changesetId: string, coordinates: Coordinates, tags: Record<string, string>): Promise<string> => {
  const baseURL = getOSMBaseURL();
  const auth = getOSMAuth();
  
  const nodeXML = `
    <osm>
      <node changeset="${changesetId}" lat="${coordinates.lat}" lon="${coordinates.lng}">
        ${Object.entries(tags).map(([k, v]) => `<tag k="${k}" v="${v}"/>`).join('')}
      </node>
    </osm>
  `;
  
  try {
    const response = await fetch(`${baseURL}api/0.6/node/create`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/xml',
      },
      body: nodeXML,
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error adding OSM node:', error);
    throw error;
  }
};

export const updateOSMNode = async (nodeId: string, changesetId: string, coordinates: Coordinates, tags: Record<string, string>, version: number): Promise<void> => {
  const baseURL = getOSMBaseURL();
  const auth = getOSMAuth();
  
  const nodeXML = `
    <osm>
      <node id="${nodeId}" changeset="${changesetId}" lat="${coordinates.lat}" lon="${coordinates.lng}" version="${version}">
        ${Object.entries(tags).map(([k, v]) => `<tag k="${k}" v="${v}"/>`).join('')}
      </node>
    </osm>
  `;
  
  try {
    const response = await fetch(`${baseURL}api/0.6/node/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/xml',
      },
      body: nodeXML,
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating OSM node:', error);
    throw error;
  }
};

// Utility function to convert OSM node to POI
export const osmNodeToPOI = (node: OSMNode): POI => {
  return {
    id: node.id,
    type: determinePOIType(node.tags),
    name: node.tags.name,
    address: node.tags['addr:full'] || node.tags['addr:street'],
    coordinates: {
      lat: parseFloat(node.lat),
      lng: parseFloat(node.lon),
    },
    tags: node.tags,
    source: 'osm',
    osmId: node.id,
    version: node.version,
    createdAt: new Date(node.timestamp),
    updatedAt: new Date(node.timestamp),
    createdBy: node.user,
  };
};

const determinePOIType = (tags: Record<string, string>): POIType => {
  // Map OSM tags to our POI types
  if (tags.amenity === 'restaurant') return POIType.RESTAURANT;
  if (tags.amenity === 'hotel') return POIType.HOTEL;
  if (tags.amenity === 'fuel') return POIType.GAS_STATION;
  if (tags.amenity === 'pharmacy') return POIType.PHARMACY;
  if (tags.amenity === 'hospital') return POIType.HOSPITAL;
  if (tags.amenity === 'school') return POIType.SCHOOL;
  if (tags.amenity === 'bank') return POIType.BANK;
  if (tags.amenity === 'atm') return POIType.ATM;
  if (tags.amenity === 'parking') return POIType.PARKING;
  if (tags.amenity === 'toilets') return POIType.TOILET;
  if (tags.amenity === 'wifi') return POIType.WIFI;
  if (tags.amenity === 'charging_station') return POIType.CHARGING_STATION;
  if (tags.highway === 'traffic_signals') return POIType.TRAFFIC_LIGHT;
  if (tags.highway === 'speed_camera') return POIType.SPEED_CAMERA;
  if (tags.highway === 'construction') return POIType.CONSTRUCTION;
  if (tags.highway === 'accident') return POIType.ACCIDENT;
  if (tags.highway === 'road_closed') return POIType.ROAD_CLOSURE;
  if (tags.weather === 'warning') return POIType.WEATHER_WARNING;
  
  return POIType.OTHER;
};
