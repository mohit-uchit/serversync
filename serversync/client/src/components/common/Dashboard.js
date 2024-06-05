import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import HomePage from '../home/Homepage';
import ProfilePage from '../user/ProfilePage';
import IpList from '../ip/IpList';
import GraphsPage from '../overview/Graph';

const Dashboard = ({ toggleDarkMode }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar toggleDarkMode={toggleDarkMode} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin-left 0.3s',
          marginLeft: '240px',
          width: 'calc(100% - 240px)',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ip" element={<IpList />} />
          <Route path="/graphs" element={<GraphsPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
