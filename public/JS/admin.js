// Check for admin access via cookie
if (document.cookie.split(';').every(c => !c.trim().startsWith('isAdmin=true'))) {
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/admin/reports', { credentials: 'include' });
  const reports = await response.json();

  const tableBody = document.getElementById('reportTableBody');
  const totalReports = document.getElementById('totalReports');
  const pendingReports = document.getElementById('pendingReports');
  const inProgressReports = document.getElementById('inProgressReports');
  const resolvedReports = document.getElementById('resolvedReports');

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
    <td>${report.issueType}</td>
    <td>${report.userId}</td>
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


  // Set report counts
  totalReports.textContent = reports.length;
  pendingReports.textContent = pending;
  inProgressReports.textContent = inProgress;
  resolvedReports.textContent = resolved;

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
      data: [pending, inProgress, resolved],
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



// async function markInProgress(id) {
//   if (!confirm('Mark this report as In Progress?')) return;
//   const res = await fetch(`/admin/reports/${id}/inprogress`, {
//     method: 'PUT',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' }
//   });
//   const data = await res.json();
//   alert(data.message);
//   location.reload();
// }

// async function resolveReport(id) {
//   if (!confirm('Mark this report as resolved?')) return;
//   const res = await fetch(`/admin/reports/${id}/resolve`, {
//     method: 'PUT',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' }
//   });
//   const data = await res.json();
//   alert(data.message);
//   location.reload();
// }

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
