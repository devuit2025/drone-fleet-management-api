export class GeometryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeometryParseError';
  }
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

const SRID_PREFIX_REGEX = /^SRID=\d+;/i;
const POINT_WKT_REGEX = /^POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i;

function stripSridPrefix(value: string): string {
  if (SRID_PREFIX_REGEX.test(value)) {
    const [, wkt] = value.split(';');
    return wkt ?? value;
  }
  return value;
}

export function normalizePointGeometry(input: any): GeoJSONPoint {
  if (input === null || input === undefined) {
    throw new GeometryParseError('geoPoint is required');
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new GeometryParseError('geoPoint cannot be empty');
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizePointGeometry(parsed);
      } catch (error) {
        throw new GeometryParseError('Invalid geoPoint JSON');
      }
    }

    const wkt = stripSridPrefix(trimmed);
    const match = wkt.match(POINT_WKT_REGEX);
    if (!match) {
      throw new GeometryParseError('Invalid geoPoint WKT format');
    }

    const lng = Number(match[1]);
    const lat = Number(match[2]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new GeometryParseError('geoPoint coordinates must be numeric');
    }
    return {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }

  if (typeof input === 'object') {
    if ((input as any).type === 'Point' && Array.isArray((input as any).coordinates)) {
      const [lng, lat] = (input as any).coordinates;
      const numericLng = Number(lng);
      const numericLat = Number(lat);
      if (!Number.isFinite(numericLng) || !Number.isFinite(numericLat)) {
        throw new GeometryParseError('geoPoint coordinates must be numeric');
      }
      return {
        type: 'Point',
        coordinates: [numericLng, numericLat],
      };
    }

    if (typeof (input as any).lng === 'number' && typeof (input as any).lat === 'number') {
      return {
        type: 'Point',
        coordinates: [(input as any).lng, (input as any).lat],
      };
    }

    if (typeof (input as any).longitude === 'number' && typeof (input as any).latitude === 'number') {
      return {
        type: 'Point',
        coordinates: [(input as any).longitude, (input as any).latitude],
      };
    }

    throw new GeometryParseError('Invalid geoPoint object format');
  }

  throw new GeometryParseError('Unsupported geoPoint format');
}

export function normalizeGeometryObject(input: any): any {
  if (input === null || input === undefined) {
    throw new GeometryParseError('Geometry is required');
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new GeometryParseError('Geometry cannot be empty');
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeGeometryObject(parsed);
      } catch (error) {
        throw new GeometryParseError('Invalid geometry JSON');
      }
    }

    throw new GeometryParseError('Geometry string must be valid GeoJSON');
  }

  if (typeof input !== 'object') {
    throw new GeometryParseError('Invalid geometry format');
  }

  if ((input as any).type === 'Point') {
    return normalizePointGeometry(input);
  }

  if (typeof (input as any).type !== 'string' || !(input as any).type) {
    throw new GeometryParseError('Geometry.type must be provided');
  }

  if (!Array.isArray((input as any).coordinates)) {
    throw new GeometryParseError('Geometry.coordinates must be an array');
  }

  return {
    type: (input as any).type,
    coordinates: (input as any).coordinates,
    ...(input as any).properties ? { properties: (input as any).properties } : {},
  };
}

export function formatPointGeometry(geometry: any): string {
  if (!geometry) {
    return '';
  }

  if (typeof geometry === 'string') {
    const trimmed = geometry.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatPointGeometry(parsed);
      } catch (error) {
        return trimmed;
      }
    }
    const wkt = stripSridPrefix(trimmed);
    const match = wkt.match(POINT_WKT_REGEX);
    if (match) {
      return `POINT(${Number(match[1])} ${Number(match[2])})`;
    }
    return trimmed;
  }

  if (typeof geometry === 'object') {
    if ((geometry as any).type === 'Point' && Array.isArray((geometry as any).coordinates)) {
      const [lng, lat] = (geometry as any).coordinates;
      if (Number.isFinite(Number(lng)) && Number.isFinite(Number(lat))) {
        return `POINT(${Number(lng)} ${Number(lat)})`;
      }
    }

    if (typeof (geometry as any).lng === 'number' && typeof (geometry as any).lat === 'number') {
      return `POINT(${(geometry as any).lng} ${(geometry as any).lat})`;
    }

    if (typeof (geometry as any).longitude === 'number' && typeof (geometry as any).latitude === 'number') {
      return `POINT(${(geometry as any).longitude} ${(geometry as any).latitude})`;
    }

    try {
      return JSON.stringify(geometry);
    } catch {
      return '';
    }
  }

  return '';
}

