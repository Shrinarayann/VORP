import { BrowserRouter, Routes, Route } from "react-router-dom"
import MapPage from './pages/MapPage'
import LocationProvider from './context/LocationContext'
import UserProvider from './context/UserContext'
import HomePage from "./pages/HomePage"

const App = () => {
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