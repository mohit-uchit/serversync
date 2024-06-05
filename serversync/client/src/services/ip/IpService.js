import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAccessToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Access token not found');
  }
  return token;
};

export const getIpList = async (page, pageSize, filters) => {
  const response = await axios.get(`${API_URL}/ip`, {
    params: { page, pageSize, filters: filters || false },
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.data;
};

export const searchIpRecords = async term => {
  const response = await axios.get(`${API_URL}/ip/search`, {
    params: { term },
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.data;
};

export const updateIpStatus = async ipPortArray => {
  const response = await axios.post(
    `${API_URL}/ip/status`,
    { ips: ipPortArray },
    {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  );
  return response.data;
};

export const deleteIpLogs = async ips => {
  const response = await axios.delete(`${API_URL}/ip/delete`, {
    data: { ips: ips },
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.data;
};

export const checkAndUpdateIpStatus = async ipPortArray => {
  const response = await axios.post(
    `${API_URL}/ip/update`,
    { ips: ipPortArray },
    {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  );
  return response.data;
};
