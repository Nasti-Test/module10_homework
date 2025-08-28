const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const geoBtn = document.getElementById('geoBtn');

let socket;

function connectWebSocket() {
  socket = new WebSocket('wss://echo.websocket.org');
  
  socket.onopen = () => {
    console.log('Соединение установлено');
    addMessage('Подключено к чату', false);
  };
  
  socket.onerror = (error) => {
    console.error('Ошибка соединения:', error);
    addMessage('Ошибка подключения к серверу', false);
  };
  
  socket.onmessage = (event) => {
    console.log('Ответ сервера:', event.data);
    
    if (!event.data.startsWith('https://www.openstreetmap.org')) {
      addMessage(event.data, false);
    }
  };
}

function addMessage(text, isUser = false, isGeo = false) {
  const message = document.createElement('div');
  message.classList.add('message');
  message.classList.add(isUser ? 'user-message' : 'server-message');
  
  if (isGeo) {
    message.classList.add('geo-message');
    const link = document.createElement('a');
    link.href = text;
    link.target = '_blank';
    link.textContent = 'Моя геолокация';
    message.appendChild(link);
  } else {
    message.textContent = text;
  }
  
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  
  if (!message) {
    alert('Введите сообщение');
    return;
  }
  
  if (socket.readyState === WebSocket.OPEN) {
    addMessage(message, true);
    socket.send(message);
    messageInput.value = '';
  } else {
    console.error('Соединение неактивно');
    addMessage('Соединение разорвано. Переподключение...', false);
    connectWebSocket(); 
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    addMessage('Геолокация не поддерживается вашим браузером', true);
    return;
  }
  
  geoBtn.disabled = true;
  geoBtn.textContent = 'Определение...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
      addMessage(url, true, true);
      if (socket.readyState === WebSocket.OPEN) {
       socket.send(url);
      } else {
        console.error('WebSocket не готов к отправке');
      }
      
      geoBtn.disabled = false;
      geoBtn.textContent = 'Гео-локация';
    },
    (error) => {
      addMessage(`Ошибка получения геолокации: ${error.message}`, true);
      geoBtn.disabled = false;
      geoBtn.textContent = 'Гео-локация';
    }
  );
});

connectWebSocket();