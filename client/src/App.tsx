import { BrowserRouter, Routes, Route } from "react-router-dom"
import MapPage from './pages/MapPage'
import LocationProvider from './context/LocationContext'

const App = () => {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />}></Route>
        </Routes> 
      </ BrowserRouter>
    </LocationProvider>
  )
}

export default App