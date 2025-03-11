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
      // If no user, clear routes and return early
      if (!user) {
        setSavedRoutes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (loading) {
            setError('Request timed out. Please try again.');
            setLoading(false);
          }
        }, 10000);
        
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error fetching locations:', error);
          setError(`Failed to fetch locations: ${error.message}`);
          return;
        }

        // Transform the data from Supabase format to our SavedRoute format
        const transformedData: SavedRoute[] = data?.map(item => ({
          id: item.id,
          name: item.name,
          locations: item.data?.locations || []
        })) || [];

        setSavedRoutes(transformedData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Exception in fetchSavedRoutes:', errorMessage);
        setError(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

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
