import api from './axiosConfig';

const API_URL = 'https://beerbot-cfhp.onrender.com/api';

export const authService = {
  // Проверка инициализации Telegram WebApp
  isTelegramWebAppInitialized: () => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      console.error('Telegram WebApp не инициализирован');
      return false;
    }
    
    // Проверяем наличие initData
    if (!webApp.initData) {
      console.error('WebApp.initData отсутствует');
      return false;
    }
    
    // Проверяем наличие user в initDataUnsafe
    if (!webApp.initDataUnsafe?.user) {
      console.error('WebApp.initDataUnsafe.user отсутствует');
      return false;
    }
    
    return true;
  },

  // Отправка токена в Telegram
  sendTokenToTelegram: async (token) => {
    console.log('=== Отправка токена в Telegram ===');
    console.log('Token:', token);
    
    if (!authService.isTelegramWebAppInitialized()) {
      return false;
    }

    const webApp = window.Telegram.WebApp;
    console.log('WebApp данные:', {
      initData: webApp.initData,
      initDataUnsafe: webApp.initDataUnsafe,
      version: webApp.version,
      platform: webApp.platform
    });

    try {
      console.log('Отправка данных в Telegram...');
      const data = {
        action: 'auth',
        token: token,
        user: webApp.initDataUnsafe.user
      };
      console.log('Отправляемые данные:', data);
      
      webApp.sendData(JSON.stringify(data));
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
    if (!token) {
      console.error('Токен отсутствует');
      return false;
    }

    try {
      const response = await api.post('/auth/verify-token', { token });
      console.log('Ответ сервера:', response.data);
      return response.data.valid;
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      return false;
    }
  },

  // Проверка статуса админа
  checkAdminStatus: async (token) => {
    console.log('=== Проверка статуса админа ===');
    if (!token) {
      console.error('Токен отсутствует');
      return false;
    }

    try {
      const response = await api.get('/auth/check-admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Ответ сервера:', response.data);
      return response.data.isAdmin;
    } catch (error) {
      console.error('Ошибка при проверке статуса админа:', error);
      return false;
    }
  },

  // Обновление токена
  refreshToken: async (token) => {
    console.log('=== Обновление токена ===');
    if (!token) {
      console.error('Токен отсутствует');
      throw new Error('Токен не предоставлен');
    }

    try {
      const response = await api.post('/auth/refresh-token', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Ответ сервера:', response.data);
      return response.data.token;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw error;
    }
  }
}; 