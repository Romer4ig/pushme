'use strict';

var pushMessage = {};

console.log('Started', self);
self.addEventListener('install', function(event) {
  self.skipWaiting()
  console.log('Installed', event)
});

self.addEventListener('activate', function(event) {
  console.log('Activated', event);
});

self.addEventListener('push', function(event) {
  console.log('Push message', event);
  pushMessage = event.data.json()
  console.log(pushMessage)

  event.waitUntil(
    self.registration.showNotification(pushMessage.title, {
      body: pushMessage.body,
      icon: pushMessage.icon,
      tag: pushMessage.tag
    }));

});
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click: tag ', event.notification.tag);
  event.notification.close();
  var url = pushMessage.link;
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
