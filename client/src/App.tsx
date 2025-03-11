import { BrowserRouter, Routes, Route } from "react-router-dom"
import MapPage from './pages/MapPage'
import LocationProvider from './context/LocationContext'
import UserProvider from './context/UserContext'
import HomePage from "./pages/HomePage"
import { testSupabaseConnection } from './auth/supabase'
import React from 'react'

const App = () => {
  React.useEffect(() => {
    // Test Supabase connection on app start
    testSupabaseConnection()
      .then(result => {
        console.log("Supabase connection test result:", result);
      })
      .catch(err => {
        console.error("Failed to test Supabase connection:", err);
      });
  }, []);

  return (
    <UserProvider>
      <LocationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/route" element={<MapPage />}></Route>
            <Route path= '/' element={<HomePage />}></Route>
          </Routes> 
        </ BrowserRouter>
      </LocationProvider>
    </UserProvider>
  )
}

export default App