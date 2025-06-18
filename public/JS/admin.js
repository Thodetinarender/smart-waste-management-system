if (document.cookie.split(';').every(c => !c.trim().startsWith('isAdmin=true'))) {
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/admin/reports', { credentials: 'include' });
  const reports = await response.json();

  const tableBody = document.getElementById('reportTableBody');
  const totalReports = document.getElementById('totalReports');
  const pendingReports = document.getElementById('pendingReports');
  const resolvedReports = document.getElementById('resolvedReports');

  let pending = 0, resolved = 0;

  reports.forEach((report, index) => {
    if (report.status === 'Resolved') resolved++;
    else pending++;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${report.issueType}</td>
      <td>${report.userId}</td>
      <td>${report.description}</td>
      <td><span class="status ${report.status.toLowerCase()}">${report.status}</span></td>
      <td>
        ${report.image ? `<img src="/uploads/${report.image}" alt="report image">` : 'No Image'}
      </td>
      <td>${new Date(report.timestamp).toLocaleString()}</td>
      <td class="actions">
        ${report.status !== 'Resolved' ? `<button class="resolve-btn" onclick="resolveReport(${report.id})">Resolve</button>` : ''}
        <button class="delete-btn" onclick="deleteReport(${report.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  totalReports.textContent = reports.length;
  pendingReports.textContent = pending;
  resolvedReports.textContent = resolved;
});

async function resolveReport(id) {
  if (!confirm('Mark this report as resolved?')) return;
  const res = await fetch(`/admin/reports/${id}/resolve`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  alert(data.message);
  location.reload();
}

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
