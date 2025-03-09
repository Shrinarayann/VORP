// src/pages/MapPage.tsx
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import SavedRoutes, { SavedRoute } from '@/components/SavedRoutes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Plus, MapPin, Truck, Route } from 'lucide-react';

type Vehicle = {
  id: number;
  capacity: number;
};

const MapPage: React.FC = () => {
  // State for map points
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number[]>([33]);
  const { Locations, setLocations } = useLocation();

  // State for depot selection (index of the chosen point)
  const [depotIndex, setDepotIndex] = useState<number | null>(null);

  // Sidebar tab state: "points" or "vehicles" or "routes"
  const [activeTab, setActiveTab] = useState<"points" | "vehicles" | "routes">("points");

  // State for vehicles details
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(0);
  const [batchQuantity, setBatchQuantity] = useState<number>(1);

  // For the collapsible saved routes sidebar on the left
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // State for calculated routes
  const [calculatedRoutes, setCalculatedRoutes] = useState<{[key: string]: [number, number][]} | null>(null);
  
  // State to track the selected route
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Function implementations
  const handleSavedRouteSelect = (route: SavedRoute) => {
    setLocations(route.locations);
    setDepotIndex(null);
  };

  const handleAddPoint = (lat: number, lng: number, demand: number) => {
    try {
      const newPoint = { latitude: lat, longitude: lng, capacity: demand };
      const updatedLocations = [...Locations, newPoint];
      setLocations(updatedLocations);
      console.log("Updated Points:", updatedLocations);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePoint = (index: number) => {
    const updatedLocations = Locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    if (depotIndex === index) {
      setDepotIndex(null);
    }
  };

  const handleAddVehicle = () => {
    if (vehicleCapacity <= 0) return;
    const newVehicle: Vehicle = {
      id: vehicles.length,
      capacity: vehicleCapacity,
    };
    setVehicles([...vehicles, newVehicle]);
    setVehicleCapacity(0);
  };

  const handleBatchAddVehicles = () => {
    if (vehicleCapacity <= 0 || batchQuantity < 1) return;
    const newVehicles = Array.from({ length: batchQuantity }, (_, idx) => ({
      id: vehicles.length + idx,
      capacity: vehicleCapacity,
    }));
    setVehicles([...vehicles, ...newVehicles]);
    setVehicleCapacity(0);
    setBatchQuantity(1);
  };

  const handleDeleteVehicle = (id: number) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };
  
  // Handler for when a route is selected
  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(selectedRouteId === routeId ? null : routeId);
  };

  const handleCalculateRoutes = async () => {
    if (Locations.length < 2) {
      alert("Please add at least 2 points.");
      return;
    }
    if (vehicles.length < 1) {
      alert("Please add at least 1 vehicle.");
      return;
    }
    if (depotIndex === null) {
      alert("Please select a depot from your points.");
      return;
    }

    try {
      const formattedData = {
        locations: Locations.map(loc => [loc.longitude, loc.latitude]),
        num_vehicles: vehicles.length,
        depot: depotIndex,
        capacities: vehicles.map(v => v.capacity),
        demands: Locations.map((point, index) => 
          index === depotIndex ? 0 : point.capacity
        )
      };
      
      console.log("API Request Data:", formattedData);

      // Mock response - replace with actual API call
      const mockResponse = {
        calculated_routes: {
          "0": [
            [Locations[depotIndex].longitude, Locations[depotIndex].latitude],
            ...formattedData.locations.slice(0, 2),
            [Locations[depotIndex].longitude, Locations[depotIndex].latitude]
          ],
          "1": [
            [Locations[depotIndex].longitude, Locations[depotIndex].latitude],
            ...formattedData.locations.slice(2),
            [Locations[depotIndex].longitude, Locations[depotIndex].latitude]
          ]
        }
      };

      setCalculatedRoutes(mockResponse.calculated_routes);
      
      // Auto switch to routes tab after calculation
      setActiveTab("routes");
      
      // Reset selected route
      setSelectedRouteId(null);
      
    } catch (error) {
      console.error("Error in calculating routes:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {/* Main content container */}
      <div className="flex flex-grow pt-14">
        {/* Collapsible Saved Routes Sidebar (left) */}
        <div
          className={`transition-all duration-300 border-r border-gray-200 bg-white shadow-sm flex flex-col ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <Button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="m-2 hover:bg-gray-100"
            variant="outline"
            size="sm"
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          {sidebarOpen && (
            <div className="w-full p-2">
              <h3 className="font-semibold text-lg mb-2 text-secBlue">Saved Routes</h3>
              <SavedRoutes onSelectRoute={handleSavedRouteSelect} />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow">
          <div className="flex flex-grow">
            {/* Map Section */}
            <div className="p-4 flex-grow">
              <h1 className="text-2xl font-bold py-2 text-secBlue">Route Optimizer</h1>
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-120px)]">
                <Map 
                  locations={Locations} 
                  calculatedRoutes={calculatedRoutes} 
                  selectedRouteId={selectedRouteId}
                />
              </div>
            </div>

            {/* Right Sidebar for Inputs */}
            <div className="w-96 p-4 border-l border-gray-200 bg-white shadow-sm">
              {/* Tab Header */}
              <div className="flex space-x-2 mb-6">
                <Button
                  onClick={() => setActiveTab("points")}
                  className={`flex-1 rounded-md font-medium ${
                    activeTab === "points" 
                      ? "bg-LightBlue text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <MapPin className="mr-2 h-4 w-4" /> Points
                </Button>

                <Button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex-1 rounded-md font-medium ${
                    activeTab === "vehicles" 
                      ? "bg-LightBlue text-white shadow-md" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Truck className="mr-2 h-4 w-4" /> Vehicles
                </Button>
                
                {calculatedRoutes && (
                  <Button
                    onClick={() => setActiveTab("routes")}
                    className={`flex-1 rounded-md font-medium ${
                      activeTab === "routes" 
                        ? "bg-LightBlue text-white shadow-md" 
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight className="mr-2 h-4 w-4" /> Routes
                  </Button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === "points" && (
                <div className="points-tab">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Add Points</h2>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        placeholder="Latitude"
                        className="w-1/2 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        onChange={(e) => setLatitude(Number(e.target.value))}
                      />
                      <Input
                        placeholder="Longitude"
                        className="w-1/2 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        onChange={(e) => setLongitude(Number(e.target.value))}
                      />
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Demand:</span>
                        <span className="text-sm font-medium text-gray-700">{sliderValue[0]}</span>
                      </div>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="py-4"
                      />
                    </div>
                    <Button 
                      className="w-full bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                      onClick={() => handleAddPoint(latitude, longitude, sliderValue[0])}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Point
                    </Button>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Added Points</h2>
                    <div className="h-[calc(100vh-450px)] overflow-y-auto pr-1">
                      {Locations.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No points added yet</p>
                      ) : (
                        Locations.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center mb-3">
                            <div className={`border p-3 w-full rounded-md ${depotIndex === index ? 'bg-blue-50 border-LightBlue' : 'bg-white'}`}>
                              <div className="font-medium flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                Point {index + 1} {depotIndex === index && <span className="ml-2 text-LightBlue font-bold">(Depot)</span>}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Demand: {item.capacity}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button 
                                className={`text-xs py-1 px-2 h-auto ${
                                  depotIndex === index 
                                    ? "bg-gray-300 text-gray-600 cursor-default" 
                                    : "bg-LightBlue text-white hover:bg-blue-700"
                                }`}
                                disabled={depotIndex === index}
                                onClick={() => setDepotIndex(index)}
                              >
                                Set Depot
                              </Button>
                              <Button 
                                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 h-auto"
                                onClick={() => handleDeletePoint(index)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "vehicles" && (
                <div className="vehicles-tab">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Vehicle Details</h2>
                    <div className="flex flex-col space-y-3">
                      <Input
                        placeholder="Vehicle Capacity"
                        value={vehicleCapacity || ""}
                        onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                        className="border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                      />
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Quantity"
                          value={batchQuantity || ""}
                          onChange={(e) => setBatchQuantity(Number(e.target.value))}
                          className="w-1/3 border-gray-300 focus:ring-LightBlue focus:border-LightBlue"
                        />
                        <Button 
                          className="flex-1 bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                          onClick={handleBatchAddVehicles}
                        >
                          Add Multiple
                        </Button>
                      </div>
                      <Button 
                        className="w-full bg-AccYellow text-white hover:bg-yellow-600 transition-colors"
                        onClick={handleAddVehicle}
                      >
                        <Truck className="mr-2 h-4 w-4" /> Add Single Vehicle
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Added Vehicles</h2>
                    <div className="h-[calc(100vh-450px)] overflow-y-auto pr-1">
                      {vehicles.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No vehicles added yet</p>
                      ) : (
                        vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex gap-2 items-center mb-3">
                            <div className="border p-3 w-full rounded-md bg-white">
                              <div className="font-medium flex items-center">
                                <Truck className="h-4 w-4 mr-1" />
                                Vehicle {vehicle.id + 1}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">Capacity: {vehicle.capacity}</div>
                            </div>
                            <Button 
                              className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 h-auto"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Routes Tab Content */}
              {activeTab === "routes" && calculatedRoutes && (
                <div className="routes-tab">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Calculated Routes</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Click on a route to highlight it on the map. Routes start and end at the depot.
                    </p>
                    
                    <div className="h-[calc(100vh-350px)] overflow-y-auto pr-1">
                      {Object.keys(calculatedRoutes).length === 0 ? (
                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No routes calculated</p>
                      ) : (
                        Object.entries(calculatedRoutes).map(([routeId, coordinates]) => {
                          // Get the points that this route visits (excluding depot repeats)
                          const visitedPointIndices = coordinates.map(coord => {
                            // Find the index of the location that matches these coordinates
                            return Locations.findIndex(loc => 
                              loc.longitude === coord[0] && 
                              loc.latitude === coord[1]
                            );
                          }).filter(index => index !== -1);
                          
                          // Remove duplicate depot visits (first and last point)
                          if (visitedPointIndices[0] === visitedPointIndices[visitedPointIndices.length - 1]) {
                            visitedPointIndices.pop();
                          }
                          
                          // Calculate total demand for this route
                          const totalDemand = visitedPointIndices
                            .filter(index => index !== depotIndex)
                            .reduce((sum, index) => sum + Locations[index].capacity, 0);
                          
                          // Get the vehicle for this route
                          const vehicle = vehicles[parseInt(routeId)];
                          
                          return (
                            <div 
                              key={routeId}
                              className={`border p-4 w-full rounded-md mb-3 cursor-pointer transition-all ${
                                selectedRouteId === routeId 
                                  ? 'bg-blue-100 border-LightBlue ring-2 ring-LightBlue' 
                                  : 'bg-white hover:bg-gray-100'
                              }`}
                              onClick={() => handleRouteSelect(routeId)}
                            >
                              <div className="font-medium flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-LightBlue" />
                                <span className="text-lg">Vehicle {parseInt(routeId) + 1}</span>
                              </div>
                              
                              <div className="mt-2 flex justify-between">
                                <div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Capacity:</span> {vehicle?.capacity || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Load:</span> {totalDemand} 
                                    ({Math.round((totalDemand / (vehicle?.capacity || 1)) * 100)}%)
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Points:</span> {visitedPointIndices.length}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                  <div className="text-sm font-medium text-gray-700">Route Details:</div>
                                  <div className="text-sm text-gray-600">
                                    {visitedPointIndices.map((index, i) => (
                                      <span key={i}>
                                        Point {index + 1}
                                        {i < visitedPointIndices.length - 1 ? ' → ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Calculate Routes Button */}
              {(Locations.length >= 2 && vehicles.length >= 1) && (
                <div className="mt-6">
                  <Button 
                    className="w-full bg-AccYellow hover:bg-yellow-600 text-white shadow-md py-6 text-lg font-semibold transition-all"
                    onClick={handleCalculateRoutes}
                  >
                    Calculate Routes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;