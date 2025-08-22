import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [navigate]);
  
  return isAdmin() ? children : null;
};

export default AdminRoute;