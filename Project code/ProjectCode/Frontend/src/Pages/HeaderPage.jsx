import React,{useEffect,useState} from 'react';
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import axios from "axios"
import {toast} from "react-toastify"
export const HeaderPage = () => {
  const token=localStorage.getItem('jwtToken');
  const [profile,setProfile]=useState('');
  const navigate=useNavigate();
  useEffect(()=>{
    const url=`${import.meta.env.VITE_SERVER_URL}`
    axios.get(`${url}/api/das/profile`,{headers:{Authorization:`Bearer ${token}`},withCredentials:true})
    .then((response)=>{
      console.log(response.data);
      setProfile(response.data);
    })
    .catch((error)=>{
      console.log(error);
    })
    },[])
  const onClickComplaint=()=>{
    if(profile.role==='user'){
      navigate('/user-dashboard/new-complaint')
    }
    else{
      toast.info("Sorry!Complaint can submit only User!");
    }
  }
  return (
    <div className='bg-gradient-to-r from-[#007FFF] to-[#0056b3] text-white flex justify-center items-center py-32 px-4 sm:px-6 lg:px-8 min-h-[60vh] rounded-b-2xl shadow-xl'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight sm:leading-tight lg:leading-snug mb-4'>
          Your Concerns, Our Priority.
        </h1>
        <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight sm:leading-tight lg:leading-snug mb-6'>
          Resolved, Effortlessly.
        </h1>
        
        <p className='text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10'>
          A centralized platform for efficient complaint resolution and improved satisfaction.
        </p>
        
        <button className='bg-white text-[#007FFF] font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300' onClick={()=>onClickComplaint()}>
          Submit Your Complaint Now
        </button>
      </div>
    </div>
  );
}
