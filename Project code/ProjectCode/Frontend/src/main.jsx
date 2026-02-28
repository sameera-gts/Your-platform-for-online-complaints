import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/Notification.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/ScoketContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <SocketProvider>
            <App />
        </SocketProvider>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
)
