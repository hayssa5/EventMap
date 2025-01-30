// Importera Firebase och Firestore moduler från den senaste versionen
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

// Firebase-konfiguration och initialisering
const firebaseConfig = {
  apiKey: 'AIzaSyAuQ76KzJzAsqr3Hh69mMBCtIZtdi8s3tk',
  authDomain: 'testeventmap-ffe44.firebaseapp.com',
  databaseURL:
    'https://testeventmap-ffe44-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'testeventmap-ffe44',
  storageBucket: 'testeventmap-ffe44.firebasestorage.app',
  messagingSenderId: '736230374626',
  appId: '1:736230374626:web:088053d959c0b5639272bb',
  measurementId: 'G-E14CJYYH2M',
};

// Initialisera firebaseConfig och skapa en referens till Firestore databasen
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Hämta formulär och knappar
document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  console.log('Försöker registrera användare med:', email, password);
  registerUser(email, password);

  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  loginUser(email, password);

  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
});

const handleError = (error) => {
  if (!error || !error.code) {
    alert('Ett okänt fel inträffade.');
    console.error('Okänt fel:', error);
    return;
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      alert('E-postadressen används redan.');
      console.error('E-postadressen används redan.');
      break;
    case 'auth/invalid-email':
      alert('Ogiltig e-postadress.');
      console.error('Ogiltig e-postadress.');
      break;
    case 'auth/weak-password':
      alert('Lösenordet är för svagt.');
      console.error('Lösenordet är för svagt.');
      break;
    case 'auth/user-not-found':
      alert('Användaren hittades inte.');
      console.error('Användaren hittades inte.');
      break;
    case 'auth/wrong-password':
      alert('Fel lösenord. Försök igen.');
      console.error('Fel lösenord.');
      break;
    default:
      alert('Ett fel inträffade: ' + error.message);
      console.error('Ett fel inträffade:', error.message);
  }
};

// Funktion för att registrera användare
const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    alert(
      'Registrering lyckades! Du är nu inloggad som ' +
        userCredential.user.email
    );
    console.log('Användare skapad:', userCredential.user);

    // Visa inte logga ut-knappen och visa formulär
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
  } catch (error) {
    handleError(error);
  }
};

// Funktion för att logga in användare
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    alert(
      'Inloggning lyckades! Välkommen tillbaka ' + userCredential.user.email
    );
    console.log('Inloggad användare:', userCredential.user);

    // Visa logga ut-knappen och visa formulär
    document.getElementById('logout-button').style.display = 'block';
    document.getElementById('auth-section').style.display = 'block';
  } catch (error) {
    handleError(error);
  }
};

// Funktion för att logga ut användare
const logoutUser = async () => {
  try {
    await signOut(auth);
    alert('Du har loggat ut.');
    console.log('Användaren har loggat ut');

    // Döljer logga ut-knappen och visar andra formulär
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
  } catch (error) {
    console.error('Fel vid utloggning:', error.message);
    alert('Fel: ' + error.message);
  }
};

document.getElementById('logout-button').addEventListener('click', logoutUser);

// Skapa Leaflet karta som är centrerad på Helsingborg
var map = L.map('map').setView([56.05, 12.7], 13);

// Lägg till OpenStreetMap som kartlager
var osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

// Lägg till satellitkartlager från Esri
var satelliteLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  }
);

// Lägg till en kontroll för att växla mellan kartlagren
L.control
  .layers({
    OpenStreetMap: osmLayer,
    Satellite: satelliteLayer,
  })
  .addTo(map);

// Lägg till OpenStreetMap som standardlager
osmLayer.addTo(map);

// Startar geolokaliseringen för att hitta användarens plats och centrerar den, zoom 0-20, webläsarens geolokaliseringstjänster -Wi-Fi -Ip -GPS
map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: false });

let userLocation = null;
let userMarker = null;
let userCircle = null;

map.on('locationfound', function (e) {
  userLocation = e.latlng;
  addUserMarkerAndCircle(userLocation, 'Du är här!');
});

// Fallback om plats inte kan hämtas
map.on('locationerror', function () {
  const defaultLocation = [56.05, 12.7];
  userLocation = L.latLng(defaultLocation);
  addUserMarkerAndCircle(userLocation, 'Standardposition (Helsingborg)!');
});

// Lägg till en användarmarkör och cirkel
function addUserMarkerAndCircle(location, popupText) {
  if (!userMarker) {
    userMarker = L.marker(location).addTo(map).bindPopup(popupText).openPopup();
  }
  if (!userCircle) {
    userCircle = L.circle(location, {
      color: 'blue',
      fillColor: '#3388ff',
      fillOpacity: 0.2,
      radius: 100,
    }).addTo(map);
  }
}

let firstEvent = null;
let secondEvent = null;
let routeControl = null;
const eventMarkers = []; // Array för alla eventmarkörer
let routes = []; // Array för rutter

