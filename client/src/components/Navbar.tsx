import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/assets/LogoYellow.png';
import { useUser } from '@/context/UserContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, login, logout } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[10000]">
      <div className={`
        w-full transition-all duration-300 shadow-sm
        ${isScrolled 
          ? 'bg-secBlue py-2' 
          : 'bg-white py-3'}
      `}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 items-center">
            {/* Logo */}
            <div className="col-span-3">
              <Link to="/" className="flex items-center">
                <img src={Logo} className="h-10" alt="VORP Logo" />
                <span className={`ml-2 font-bold text-xl ${isScrolled ? 'text-white' : 'text-secBlue'}`}>
                  VORP
                </span>
              </Link>
            </div>

            {/* Navigation Links - Center aligned */}
            <div className="hidden md:flex col-span-6 justify-center">
              <div className="flex items-center space-x-8">
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
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex col-span-3 justify-end items-center space-x-4">
              <Link 
                to="/route" 
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all
                ${isScrolled 
                  ? 'bg-white text-secBlue hover:bg-blue-50' 
                  : 'bg-AccYellow text-white hover:bg-yellow-600'}`}
              >
                Try Now
              </Link>
              
              {user ? (
                <button
                  onClick={logout}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all
                  ${isScrolled 
                    ? 'bg-transparent text-white border border-white hover:bg-white hover:text-secBlue' 
                    : 'bg-transparent text-secBlue border border-secBlue hover:bg-secBlue hover:text-white'}`}
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={login}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center
                  ${isScrolled 
                    ? 'bg-transparent text-white border border-white hover:bg-white hover:text-secBlue' 
                    : 'bg-transparent text-secBlue border border-secBlue hover:bg-secBlue hover:text-white'}`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" 
                    fill="currentColor"/>
                  </svg>
                  Login with Google
                </button>
              )}
            </div>

            {/* Mobile Menu Button - Only visible on mobile */}
            <div className="md:hidden col-span-9 flex justify-end">
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
  );
};

export default Navbar;