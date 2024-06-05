import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const AuthService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },
  signup: async (firstName, lastName, email, password, role) => {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      firstName,
      lastName,
      email,
      password,
      role,
    });
    return response.data;
  },
  setAuthToken: (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  },
};

export default AuthService;
