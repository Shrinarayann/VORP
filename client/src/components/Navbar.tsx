import React from 'react'
import Logo from '@/assets/LogoYellow.png'

const Navbar: React.FC = () => {
  return (
    <nav>
        <ul className='flex justify-between w-full bg-secBlue h-16 items-center space-x-4 top-0 fixed z-10'>  
            <img src={Logo} className='h-14 px-4' / >
            <div className='flex space-x-4 px-10'>
                <li className='font-medium text-WhiteText'>Home</li>
                <li className='font-medium text-WhiteText'>About</li>
                <li className='font-medium text-WhiteText'>Contact</li>
            </div>
        </ul>
    </nav>
  )
}

export default Navbar