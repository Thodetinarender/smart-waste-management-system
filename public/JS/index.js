let map, marker;

function isLoggedIn() {
  return document.cookie.split(';').some(c => c.trim().startsWith('loggedIn=true'));
}

function updateUIForLogin() {
  const loginNav = document.getElementById('loginNav');
  if (isLoggedIn()) {
    if (loginNav) loginNav.style.display = 'none';
  } else {
    if (loginNav) loginNav.style.display = '';
  }
}

function showReportForm() {
  document.getElementById("home").style.display = "none";
  document.getElementById("report").style.display = "block";
  window.scrollTo(0, 0);

  const loginPrompt = document.getElementById('loginPrompt');
  const reportForm = document.getElementById('reportForm');

  if (!isLoggedIn()) {
    loginPrompt.style.display = '';
    Array.from(reportForm.elements).forEach(el => el.disabled = true);
  } else {
    loginPrompt.style.display = 'none';
    Array.from(reportForm.elements).forEach(el => el.disabled = false);
  }

  // 🔁 Recalculate map size after showing it
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 200);
}

function goBackToHome() {
  document.getElementById("report").style.display = "none";
  document.getElementById("home").style.display = "block";
  window.scrollTo(0, 0);
}

updateUIForLogin();

function initMap() {
  const defaultLat = 17.385044; // Hyderabad
  const defaultLng = 78.486671;

  // Initialize map
  map = L.map('map').setView([defaultLat, defaultLng], 13);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  // Add draggable marker
  marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

  // Handle map click to move marker and get address
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    marker.setLatLng([lat, lng]);
    document.getElementById("latitude").value = lat.toFixed(6);
    document.getElementById("longitude").value = lng.toFixed(6);

    fetchAddressFromCoordinates(lat, lng);
  });


  function fetchAddressFromCoordinates(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  fetch(url, {
    headers: {
      'User-Agent': 'Leaflet-Demo-App' // Required by Nominatim
    }
  })
    .then(response => response.json())
    .then(data => {
      const addressDisplay = document.getElementById("addressDisplay");
      if (data && data.display_name) {
        addressDisplay.innerText = `📍 Address: ${data.display_name}`;
      } else {
        addressDisplay.innerText = `📍 Address: Not found`;
      }
    })
    .catch(err => {
      console.error("Error fetching address:", err);
      document.getElementById("addressDisplay").innerText = "📍 Address: Error fetching";
    });
  }


  // Set initial lat/lng
  document.getElementById("latitude").value = defaultLat;
  document.getElementById("longitude").value = defaultLng;

  // Update lat/lng on drag
  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    document.getElementById("latitude").value = pos.lat.toFixed(6);
    document.getElementById("longitude").value = pos.lng.toFixed(6);
    fetchAddressFromCoordinates(pos.lat, pos.lng);
  });

  // Use user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 15);
      marker.setLatLng([latitude, longitude]);
      document.getElementById("latitude").value = latitude.toFixed(6);
      document.getElementById("longitude").value = longitude.toFixed(6);
    });
  }
}

// Run map init after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initMap();
});

// Handle report submission
document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = document.getElementById("reportForm");
  const formData = new FormData(form);

  // Add address from addressDisplay if needed
  const address = document.getElementById("addressDisplay").innerText.replace('📍 Address: ', '');
  formData.append('address', address);

  const res = await fetch('/report', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (res.ok) {
    alert("Report submitted successfully!");
    form.reset();
  } else {
    alert(await res.text());
  }
});

// Add report to UI list
function addReportToUI(report) {
  const container = document.getElementById("reportsContainer");
  const card = document.createElement("div");
  card.classList.add("report-card");

  card.innerHTML = `
    <h4>Status: <span style="color: red;">${report.status}</span></h4>
    <p><strong>Type:</strong> ${report.issueType}</p>
    <p>${report.description}</p>
    <small>📍 Location: (${report.lat}, ${report.lng})</small><br>
    <small>🕒 ${report.timestamp}</small>
  `;

  container.appendChild(card);
}
