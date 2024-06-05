import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Paper, Box } from '@mui/material';
import AuthService from '../../services/auth/AuthService';
import { Navigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await AuthService.login(email, password);
      AuthService.setAuthToken(data.payload.token);
      setIsLoggedIn(true);
      onLogin(); // Notify parent component of login
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (isLoggedIn) {
    return <Navigate to="/ip" />;
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
