import axios from 'axios';

const API_URL = 'https://beerbot-cfhp.onrender.com/api';

export const authService = {
  async refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  async sendTokenToTelegram(token) {
    if (!window.Telegram?.WebApp) {
      console.log('Telegram WebApp is not available');
      return false;
    }

    try {
      const data = {
        action: 'auth',
        token: token
      };
      window.Telegram.WebApp.sendData(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending token to Telegram:', error);
      return false;
    }
  }
}; 