
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import SavedRoutes, { SavedRoute } from '@/components/SavedRoutes';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from '@/context/LocationContext';
import { Slider } from "@/components/ui/slider";

const MapPage: React.FC = () => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number[]>([33]);
  const [numVehicles, setNumVehicles] = useState<number>(4);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const { Locations, setLocations } = useLocation();

  // When a saved route is selected, update the current locations.
  const handleSavedRouteSelect = (route: SavedRoute) => {
    setLocations(route.locations);
  };

  // Add a new location point manually.
  const handleAddPoint = (lat: number, lng: number, capacity: number) => {
    try {
      const newPoint = { latitude: lat, longitude: lng, capacity };
      const updatedLocations = [...Locations, newPoint];
      setLocations(updatedLocations);
      console.log(updatedLocations);
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a location at a given index.
  const handleDeleteLocation = (index: number) => {
    const updatedLocations = Locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  // Placeholder for calculating routes based on current settings.
  const handleCalculateRoutes = () => {
    console.log("Calculating routes with", numVehicles, "vehicles and these locations:", Locations);
    // TODO: Connect to your backend API to calculate routes.
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Main content container with padding-top to account for the fixed Navbar */}
      <div className="flex flex-grow pt-14">
        {/* Collapsible Sidebar */}
        <div
          className={`transition-all duration-300 border-r border-gray-300 flex flex-col items-center ${sidebarOpen ? "w-64" : "w-16"}`}
        >
          <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="m-2" variant="outline">
            {sidebarOpen ? "<<" : ">>"}
          </Button>
          {sidebarOpen && (
            <div className="w-full p-2">
              <SavedRoutes onSelectRoute={handleSavedRouteSelect} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-grow">
          <div className="flex flex-grow">
            {/* Map Section */}
            <div className="p-4 flex-grow">
              <h1 className="text-2xl font-semibold py-2">Route Optimizer</h1>
              <Map locations={Locations} />
            </div>

            {/* Sidebar for Adding Points */}
            <div className="w-96 p-4 border-l border-gray-300">
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-semibold">Add Points</h2>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Latitude"
                    className="w-1/2 bg-secBlue text-priWhite"
                    onChange={(e) => setLatitude(Number(e.target.value))}
                  />
                  <Input
                    placeholder="Longitude"
                    className="w-1/2 bg-secBlue text-priWhite"
                    onChange={(e) => setLongitude(Number(e.target.value))}
                  />
                </div>

                {/* Number of Vehicles Field */}
                <Input
                  placeholder="Number of Vehicles"
                  type="number"
                  value={numVehicles}
                  onChange={(e) => setNumVehicles(Number(e.target.value))}
                  className="bg-secBlue text-priWhite"
                />

                {/* Demand Slider */}
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Demand:</span>
                    <span className="text-sm font-medium">{sliderValue[0]}</span>
                  </div>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="py-2 accent-secBlue"
                  />
                </div>

                <Button
                  className="bg-AccYellow text-priWhite"
                  onClick={() => handleAddPoint(latitude, longitude, sliderValue[0])}
                >
                  Add
                </Button>
              </div>

              {/* List of Added Locations & Calculate Button */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold py-4">Added Locations</h2>
                <div className="h-64 overflow-y-auto">
                  {Locations.length === 0 ? (
                    <p className="text-center text-gray-600">No points added yet</p>
                  ) : (
                    Locations.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center py-1 mb-2">
                        <div className="border p-2 w-full rounded-md bg-white">
                          <div className="font-medium">Point {index + 1}</div>
                          <div className="text-sm">
                            Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Capacity: {item.capacity}
                          </div>
                        </div>
                        <Button
                          className="bg-red-500 text-white"
                          onClick={() => handleDeleteLocation(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Calculate Routes Button (visible if at least 2 locations exist) */}
                {Locations.length >= 2 && (
                  <Button className="bg-green-500 text-white mt-4" onClick={handleCalculateRoutes}>
                    Calculate Routes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
