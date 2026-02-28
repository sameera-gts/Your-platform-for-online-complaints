import React from 'react'
import { BrowserRouter as Router,Route,Routes,Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { Fottor } from '../Fottor/Fottor'
export const MainLayout = () => {
  return (
    <div className='flex flex-col h-screen bg-gray-100 font-inter'>
        <Navbar/>
        <main className="flex-grow container mx-auto ">
        <Outlet />
        </main>
        <Fottor/>
    </div>
  )
}
