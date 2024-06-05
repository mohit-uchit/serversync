import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth/AuthService';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    AuthService.logout();
    onLogout();
    navigate('/login');
  }, [navigate, onLogout]);

  return (
    <div>
      Logging out...
    </div>
  );
};

export default Logout;
