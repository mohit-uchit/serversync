// src/components/home/HomePage.js

import React from 'react';
import { styled } from '@mui/system';
import { AppBar, Toolbar, Typography, Container, Paper, Button, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Content = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Footer = styled('footer')(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const HomePage = ({ toggleDarkMode }) => {
  return (
    <Root>
      <CustomAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Material-UI Sample Homepage
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            <Brightness4Icon />
          </IconButton>
        </Toolbar>
      </CustomAppBar>
      <Content>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Our Website!
          </Typography>
          <Typography variant="body1" paragraph>
            This is a sample homepage built with Material-UI.
          </Typography>
          <Button variant="contained" color="primary">
            Get Started
          </Button>
        </Paper>
      </Content>
      <Footer>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Material-UI Sample Homepage
          </Typography>
        </Container>
      </Footer>
    </Root>
  );
};

export default HomePage;
