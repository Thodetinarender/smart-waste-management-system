// Check for admin access via cookie
if (document.cookie.split(';').every(c => !c.trim().startsWith('isAdmin=true'))) {
  window.location.href = '/';
}

let allReports = [];

function renderReportsTable(reports) {
  const tableBody = document.getElementById('reportTableBody');
  tableBody.innerHTML = '';
  let pending = 0, inProgress = 0, resolved = 0;

  reports.forEach((report, index) => {
    let actionButtons = '';
    if (report.status === 'Pending') {
      pending++;
      actionButtons += `<button class="inprogress-btn" onclick="markInProgress(${report.id})">Mark In Progress</button>`;
    } else if (report.status === 'In Progress') {
      inProgress++;
      actionButtons += `<button class="resolve-btn" onclick="resolveReport(${report.id})">Resolve</button>`;
    } else if (report.status === 'Resolved') {
      resolved++;
    }
    actionButtons += `<button class="delete-btn" onclick="deleteReport(${report.id})">Delete</button>`;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${report.User ? report.User.name : 'N/A'}</td>
      <td>${report.issueType}</td>
      <td>${report.description}</td>
      <td><span class="status ${report.status.toLowerCase().replace(/\s/g, '-')}">${report.status}</span></td>
      <td>
        ${report.image ? `<img src="/uploads/${report.image}" alt="report image">` : 'No Image'}
      </td>
      <td>${new Date(report.timestamp).toLocaleString()}</td>
      <td class="actions">${actionButtons}</td>
    `;
    tableBody.appendChild(row);
  });

  // Update stats
  document.getElementById('totalReports').textContent = allReports.length;
  document.getElementById('pendingReports').textContent = allReports.filter(r => r.status === 'Pending').length;
  document.getElementById('inProgressReports').textContent = allReports.filter(r => r.status === 'In Progress').length;
  document.getElementById('resolvedReports').textContent = allReports.filter(r => r.status === 'Resolved').length;
}

function filterAndRenderReports() {
  const statusValue = document.getElementById('statusFilter').value;
  const dateValue = document.getElementById('dateFilter').value;
  let filtered = allReports;

  // Filter by status
  if (statusValue !== 'all') {
    filtered = filtered.filter(r => r.status === statusValue);
  }

  // Filter by date (YYYY-MM-DD)
  if (dateValue) {
    filtered = filtered.filter(r => {
      const reportDate = new Date(r.timestamp);
      // Format to YYYY-MM-DD for comparison
      const reportDateStr = reportDate.toISOString().slice(0, 10);
      return reportDateStr === dateValue;
    });
  }

  renderReportsTable(filtered);
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/admin/reports', { credentials: 'include' });
  allReports = await response.json();

  // Sort by latest to oldest
  allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  renderReportsTable(allReports);

  // Render Chart
  const ctx = document.getElementById('reportChart').getContext('2d');

// Create gradient fills
const gradientPending = ctx.createLinearGradient(0, 0, 0, 200);
gradientPending.addColorStop(0, '#f0ad4e');
gradientPending.addColorStop(1, '#ffca28');

const gradientInProgress = ctx.createLinearGradient(0, 0, 0, 200);
gradientInProgress.addColorStop(0, '#42a5f5');
gradientInProgress.addColorStop(1, '#1e88e5');

const gradientResolved = ctx.createLinearGradient(0, 0, 0, 200);
gradientResolved.addColorStop(0, '#26c6da');
gradientResolved.addColorStop(1, '#00acc1');

new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [{
      label: 'Report Status',
      data: [allReports.filter(r => r.status === 'Pending').length, allReports.filter(r => r.status === 'In Progress').length, allReports.filter(r => r.status === 'Resolved').length],
      backgroundColor: [gradientPending, gradientInProgress, gradientResolved],
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});


  // Show Dashboard section by default
  document.getElementById('dashboardSection').style.display = 'none';
  document.getElementById('reportsSection').style.display = 'block';

  // Filter logic
  document.getElementById('statusFilter').addEventListener('change', filterAndRenderReports);
  document.getElementById('dateFilter').addEventListener('change', filterAndRenderReports);
});

// ==== Toggle Sections ====
const dashboardLink = document.getElementById('dashboardLink');
const dashboardSection = document.getElementById('dashboardSection');
const reportsSection = document.getElementById('reportsSection');
const chartSection = document.getElementById('chartSection');

// Show Dashboard section
dashboardLink.addEventListener('click', (e) => {
  e.preventDefault();
  dashboardSection.style.display = 'block';
  usersSection.style.display = 'none';
  reportsSection.style.display = 'none';


});

// Show Reports section when "All Reports" is clicked
const reportsLink = document.querySelector('.sidebar ul li:nth-child(2) a'); // 2nd link = "All Reports"
reportsLink.addEventListener('click', (e) => {
  e.preventDefault();
  dashboardSection.style.display = 'none';
  reportsSection.style.display = 'block';
  usersSection.style.display = 'none';

});


// Section references
const usersLink = document.querySelector('.sidebar ul li:nth-child(3) a'); // "Users" link
const usersSection = document.getElementById('usersSection');

// Toggle Users section
usersLink.addEventListener('click', async (e) => {
  e.preventDefault();

  dashboardSection.style.display = 'none';
  reportsSection.style.display = 'none';
  usersSection.style.display = 'block';

  // Fetch and render users only once or on every click
  try {
    const res = await fetch('/admin/users', { credentials: 'include' });
    const users = await res.json();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = ''; // Clear existing content

    users.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.name || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load users:', err);
    alert('Failed to load user data.');
  }
});


//  ==== Actions ====
function markInProgress(id) {
  document.getElementById('progressReportId').value = id;
  document.getElementById('inProgressModal').style.display = 'block';
}

function resolveReport(id) {
  document.getElementById('resolveReportId').value = id;
  document.getElementById('resolveModal').style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}


document.getElementById('inProgressForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('progressReportId').value;
  const description = document.getElementById('progressDescription').value;
  const image = document.getElementById('progressImage').files[0];

  const formData = new FormData();
  formData.append('description', description);
  if (image) formData.append('image', image);

  const res = await fetch(`/admin/reports/${id}/inprogress`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  alert(data.message);
  location.reload();
});

document.getElementById('resolveForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('resolveReportId').value;
  const description = document.getElementById('resolveDescription').value;
  const image = document.getElementById('resolveImage').files[0];

  const formData = new FormData();
  formData.append('description', description);
  if (image) formData.append('image', image);

  const res = await fetch(`/admin/reports/${id}/resolve`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  alert(data.message);
  location.reload();
});


async function deleteReport(id) {
  if (!confirm('Are you sure you want to delete this report?')) return;
  const res = await fetch(`/admin/reports/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  alert(data.message);
  location.reload();
}

window.markInProgress = markInProgress;
window.resolveReport = resolveReport;
window.closeModal = closeModal;
