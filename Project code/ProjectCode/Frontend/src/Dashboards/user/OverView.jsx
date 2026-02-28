import react,{useEffect,useState} from "react"
import axios from "axios"
import {DashboardOverviewPage} from "../../Pages/Dashboard/OverViewPage"
import axiosInstance from "../../api/AxiosInstance";
import { useSocket } from "../../context/ScoketContext"
import { useAuth } from "../../context/AuthContext";
export const UserOverviewPage=()=>{
    const {socket}=useSocket();
    const { user }=useAuth();
    const [pending,setPending]=useState(0);
    const [total,setTotal]=useState(0);
    const [resolved,setResolved]=useState(0);
    const token=localStorage.getItem('jwtToken');
    const [loading,setLoading]=useState(false);
    const fetch=async()=>{
        setLoading(true);
        try{
        const response=await axiosInstance.get("/api/list",{headers:{Authorization:`Bearer ${token}`}});
        if(response.status===200){
            setPending(response.data.pending);
            setTotal(response.data.total);
            setResolved(response.data.resolved);
        }
        else{
            alert("feching error");
        }
    }
    catch(error){
        console.log(error);
    }
    finally{
        setLoading(false);
    }

    }
    useEffect(()=>{
        fetch();
    },[])
    const IconLinks=[
    {name:"Submit New Complaint",link:'/user-dashboard/new-complaint'},
    {name:"View All Complaints",link:"/user-dashboard/my-complaints"},
    {name:"Edit Profile",link:"/user-dashboard/settings"}
  ]
    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading complaints...</p>
        </div>
    );
    return(
        <>
        <div>
            <DashboardOverviewPage heading1={"Total Submissions"} heading2={"Pending Submissions"} heading3={"Resolved Submissions"} total={total} pending={pending} resolved={resolved} IconLinks={IconLinks}/>
        </div>
        </>
    )
}
