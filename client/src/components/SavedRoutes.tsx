
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export type SavedRoute = {
  id: number;
  name: string;
  locations: { latitude: number; longitude: number; capacity: number }[];
};

interface SavedRoutesProps {
  onSelectRoute: (route: SavedRoute) => void;
}

const SavedRoutes: React.FC<SavedRoutesProps> = ({ onSelectRoute }) => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    const dummyRoutes: SavedRoute[] = [
      {
        id: 1,
        name: 'Sample Location 1',
        locations: [
          { latitude: 12.951507, longitude: 80.140099, capacity: 33 }, 
          { latitude: 12.751581, longitude: 80.203654, capacity: 20 }, 
          { latitude: 12.923471, longitude: 80.146346 , capacity: 15 }, 
          { latitude: 12.912298, longitude: 80.228316 , capacity: 15 },
          { latitude: 12.912298, longitude: 80.228316 , capacity: 15 },
        ],
      },
      {
        id: 2,
        name: 'Sample Location 2',
        locations: [
          { latitude: 51.5, longitude: -0.08, capacity: 40 },
          { latitude: 51.52, longitude: -0.12, capacity: 15 },
        ],
      },
    ];
    setTimeout(() => {
      setSavedRoutes(dummyRoutes);
    }, 500);
  }, []);

  return (
    <div className="saved-routes-list p-2">
      <h2 className="text-lg font-semibold mb-2">Saved Locations</h2>
      {savedRoutes.length === 0 ? (
        <p>No saved routes found.</p>
      ) : (
        <ul>
          {savedRoutes.map((route) => (
            <li key={route.id} className="mb-2">
              <Button
                onClick={() => onSelectRoute(route)}
                variant="outline"
                className="w-full text-left"
              >
                {route.name}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedRoutes;
