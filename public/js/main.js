'use strict';

var reg;
var sub;
var isSubscribed = false;
var subscribeButton = document.querySelector('#subscribe');
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  navigator.serviceWorker.register('/sw.js').then(function() {
    return navigator.serviceWorker.ready;
  }).then(function(serviceWorkerRegistration) {
    reg = serviceWorkerRegistration;
    subscribeButton.disabled = false;
    console.log('Service Worker is ready :^)', reg);
    return reg.pushManager.getSubscription()
  }).then(pushSubscription => {
    // already subscribed
    if (pushSubscription) {
      sub = pushSubscription
      subscribeButton.textContent = 'Отписаться от рассылки';
      isSubscribed = true
    }
  }).catch(function(error) {
    console.log('Service Worker Error :^(', error);
  });
}
subscribeButton.addEventListener('click', function() {
  if (isSubscribed) {
    unsubscribe();
  } else {
    subscribe();
  }
});
function subscribe() {
  fetch("/key", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "GET",
  }).then(function(r) {
    return r.json()
  }).then(function(key) {
    reg.pushManager.subscribe({
      userVisibleOnly: true,
      // FIXME: not work with serverkey
      //applicationServerKey:  new Uint8Array(key.data),
    }).
    then(function(pushSubscription) {
      sub = pushSubscription
      // POST to current link
      fetch("", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(sub)
      })

      console.log('Subscribed! Endpoint:', sub.endpoint);
      subscribeButton.textContent = 'Отписаться от рассылки';
      isSubscribed = true;
    }).catch(err => console.log(err))
  })
}
function unsubscribe() {
  sub.unsubscribe().then(function(event) {
    subscribeButton.textContent = 'Подписаться на рассылку';
    console.log('Unsubscribed!', event);
    isSubscribed = false;
  }).catch(function(error) {
    console.log('Error unsubscribing', error);
    subscribeButton.textContent = 'Подписаться на рассылку';
  });
}


// curl --header "Authorization: key=AIzaSyCagQfkvzJx9b0d_CAbqSZG7BL1Lp5RIsA" --header "Content-Type: application/json" https://android.googleapis.com/gcm/send -d "{\"registration_ids\":[\"daxToB64wsk:APA91bHuMllymnN6JPCRkEgND2A4u6-yj5f5sGnkP7LTRjI0kd59lW3LJIjeJ0bw_QCxfpMoD55y0VgpktxFky7erKVL7efVLjckJSwqO4cfnhVPN7TLDQql8v7vL8c3c4fczKnJGs59\"]}"
