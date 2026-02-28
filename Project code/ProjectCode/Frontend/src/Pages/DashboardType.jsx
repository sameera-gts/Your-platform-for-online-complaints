import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const DashboardType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedType = queryParams.get("");
  console.log(queryParams)
  console.log(requestedType);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchUserRoles = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await axios.get(`${url}/api/role`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        });
        setUserRoles(response.data);
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError("Failed to fetch user roles. Please try again.");
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/login', { replace: true });
        } 
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [navigate, url]);

  useEffect(() => {
    if (!loading && !error && userRoles.length > 0) {
      let targetPath = null;

      if (requestedType) {
        const fullRequestedPath = `/${requestedType}`;
        if (userRoles.includes(fullRequestedPath)) {
          targetPath = fullRequestedPath;
        }
      }
      console.log(targetPath);
      if (!targetPath && userRoles.length > 0) {
        targetPath = userRoles[0];
      }
      console.log(targetPath)
      if (targetPath) {
        navigate(targetPath, { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    } else if (!loading && !error && userRoles.length === 0) {
        navigate('/unauthorized', { replace: true });
    }
  }, [loading, error, userRoles, requestedType, navigate]);

  if (loading) {
    return <div>Loading dashboard access...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Redirecting to dashboard...</div>;
};