
/**
 * GPS Receiver Node
 * Responsible for getting the user's current geolocation.
 */

export class GpsNode {
    constructor(options = {}) {
        this.options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
            ...options
        };
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    reject(error);
                },
                this.options
            );
        });
    }

    watchPosition(callback, errorCallback) {
        if (!navigator.geolocation) {
            if (errorCallback) errorCallback(new Error("Geolocation not supported"));
            return -1;
        }

        return navigator.geolocation.watchPosition(
            (position) => {
                callback({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            errorCallback,
            this.options
        );
    }

    clearWatch(watchId) {
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
}
