import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface VehicleLocation {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export function useLiveLocation(vehicleId: string | null) {
  const [location, setLocation] = useState<VehicleLocation | null>(null);

  // We connect to the WebSocket endpoint for the specific vehicle.
  // We use wss:// or ws:// depending on the environment. For local development, ws:// is fine.
  // Make sure your backend allows connections.
  const socketUrl = vehicleId ? `ws://localhost:8000/ws/fleet/live/${vehicleId}/` : null;

  const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true, // Automatically reconnect
    reconnectInterval: 3000,
    reconnectAttempts: 10,
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      const data = lastJsonMessage as any;
      if (data.type === 'location_update') {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          timestamp: data.timestamp,
        });
      }
    }
  }, [lastJsonMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return { location, connectionStatus };
}
