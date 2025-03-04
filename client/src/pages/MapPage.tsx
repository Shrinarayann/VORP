// MapPage.tsx
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from '@/context/LocationContext';
import { Slider } from "@/components/ui/slider";

const MapPage: React.FC = () => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number[]>([33]);
  const [numVehicles, setNumVehicles] = useState<number>(4);

  const { Locations, setLocations } = useLocation();

  // Add a new location point
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

  // Delete a location at the given index
  const handleDeleteLocation = (index: number) => {
    const updatedLocations = Locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  // Placeholder for calculating routes based on current settings
  const handleCalculateRoutes = () => {
    console.log("Calculating routes with", numVehicles, "vehicles and these locations:", Locations);
    // TODO: Implement route calculation (e.g., call your backend API)
  };

  return (
    <div className='w-full h-screen flex flex-col'>
      <Navbar />

      <div className='flex items-center h-full -mt-14 mx-10 '>
        {/* Map Section */}
        <div className='h-[70%] w-[70%] '>
          <h1 className='text-2xl font-semibold py-2'>Route Optimizer</h1>
          <Map locations={Locations} />
        </div>

        {/* Sidebar Section */}
        <div className='flex w-[30%] h-[600px] flex-col justify-center '>
          <div className='flex flex-col justify-center h-auto w-[100%] space-y-4 px-10 pt-8'>
            <h2 className='text-2xl font-semibold'>Add Points</h2>
            <div className='flex space-x-2'>
              <Input
                placeholder='Latitude'
                className='w-[50%] bg-secBlue text-priWhite'
                onChange={(e) => setLatitude(Number(e.target.value))}
              />
              <Input
                placeholder='Longitude'
                className='w-[50%] bg-secBlue text-priWhite'
                onChange={(e) => setLongitude(Number(e.target.value))}
              />
            </div>

            {/* Number of Vehicles Field */}
            <div className='flex space-x-2'>
              <Input
                placeholder='Number of Vehicles'
                type="number"
                value={numVehicles}
                onChange={(e) => setNumVehicles(Number(e.target.value))}
                className='w-full bg-secBlue text-priWhite'
              />
            </div>

            {/* Demand Slider */}
            <div className="">
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
              className='bg-AccYellow text-priWhite'
              onClick={() => handleAddPoint(latitude, longitude, sliderValue[0])}
            >
              Add
            </Button>
          </div>

          {/* Locations List & Calculate Button */}
          <div className='flex flex-col items-center pb-8'>
            <h2 className='text-2xl font-semibold py-4'>Added Locations</h2>
            <div className="w-full h-[250px] overflow-y-auto px-10">
              {Locations.length === 0 ? (
                <p className="text-center text-gray-600">No points added yet</p>
              ) : (
                Locations.map((item, index) => (
                  <div key={index} className='flex gap-2 items-center py-1 mb-2'>
                    <div className='border p-2 w-full rounded-md bg-white'>
                      <div className="font-medium">Point {index + 1}</div>
                      <div className="text-sm">
                        Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Capacity: {item.capacity}
                      </div>
                    </div>
                    <Button className="bg-red-500 text-white" onClick={() => handleDeleteLocation(index)}>
                      Delete
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Calculate Routes Button - visible only if at least 2 locations exist */}
            {Locations.length >= 2 && (
              <Button className='bg-green-500 text-white mt-4' onClick={handleCalculateRoutes}>
                Calculate Routes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
