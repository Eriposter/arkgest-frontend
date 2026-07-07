import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem('token');

console.log('🔑 Token for broadcasting:', token ? 'Present' : 'Missing');

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: 'arkgest-key',
  wsHost: 'localhost',
  wsPort: 8080,
  wssPort: 443,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  
  // ✅ URL completa para evitar problemas de proxy
  authEndpoint: 'http://localhost:8000/broadcasting/auth',
  
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Importante para Laravel
    }
  },
});

// Debug: ver quando tenta autenticar
console.log('✅ Echo configured');