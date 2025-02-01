// config.js
const config = {
  apiKey: 'AIzaSyBRXDDuGIfObeQNtasWSTFTHx1X33b6A2Y', // Lägg din API-nyckel här
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: 'testeventmap-ffe44.firebaseapp.com',
  databaseURL:
    'https://testeventmap-ffe44-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'testeventmap-ffe44',
  storageBucket: 'testeventmap-ffe44.firebasestorage.app',
  messagingSenderId: '736230374626',
  appId: '1:736230374626:web:088053d959c0b5639272bb',
  measurementId: 'G-E14CJYYH2M',
};

export default firebaseConfig; // Exponera firebaseConfig så att den kan användas i andra filer
