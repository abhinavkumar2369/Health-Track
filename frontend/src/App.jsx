import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './Homepage/Homepage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const userData = localStorage.getItem('user');
  
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }
  
  const user = JSON.parse(userData);
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient-dashboard" 
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pharmacist-dashboard" 
          element={
            <ProtectedRoute allowedRole="pharmacist">
              <PharmacistDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
