import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Switch, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = ({ isLoggedIn, onLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/logout');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          IP List
        </Typography>
        {isLoggedIn ? (
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        ) : (
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Button color="inherit">Login</Button>
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;


