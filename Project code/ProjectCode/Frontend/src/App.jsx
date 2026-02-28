import { useState } from 'react'
import io from 'socket.io-client';
import { BrowserRouter as Router,Route,Routes,Outlet } from 'react-router-dom'
import { MainLayout } from './Components/Layouts/MainLayout'
import { MainPage } from './Components/Layouts/MainPage'
import { AboutUs } from './Pages/Aboutus'
import {Login} from "./Components/Login/Login";
import {UserDashboardHome} from "./Dashboards/user/Home"
import { AdminDashboardHome } from './Dashboards/Admin/AdminDashboardHome'
import { AgentDashboardHome } from './Dashboards/Agent/AgentDashboardHome'
import {DashboardType} from "./Pages/DashboardType"
import {UserOverviewPage} from "./Dashboards/user/OverView";
import {AgentOverviewPage} from "./Dashboards/Agent/AgentOverview";
import {AdminOverviewPage}from './Dashboards/Admin/AdminOverview';
import {MyComplaints} from "./Dashboards/user/MyComplaints";
import {NewComplaint} from "./Dashboards/user/NewComplaint";
import {UserManagementTable} from "./Dashboards/Admin/UserManagement.jsx"
import { SocketProvider } from './context/ScoketContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AdminDashboardComplaints from "./Dashboards/Admin/AllComplaints.jsx"
import { SettingPage } from "./Dashboards/user/Settingspage.jsx"
import AdminReport from "./Dashboards/Admin/AdminReports.jsx"
import {AdminSettingPage} from "./Dashboards/Admin/SettingsPage.jsx"
import {AgentSettingPage} from  "./Dashboards/Agent/ProfileSettings.jsx"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AgentComplaintsSection from './Dashboards/Agent/AgentComplamtSection.jsx';
import AgentWorkLoad from "./Dashboards/Agent/AgentWorkLoad.jsx"
import AdminWorkLoad from "./Dashboards/Admin/MyWorkLoad.jsx"
function App() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <div>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Router>
          <Routes>
            <Route path='/' element={<MainLayout/>}>
              <Route index element={<MainPage/>}/>
              <Route path='/#about-us'element={<AboutUs/>}/>
            </Route>
            <Route path='/login' element={<Login/>}/>
            <Route path='/user-dashboard' element={<UserDashboardHome/>}>
            <Route index element={<UserOverviewPage/>}/>
            <Route path='my-complaints' element={<MyComplaints/>}/>
            <Route path="new-complaint" element={<NewComplaint/>}/>
            <Route path="settings" element={<SettingPage/>}/>
            </Route>
            <Route path='/admin-dashboard' element={<AdminDashboardHome/>}>
            <Route index element={<AdminOverviewPage/>}/>
            <Route path='all-complaints' element={<AdminDashboardComplaints/>}/>
            <Route path='management' element={<UserManagementTable/>}/>
            <Route path='workload' element={<AdminWorkLoad/>}/>
            <Route path='reports' element={<AdminReport/>}/>
            <Route path='settings' element={<AdminSettingPage/>}/>
            </Route>
            <Route path="/agent-dashboard" element={<AgentDashboardHome/>}>
            <Route index element={<AgentOverviewPage/>}/>
            <Route path='manage-complaints' element={<AgentComplaintsSection/>}/>
            <Route path='performance' element={<AgentWorkLoad/>}/>
            <Route path='settings' element={<AgentSettingPage/>}/>
            </Route>
            <Route path="/dashboard-type"element={<DashboardType/>}/>
          </Routes>
          
        </Router>
      </div>
    </>
  )
}

export default App
