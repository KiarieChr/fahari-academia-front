import React, { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { BusFront } from 'lucide-react';
import { useLiveLocation } from '../hooks/useLiveLocation';

interface LiveMapProps {
  vehicleId: string | null;
  mapboxToken: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ vehicleId, mapboxToken }) => {
  const { location, connectionStatus } = useLiveLocation(vehicleId);

  // Default viewport centered around Nairobi, Kenya (or your target area)
  const [viewState, setViewState] = React.useState({
    longitude: 36.8219,
    latitude: -1.2921,
    zoom: 12
  });

  // Automatically pan to the bus when we get the first location
  React.useEffect(() => {
    if (location) {
      setViewState(prev => ({
        ...prev,
        longitude: location.longitude,
        latitude: location.latitude
      }));
    }
  }, [location?.longitude, location?.latitude]); // Only trigger when coords change

  if (!mapboxToken || mapboxToken === '') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div>
          <BusFront className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mapbox Token Required</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Please provide a valid Mapbox token to view the live tracking map. You can get one from mapbox.com.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
      
      {/* Overlay Status Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md flex items-center gap-2 border border-gray-100 dark:border-gray-700">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 
          connectionStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {connectionStatus === 'Open' ? 'Live' : connectionStatus}
        </span>
        {location?.speed !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 border-l border-gray-300 dark:border-gray-600 pl-2">
            {location.speed} km/h
          </span>
        )}
      </div>

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        
        {location && (
          <Marker
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Ping Animation behind the bus */}
              <div className="absolute -inset-2 bg-[var(--primary-color)] opacity-40 rounded-full animate-ping" />
              
              {/* Bus Icon */}
              <div 
                className="bg-[var(--primary-color)] text-white p-2 rounded-full shadow-lg relative z-10 border-2 border-white dark:border-gray-900"
                style={{ transition: 'all 0.3s ease-out' }}
              >
                <BusFront size={20} />
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default LiveMap;
