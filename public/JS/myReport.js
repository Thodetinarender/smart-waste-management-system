function showMyReports() {
    document.getElementById("home").style.display = "none";
    document.getElementById("report").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("latestResolvedSection").style.display = "none";
    document.getElementById("myreports").style.display = "block";
    window.scrollTo(0, 0);

    fetch('/myreports', { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error('Unauthorized or error fetching reports');
            return res.json();
        })
        .then(reports => {
            const container = document.getElementById("myReportsContainer");
            container.innerHTML = "";

            if (reports.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>You haven't submitted any reports yet.</p>";
                return;
            }

            reports.forEach((report, idx) => {
                let statusClass = '';
                let showImage = '';
                if (report.status === 'Resolved') {
                    statusClass = 'status-resolved';
                    showImage = report.resolveImage ? `/uploads/${report.resolveImage}` : `/uploads/${report.image}`;
                } else if (report.status === 'In Progress') {
                    statusClass = 'status-inprogress';
                    showImage = report.inProgressImage ? `/uploads/${report.inProgressImage}` : `/uploads/${report.image}`;
                } else {
                    statusClass = 'status-pending';
                    showImage = `/uploads/${report.image}`;
                }

                const card = document.createElement("div");
                card.classList.add("report-card", "myreport-card", "compact-card", "shop-card");
                card.tabIndex = 0;
                card.setAttribute("role", "button");
                card.onclick = () => openReportOverlay(report, showImage, statusClass);

                card.innerHTML = `
                  <div class="myreport-imgbox">
                    ${
                      showImage && !showImage.endsWith('/undefined') && !showImage.endsWith('/null')
                        ? `<img src="${showImage}" alt="Report Image" class="myreport-image main-img"/>`
                        : `<div class="no-image-placeholder">No Image Uploaded</div>`
                    }
                  </div>
                  <div class="myreport-header">
                    <span class="myreport-type">${report.issueType}</span>
                    <span class="myreport-status ${statusClass}">${report.status}</span>
                  </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            document.getElementById("myReportsContainer").innerHTML = `<p style="color:red;">Error loading reports. Please login.</p>`;
            console.error(err);
        });
}

// Overlay logic
function openReportOverlay(report, showImage, statusClass) {
    let overlay = document.getElementById("reportOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "reportOverlay";
        overlay.className = "report-overlay";
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="overlay-content">
        <div class="overlay-imgbox">
          <span class="back-arrow" onclick="closeReportOverlay()" title="Back"></span>
          <div class="overlay-images">
            <div>
               <div class="overlay-info">
                 <h2>${report.issueType}</h2>
               </div>
              <div class="img-label">User Issue</div>
              <p class="myreport-desc">${report.description}</p>
              ${
                report.image
                  ? `<img src="/uploads/${report.image}" alt="User Uploaded" class="overlay-main-img"/>`
                  : `<div class="no-image-placeholder" style="margin-bottom:18px;">Image Not Uploaded</div>`
              }
            </div>
            ${report.inProgressImage ? `
            <div>
              <div class="img-label">In Progress</div>
              ${report.inProgressDescription ? `<div class="myreport-progress"><span>🛠️ In Progress:</span> ${report.inProgressDescription}</div>` : ''}
              <img src="/uploads/${report.inProgressImage}" alt="In Progress" class="overlay-main-img"/>
            </div>
            ` : report.inProgressDescription ? `
            <div>
              <div class="img-label">In Progress</div>
              <div class="myreport-progress"><span>🛠️ In Progress:</span> ${report.inProgressDescription}</div>
              <div class="no-image-placeholder" style="margin-bottom:18px;">Image Not Uploaded</div>
            </div>
            ` : ''}
            ${report.resolveImage ? `
            <div>
              <div class="img-label">Resolved</div>
              ${report.resolveDescription ? `<div class="myreport-resolved"><span>✅ Resolution:</span> ${report.resolveDescription}</div>` : ''}
              <img src="/uploads/${report.resolveImage}" alt="Resolved" class="overlay-main-img"/>
            </div>
            ` : report.resolveDescription ? `
            <div>
              <div class="img-label">Resolved</div>
              <div class="myreport-resolved"><span>✅ Resolution:</span> ${report.resolveDescription}</div>
              <div class="no-image-placeholder" style="margin-bottom:18px;">Image Not Uploaded</div>
            </div>
            ` : ''}
          </div>
        </div>
        <div class="overlay-info">
          <span class="myreport-status ${statusClass}">${report.status}</span>
          <div class="myreport-footer">
            <span title="Location">📍 ${report.address || `(${report.latitude}, ${report.longitude})`}</span>
            <span title="Date & Time">🕒 ${new Date(report.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
}

window.closeReportOverlay = function() {
    const overlay = document.getElementById("reportOverlay");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
}
