import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/auth/supabase';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';

export type SavedRoute = {
  id: string;
  name: string;
  locations: { latitude: number; longitude: number; capacity: number }[];
};

interface SavedRoutesProps {
  onSelectRoute: (route: SavedRoute) => void;
}

const SavedRoutes: React.FC<SavedRoutesProps> = ({ onSelectRoute }) => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // Fetch saved routes from Supabase when user is available
    const fetchSavedRoutes = async () => {
      console.log("[DEBUG SavedRoutes] Starting fetchSavedRoutes...");
      console.log("[DEBUG SavedRoutes] User state:", user ? `Logged in as ${user.id}` : "Not logged in");
      
      if (!user) {
        console.log("[DEBUG SavedRoutes] No user found, clearing routes");
        setSavedRoutes([]);
        setLoading(false);
        return;
      }

      try {
        console.log("[DEBUG SavedRoutes] Setting loading to true");
        setLoading(true);
        setError(null);
        
        console.log("[DEBUG SavedRoutes] Making Supabase request for user:", user.id);
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[DEBUG SavedRoutes] Error fetching locations:', error);
          setError(`Failed to fetch locations: ${error.message}`);
          return;
        }

        console.log(`[DEBUG SavedRoutes] Received ${data?.length || 0} locations from Supabase`);
        console.log("[DEBUG SavedRoutes] Raw data:", JSON.stringify(data, null, 2));

        // Transform the data from Supabase format to our SavedRoute format
        const transformedData: SavedRoute[] = data?.map(item => ({
          id: item.id,
          name: item.name,
          locations: item.data?.locations || []
        })) || [];

        console.log("[DEBUG SavedRoutes] Transformed data:", JSON.stringify(transformedData, null, 2));
        setSavedRoutes(transformedData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[DEBUG SavedRoutes] Exception in fetchSavedRoutes:', errorMessage);
        setError(`Error: ${errorMessage}`);
      } finally {
        console.log("[DEBUG SavedRoutes] Setting loading to false");
        setLoading(false);
      }
    };

    console.log("[DEBUG SavedRoutes] Setting up fetch effect");
    fetchSavedRoutes();
  }, [user]);

  if (loading) {
    return (
      <div className="saved-routes-list p-2 flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-secBlue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-routes-list p-2">
        <h2 className="text-lg font-semibold mb-2">Saved Locations</h2>
        <p className="text-sm text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="saved-routes-list p-2">
      <h2 className="text-lg font-semibold mb-2">Saved Locations</h2>
      {!user ? (
        <p className="text-sm text-gray-500">Log in to see your saved locations</p>
      ) : savedRoutes.length === 0 ? (
        <p className="text-sm text-gray-500">No saved locations found</p>
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
