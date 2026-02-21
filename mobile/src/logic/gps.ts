/**
 * GPS — expo-location for React Native
 */

import * as Location from 'expo-location';

export interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GpsOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class GpsNode {
  private options: Required<GpsOptions>;

  constructor(options: GpsOptions = {}) {
    this.options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options,
    };
  }

  async getCurrentPosition(): Promise<Position> {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') {
        throw new Error('위치 권한이 필요합니다.');
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: this.options.enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
      timestamp: location.timestamp,
    };
  }
}
