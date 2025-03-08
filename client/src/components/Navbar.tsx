import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/assets/LogoYellow.png'

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`
        w-full transition-all duration-300 shadow-sm
        ${isScrolled 
          ? 'bg-secBlue py-2' 
          : 'bg-white py-3'}
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={Logo} className="h-10" alt="VORP Logo" />
              <span className={`ml-2 font-bold text-xl ${isScrolled ? 'text-white' : 'text-secBlue'}`}>
                VORP
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`font-medium text-base hover:opacity-80 transition-opacity ${
                  isScrolled ? 'text-white' : 'text-secBlue'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/route" 
                className={`font-medium text-base hover:opacity-80 transition-opacity ${
                  isScrolled ? 'text-white' : 'text-secBlue'
                }`}
              >
                Route Planner
              </Link>
              <Link 
                to="/about" 
                className={`font-medium text-base hover:opacity-80 transition-opacity ${
                  isScrolled ? 'text-white' : 'text-secBlue'
                }`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium text-base hover:opacity-80 transition-opacity ${
                  isScrolled ? 'text-white' : 'text-secBlue'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link 
                to="/route" 
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all
                ${isScrolled 
                  ? 'bg-white text-secBlue hover:bg-blue-50' 
                  : 'bg-AccYellow text-white hover:bg-yellow-600'}`}
              >
                Try Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                className={`p-2 rounded-md ${isScrolled ? 'text-white' : 'text-secBlue'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar