let map, marker;
let orrPolygon; // <-- Make it global
const orrBoundary = [
  [17.648, 78.285],
  [17.710, 78.400],
  [17.715, 78.520],
  [17.670, 78.635],
  [17.580, 78.700],
  [17.470, 78.710],
  [17.360, 78.680],
  [17.280, 78.600],
  [17.230, 78.480],
  [17.250, 78.360],
  [17.340, 78.270],
  [17.460, 78.245],
  [17.580, 78.260],
  [17.648, 78.285]
];

// Point-in-polygon function (Ray casting algorithm)
function isWithinHyderabad(lat, lng) {
  let inside = false;
  for (let i = 0, j = orrBoundary.length - 1; i < orrBoundary.length; j = i++) {
    const xi = orrBoundary[i][0], yi = orrBoundary[i][1];
    const xj = orrBoundary[j][0], yj = orrBoundary[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

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
  document.getElementById("profile").style.display = "none";
  document.getElementById("latestResolvedSection").style.display = "none";
  document.getElementById("report").style.display = "block";
  document.getElementById("myreports").style.display = "none";
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
  document.getElementById("profile").style.display = "none";
  document.getElementById("myreports").style.display = "none";
  document.getElementById("latestResolvedSection").style.display = "block";
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

  // Draw ORR polygon and assign to global variable
  orrPolygon = L.polygon(orrBoundary, {
    color: "#1976d2",
    weight: 2,
    fillOpacity: 0.07,
    dashArray: "6"
  }).addTo(map);

  // Fit map to ORR bounds
  map.fitBounds(orrPolygon.getBounds());

  // Handle map click to move marker and get address
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    if (!isWithinHyderabad(lat, lng)) {
      alert("Please select a location within Hyderabad city limits.");
      map.setView([defaultLat, defaultLng], 13);
      marker.setLatLng([defaultLat, defaultLng]);
      document.getElementById("latitude").value = defaultLat;
      document.getElementById("longitude").value = defaultLng;
      fetchAddressFromCoordinates(defaultLat, defaultLng);
      return;
    }
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
    if (!isWithinHyderabad(pos.lat, pos.lng)) {
      alert("Please select a location within Hyderabad city limits.");
      marker.setLatLng([defaultLat, defaultLng]);
      map.setView([defaultLat, defaultLng], 13);
      document.getElementById("latitude").value = defaultLat;
      document.getElementById("longitude").value = defaultLng;
      fetchAddressFromCoordinates(defaultLat, defaultLng);
      return;
    }
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

  // Show section based on hash
  if (window.location.hash === "#myreports") {
    showMyReports();
  } else if (window.location.hash === "#profile") {
    showProfile();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = async function() {
      const res = await fetch('/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        alert('Logout failed');
      }
    };
  }
});

function insertProfileLinkIfLoggedIn() {
  if (isLoggedIn()) {
    const navList = document.querySelector('.navbar ul');
    if (!document.getElementById('profileLink')) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#profile" id="profileLink" onclick="showProfile()">Profile</a>`;
      navList.insertBefore(li, document.getElementById('loginNav'));
    }
  } else {
    const profileLink = document.getElementById('profileLink');
    if (profileLink) profileLink.parentElement.remove();
  }
}

// Call this after DOMContentLoaded and after login state changes
document.addEventListener("DOMContentLoaded", () => {
  insertProfileLinkIfLoggedIn();
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

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#myreports") {
    showMyReports();
  } else if (window.location.hash === "#profile") {
    showProfile();
  } else {
    goBackToHome();
  }
});

function showProfile() {
  document.getElementById("home").style.display = "none";
  document.getElementById("report").style.display = "none";
  document.getElementById("myreports").style.display = "none";
  document.getElementById("latestResolvedSection").style.display = "none";
  document.getElementById("profile").style.display = "flex";
  window.scrollTo(0, 0);

  // Show loading state
  document.getElementById('profileNameDisplay').textContent = "Loading...";
  document.getElementById('profileEmailDisplay').textContent = "";
  document.getElementById('profileMobileDisplay').textContent = "";
  document.getElementById('profileAddressDisplay').textContent = "";
  document.getElementById('profileJoinedDisplay').textContent = "";

  fetch('/me', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    })
    .then(user => {
      document.getElementById('profileNameDisplay').textContent = user.name;
      document.getElementById('profileEmailDisplay').textContent = user.email;
      document.getElementById('profileMobileDisplay').textContent = user.mobile;
      document.getElementById('profileAddressDisplay').textContent = user.address || 'N/A';
      document.getElementById('profileJoinedDisplay').textContent = new Date(user.createdAt).toLocaleString();
    })
    .catch(err => {
      document.getElementById('profileNameDisplay').textContent = "Error loading profile";
      document.getElementById('profileEmailDisplay').textContent = "";
      document.getElementById('profileMobileDisplay').textContent = "";
      document.getElementById('profileAddressDisplay').textContent = "";
      document.getElementById('profileJoinedDisplay').textContent = "";
    });
}

