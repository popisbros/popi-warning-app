// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyBgk6r_OseUsmtoikoFq61kW1cFy8LTcWQ",
  authDomain: "popiwarningapp.firebaseapp.com",
  projectId: "popiwarningapp",
  storageBucket: "popiwarningapp.firebasestorage.app",
  messagingSenderId: "791836519675",
  appId: "1:791836519675:web:38de74d0308d341890945e",
  measurementId: "G-LVPT7G23EJ"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Popi Warning';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new warning notification',
    icon: '/Design/WIKE - Colors (Logo & App).jpg',
    badge: '/Design/WIKE - Colors (Logo & App).jpg',
    tag: 'popi-warning',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
