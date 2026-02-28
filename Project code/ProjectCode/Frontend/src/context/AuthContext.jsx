import {useState,useEffect,useContext,useRef,createContext} from "react";
import axiosInstance from "../api/AxiosInstance";
const AuthContext=createContext();
export const AuthProvider=({ children })=>{
    const [user,setUser]=useState(null);
    const [token,setToken]=useState(localStorage.getItem('jwtToken'));
    useEffect(()=>{
  const fetch=()=>{
  axiosInstance.get(`/api/das/profile`,{ headers: { Authorization: `Bearer ${token}` }})
  .then((response)=>{
    console.log(response.data);
    setUser(response.data);
  })
  .catch((error)=>{
    console.log(error);
  })
}
fetch();
},[fetch])

return(
    <AuthContext.Provider value={{user}}>
        { children }
    </AuthContext.Provider>
)
};
export const useAuth = () => useContext(AuthContext);