// Inline edit for Name
document.getElementById('editNameBtn').onclick = function() {
  document.getElementById('profileNameDisplay').style.display = 'none';
  this.style.display = 'none';
  document.getElementById('profileNameInput').style.display = '';
  document.getElementById('saveNameBtn').style.display = '';
  document.getElementById('profileNameInput').value = document.getElementById('profileNameDisplay').textContent;
  document.getElementById('profileNameInput').focus();
};
document.getElementById('saveNameBtn').onclick = async function() {
  const newName = document.getElementById('profileNameInput').value.trim();
  if (!newName) return alert('Name cannot be empty');
  const res = await fetch('/me/name', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name: newName })
  });
  if (res.ok) {
    document.getElementById('profileNameDisplay').textContent = newName;
    document.getElementById('profileNameDisplay').style.display = '';
    document.getElementById('editNameBtn').style.display = '';
    document.getElementById('profileNameInput').style.display = 'none';
    document.getElementById('saveNameBtn').style.display = 'none';
  } else {
    alert('Failed to update name');
  }
};

// Inline edit for Address
document.getElementById('editAddressBtn').onclick = function() {
  document.getElementById('profileAddressDisplay').style.display = 'none';
  this.style.display = 'none';
  document.getElementById('profileAddressInput').style.display = '';
  document.getElementById('saveAddressBtn').style.display = '';
  document.getElementById('profileAddressInput').value = document.getElementById('profileAddressDisplay').textContent;
  document.getElementById('profileAddressInput').focus();
};
document.getElementById('saveAddressBtn').onclick = async function() {
  const newAddress = document.getElementById('profileAddressInput').value.trim();
  const res = await fetch('/me/address', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ address: newAddress })
  });
  if (res.ok) {
    document.getElementById('profileAddressDisplay').textContent = newAddress;
    document.getElementById('profileAddressDisplay').style.display = '';
    document.getElementById('editAddressBtn').style.display = '';
    document.getElementById('profileAddressInput').style.display = 'none';
    document.getElementById('saveAddressBtn').style.display = 'none';
  } else {
    alert('Failed to update address');
  }
};

function renderLatestResolved() {
  fetch('/latest-resolved')
    .then(res => res.json())
    .then(reports => {
      const container = document.getElementById('latestResolvedContainer');
      if (!container) return;
      if (!reports.length) {
        container.innerHTML = "<p>No resolved reports yet.</p>";
        return;
      }
      container.innerHTML = ""; // Clear previous content

      reports.forEach(report => {
        let statusClass = 'status-resolved';
        let showImage = report.resolveImage
          ? `/uploads/${report.resolveImage}`
          : (report.image ? `/uploads/${report.image}` : null);

        // Create card element
        const card = document.createElement("div");
        card.classList.add("report-card", "myreport-card", "compact-card", "shop-card");
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.onclick = () => {
          // Use the same overlay as My Reports
          if (typeof openReportOverlay === "function") {
            openReportOverlay(report, showImage, statusClass);
          }
        };

        card.innerHTML = `
          <div class="myreport-imgbox">
            ${
              showImage && !showImage.endsWith('/undefined') && !showImage.endsWith('/null')
                ? `<img src="${showImage}" alt="Resolved Image" class="myreport-image main-img"/>`
                : `<div class="no-image-placeholder">No Image Uploaded</div>`
            }
          </div>
          <div class="myreport-header">
            <span class="myreport-type">${report.issueType}</span>
            <span class="myreport-status ${statusClass}">Resolved</span>
          </div>
          <div class="myreport-body">
            <div class="myreport-desc">${report.resolveDescription ? report.resolveDescription : report.description}</div>
          </div>
          <div class="myreport-footer">
            <span title="Location">📍 ${report.address ? report.address : ''}</span>
            <span title="Date & Time">🕒 ${new Date(report.timestamp).toLocaleString()}</span>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(() => {
      const container = document.getElementById('latestResolvedContainer');
      if (container) container.innerHTML = "<p style='color:red;'>Failed to load resolved reports.</p>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLatestResolved();
});
