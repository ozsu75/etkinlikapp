// Frontend'de bir yardımcı fonksiyon
export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.email === process.env.REACT_APP_ADMIN_EMAIL;
};

// Admin route koruması
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

// Kullanımı
<Route 
  path="/admin/*" 
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  } 
/>