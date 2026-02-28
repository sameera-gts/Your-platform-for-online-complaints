import react,{useEffect,useState} from "react"
import axios from "axios"
import axiosInstance from "../../api/AxiosInstance";
import {DashboardOverviewPage} from "../../Pages/Dashboard/OverViewPage"
export const AgentOverviewPage=()=>{
    const [pending,setPending]=useState(0);
        const [total,setTotal]=useState(0);
        const [resolved,setResolved]=useState(0);
        const token=localStorage.getItem('jwtToken');
        const fetch=async()=>{
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
        useEffect(()=>{
            fetch();
        },[])

        const IconLinks=[
        {name:"My Workload",link:'/agent-dashboard/performance'},
        {name:"Manage Complaints",link:"/agent-dashboard/manage-complaints"},
        {name:"Edit Profile",link:"/agent-dashboard/settings"}
    ]
    return(
        <div>
            <DashboardOverviewPage heading1={"Total Complaints Assigned"} heading2={"Pending Complaints"} heading3={"Resolved Complaints"} total={total} pending={pending} resolved={resolved} IconLinks={IconLinks}/>
        </div>
    )
}
