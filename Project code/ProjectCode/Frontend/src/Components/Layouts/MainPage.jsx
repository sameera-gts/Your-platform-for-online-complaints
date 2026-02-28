import React,{useEffect} from 'react'
import { HeaderPage } from '../../Pages/HeaderPage'
import { AboutUs } from '../../Pages/Aboutus'
import { Features } from '../../Pages/Features';
import { useLocation,useNavigate,Link } from 'react-router-dom';
import { HowItWorks } from '../../Pages/HowItWorks';
export const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      else{
            window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash]);
  return (
    <div className='w-full  py-1'>
        <HeaderPage/>
        <div id='about-us'>
            <AboutUs/>
        </div>
        <div id='features'>
            <Features/>
        </div>
        <div id='how-it-works'>
            <HowItWorks/>
        </div>
    </div>
  )
}
