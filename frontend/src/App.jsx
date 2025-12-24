import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddReview from './pages/AddReview';
import EditReview from './pages/EditReview';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import UserProfile from './pages/UserProfile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddReview /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditReview /></PrivateRoute>} />
          
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