// Funktion för att formatera Firestore timestamp till Date-objekt (europeisk tid)
function formatEventTime(firestoreTimestamp) {
  const timestamp = firestoreTimestamp.toDate();
  return timestamp.toLocaleString('sv-SE', {
    weekday: 'short', // Mån
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit', // 24 timmar
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
    hour12: false, // Stänger av AM/PM
  });
}

// Funktion som hanterar klick på markör
function onEventClick(marker, event) {
  marker
    .bindPopup(
      `<b>${event.Name}</b><br>${event.Description}<br>Plats: ${
        event.City
      }<br>Tid: ${formatEventTime(event.startTime)} - ${formatEventTime(
        event.endTime
      )}`
    )
    .openPopup();

  if (!firstEvent) {
    firstEvent = marker;
  } else if (!secondEvent) {
    secondEvent = marker;
    createRoute(firstEvent, secondEvent, event);
  } else {
    resetSelection();
    onEventClick(marker, event);
  }
}

// Skapa och visa rutt mellan två markörer
function createRoute(marker1, marker2, event) {
  routeControl = L.Routing.control({
    waypoints: [marker1.getLatLng(), marker2.getLatLng()],
    createMarker: () => null,
  })
    .on('routesfound', function (e) {
      const route = e.routes[0];
      const durationText = `${Math.floor(
        route.summary.totalTime / 3600
      )} h ${Math.round((route.summary.totalTime % 3600) / 60)} min`;
      const distanceText =
        route.summary.totalDistance < 1000
          ? `${Math.round(route.summary.totalDistance)} m`
          : `${(route.summary.totalDistance / 1000).toFixed(1)} km`;

      marker2
        .bindPopup(
          `<b>${event.Name}</b><br>${event.Description}<br>Plats: ${
            event.City
          }<br>Tid: ${formatEventTime(event.startTime)} - ${formatEventTime(
            event.endTime
          )}<br>Kortaste vägen:<br>- Avstånd: ${distanceText}<br>- Tid: ${durationText}`
        )
        .openPopup();
    })
    .addTo(map);
}

// Rensa val och ta bort tidigare rutt
function resetSelection() {
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }
  firstEvent = null;
  secondEvent = null;
}

// Lägg till eventlyssnare för sökknappen
document.getElementById('search-button').addEventListener('click', function () {
  const cityInput = document.getElementById('city-input').value.trim();
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';

  if (!cityInput) {
    alert('Vänligen ange en stad eller region.');
    return;
  }

  // Ta bort tidigare eventmarkörer och popup-fönster
  eventMarkers.forEach((marker) => map.removeLayer(marker));
  eventMarkers.length = 0;

  // Ta bort tidigare rutter
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }

  // Nollställ val av markörer för rutt
  resetSelection();

  // Hämta events från Firestore på region eller stad
  getDocs(collection(db, 'Events')).then((result) => {
    let foundEvents = false;

    result.forEach((doc) => {
      const event = doc.data();
      const eventCity = event.City?.toLowerCase() || '';
      const eventRegion = event.Region?.toLowerCase() || '';

      // Filtrera på inskrivena staden eller region
      if (
        eventCity === cityInput.toLowerCase() ||
        (cityInput.toLowerCase() === 'skåne' && eventRegion === 'skåne')
      ) {
        foundEvents = true;
        const coordinates = event.Coordinates;

        // Kontrollera koordinaternas giltighet
        if (Array.isArray(coordinates) && coordinates.length === 2) {
          const marker = L.marker(coordinates).addTo(map);
          eventMarkers.push(marker); // Lägg till markören i markers-arrayen

          // Koppla klickhändelsen till markören
          marker.on('click', () => onEventClick(marker, event));

          const listItem = document.createElement('li');
          listItem.innerHTML = `<b>${event.Name}</b>: ${event.Description}`;
          listItem.style.cursor = 'pointer';
          eventList.appendChild(listItem);

          // Koppla klickhändelse på listobjektet till markören
          listItem.addEventListener('click', () => {
            map.setView(marker.getLatLng(), 14);
            onEventClick(marker, event); // Trigga samma funktion som för markörklick
          });
        }
      }
    });

    if (!foundEvents) {
      alert(`Inga event hittades i ${cityInput}.`);
    }
  });
});

// Hitta elementet där QR-koden ska visas
const qrcodeContainer = document.getElementById('qrcode');
console.log(qrcodeContainer);

// Skapa en QR-kod med rätt metod
QRCode.toCanvas(qrcodeContainer, 'https://hayssa5.github.io/EventMap/', {
  width: 128, // Bredd på QR-koden
  color: {
    dark: '#000000', // Färg på QR-koden
    light: '#ffffff', // Bakgrundsfär
  },
})
  .then(() => {
    console.log('QR-kod genererad!');
  })
  .catch((err) => {
    console.error('Fel vid generering av QR-kod:', err);
  });
