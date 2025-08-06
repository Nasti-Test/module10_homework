document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const messageInput = document.getElementById('massageInput');
  const sendBtn = document.getElementById('sendBtn');
  const geoBtn = document.getElementById('geoBtn');

  const socket = new WebSocket('wss://echo-ws-service.herokuapp.com');

  socket.addEventListener('open', () => {
   console.log('WebSocket подключён!', socket.readyState);
  });

  socket.addEventListener('error', (error) => {
   console.error('Ошибка WebSocket:', error);
  });

  socket.addEventListener('close', () => {
   console.log('WebSocket закрыт');
  });

  function addMessageToChat(messageInput, isUser = false, isGeo = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (isUser) {
        messageElement.classList.add('user-message');
    } else if (isGeo) {
        messageElement.classList.add('geo-message');
    } else {
        messageElement.classList.add('server-message');
    }

    if (isGeo) {
        const link = document.createElement('a');
        link.href = message;
        link.target = '_blank';
        link.textContent = 'Моя геолокация';
        messageElement.appendChild(link);
    } else {
        messageElement.textContent = message;
    }

    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
  }

  socket.addEventListener('message', (event) => {
    if (!event.data.startsWith('https://www.openstreetmap.org')) {
        addMessageToChat(event.data);
    }
  })

  sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();

    if (!message) {
        alert('Введите сообщение');
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      console.log('Отправка сообщения:', message);
      socket.send(message);
      addMessageToChat(message, true);
      messageInput.value = "";
    } else {
      console.error('Соединение не активно. Статус:', socket.readyState);
    } 
  });

  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
  });

  geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        addMessageToChat('Геолокация не поддерживается вашим браузером', true);
        return;
    }

    geoBtn.disabled = true;
    geoBtn.textContent = 'Определение...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const geoUrl = 'https://www.openstreetmap.org/#map=18/${latitude}/${longitude}';
            addMessageToChat(geoUrl, true, true);

            socket.send(geoUrl);

            geoBtn.disabled = false;
            geoBtn.textContent = 'Гео-локация';
        },
        (error) => {
            addMessageToChat('Ошибка получения геолокации: ${error.message}', true);
            geoBtn.disabled = false;
            geoBtn.textContent = 'Гео-локация';
        }
    );
  });
});

<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></meta>