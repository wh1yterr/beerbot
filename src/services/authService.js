import api from './axiosConfig';

const API_URL = 'https://beerbot-cfhp.onrender.com/api';

export const authService = {
  // Отправка токена в Telegram
  sendTokenToTelegram: async (token) => {
    console.log('=== Отправка токена в Telegram ===');
    console.log('Token:', token);
    
    const webApp = window.Telegram?.WebApp;
    console.log('WebApp доступен:', !!webApp);
    
    if (!webApp) {
      console.error('Telegram WebApp не инициализирован');
      return false;
    }

    try {
      console.log('Отправка данных в Telegram...');
      webApp.sendData(JSON.stringify({ action: 'auth', token }));
      console.log('Данные успешно отправлены');
      return true;
    } catch (error) {
      console.error('Ошибка при отправке данных в Telegram:', error);
      return false;
    }
  },

  // Проверка токена
  verifyToken: async (token) => {
    console.log('=== Проверка токена ===');
    try {
      const response = await api.post('/auth/verify-token', { token });
      console.log('Токен валиден:', response.data.valid);
      return response.data.valid;
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      return false;
    }
  },

  // Проверка статуса админа
  checkAdminStatus: async (token) => {
    console.log('=== Проверка статуса админа ===');
    try {
      const response = await api.get('/auth/check-admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Статус админа:', response.data.isAdmin);
      return response.data.isAdmin;
    } catch (error) {
      console.error('Ошибка при проверке статуса админа:', error);
      return false;
    }
  },

  // Обновление токена
  refreshToken: async (token) => {
    console.log('=== Обновление токена ===');
    try {
      const response = await api.post('/auth/refresh-token', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Токен обновлен');
      return response.data.token;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw error;
    }
  }
}; 