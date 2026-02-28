import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';

export const DashboardHomeOutlet = ({ userData, open, setOpen, Links, name, small }) => {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const location = useLocation();
  console.log(userData);
  useEffect(() => {
    const currentLink = Links.find(link => location.pathname === link.link);
    if (currentLink) {
      setActiveTitle(currentLink.name);
    } else {
      const parentLink = Links.find(link => location.pathname.startsWith(link.link) && link.link !== '/');
      if (parentLink) {
        setActiveTitle(parentLink.name);
      } else {
        setActiveTitle(name.split(' ')[0] + " Dashboard"); // Default for unexpected paths
      }
    }
  }, [location.pathname, Links, name]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-white shadow-lg h-screen text-gray-800 ${open ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col`}>
        <div className={`bg-[#007FFF] text-white font-bold h-20 flex items-center justify-center`}>
          <h1 className="py-4 px-2 font-extrabold text-2xl overflow-hidden whitespace-nowrap">
            {!open ? name : small}
          </h1>
        </div>

        <div className="flex-1 mt-4 overflow-y-auto">
          {Links.map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              className={({ isActive }) =>
                `flex items-center p-4 mx-2 my-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#007FFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#007FFF]'
                }`
              }
              end={item.link === Links[0].link}
            >
              <div className="text-xl">
                {item.icon}
              </div>
              {!open && <span className="ml-4 text-md font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className={`p-4 bg-gray-50 border-t border-gray-200 flex ${open ? 'justify-center' : 'items-center'} transition-all duration-300 ease-in-out`}>
          {open ? (
            <FaUserCircle className="text-3xl text-gray-600" />
          ) : (
            <div className="flex items-center space-x-3">
            <div
                  className="w-10 h-10 bg-[#007FFF] text-white rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
                  
                >
                  {userData?.username?.substring(0,2)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">{userData?.username}</span>
                <span className="text-gray-500 text-xs whitespace-nowrap">{userData?.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 flex items-center justify-between z-10">
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-600 hover:text-[#007FFF] focus:outline-none focus:text-[#007FFF]"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{activeTitle}</h2>

          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-700 hidden sm:block">{userData.username}</span>
            <div
                  className="w-10 h-10 bg-[#007FFF] text-white rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
                  
                >
                  {userData.username?.substring(0,2)}
              </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};