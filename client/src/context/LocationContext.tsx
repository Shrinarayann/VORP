import React, { createContext,  useContext,  useState} from 'react';

interface LocationProviderProps {
  children: React.ReactNode;
}

interface LocationContextType{
    Locations: {latitude: number, longitude: number, capacity: number}[];
    setLocations: React.Dispatch<React.SetStateAction<{latitude: number, longitude: number, capacity: number}[]>>;
}

const LocationContext = createContext<{Locations: any[];setLocations: React.Dispatch<React.SetStateAction<any[]>>;} | undefined> (undefined);

const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [Locations, setLocations] = useState<any[]>([]);
    return (
        <LocationContext.Provider value={{ Locations, setLocations }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (context == undefined){
        throw new Error('useLocation must be used with a LocationProvider');
    }

    return context;
}
export default LocationProvider;