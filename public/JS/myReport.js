function showMyReports() {
    document.getElementById("home").style.display = "none";
    document.getElementById("report").style.display = "none";
    document.getElementById("myreports").style.display = "block";
    window.scrollTo(0, 0);

    fetch('/myreports', {
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized or error fetching reports');
            return res.json();
        })
        .then(reports => {
            const container = document.getElementById("myReportsContainer");
            container.innerHTML = ""; // Clear previous entries

            if (reports.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>You haven't submitted any reports yet.</p>";
                return;
            }

            reports.forEach(report => {
                const card = document.createElement("div");
                card.classList.add("report-card");

                const statusClass = report.status === 'Resolved' ? 'status-resolved' : 'status-pending';

                card.innerHTML = `
                   <h4>Status: <span class="status ${statusClass}">${report.status}</span></h4>
                   <img src="/uploads/${report.image}" alt="Report Image" class="report-image"/>
                   <p><strong>Type:</strong> ${report.issueType}</p>
                   <p><strong>Description:</strong>${report.description}</p>
                   <small>📍<strong>Location:</strong>(${report.latitude}, ${report.longitude})</small><br>
                   <small>🕒 <strong>Date and Time:</strong>${report.timestamp}</small>
                   <p><strong>Address:</strong> ${report.address || 'N/A'}</p>
                `;


                container.appendChild(card);
            });
        })
        .catch(err => {
            document.getElementById("myReportsContainer").innerHTML = `<p style="color:red;">Error loading reports. Please login.</p>`;
            console.error(err);
        });
}
