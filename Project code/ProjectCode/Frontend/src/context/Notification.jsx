import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(0);

  const addNotification = useCallback((message, type = 'success', duration = 3000) => {
    const id = nextId;
    setNextId(prevId => prevId + 1);

    const newNotification = {
      id,
      message,
      type, // 'success' or 'error' (or 'warning', 'info' if you expand)
      duration,
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);

    // Automatically remove after duration
    setTimeout(() => {
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id)
      );
    }, duration);
  }, [nextId]);

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
      {/* NotificationContainer will be rendered here */}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};


const NotificationContainer = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col space-y-3">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  );
};


const Notification = ({ message, type }) => {
  const baseClasses = "p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform ease-out";
  let typeClasses = "";

  switch (type) {
    case 'success':
      typeClasses = "bg-green-500 hover:bg-green-600";
      break;
    case 'error':
      typeClasses = "bg-red-500 hover:bg-red-600";
      break;
    default:
      typeClasses = "bg-gray-700 hover:bg-gray-800";
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
};