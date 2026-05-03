/* ═══════════════════════════════════════════════════════════════
   Reports Page - Analytics & Export
   ═══════════════════════════════════════════════════════════════ */

let reportsState = {
    reportType: 'revenue',
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
};

async function renderReports() {
    const content = document.getElementById('contentArea');

    content.innerHTML = `
        <div class="page-enter">
            <!-- Report Type Selector -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-chart-line" style="color: var(--primary);"></i> របាយការណ៍ និង វិភាគ</h3>
                </div>
                <div class="card-body">
                    <div class="tab-nav" style="margin-bottom: 20px;">
                        <button class="tab-btn ${reportsState.reportType === 'revenue' ? 'active' : ''}" 
                                onclick="switchReport('revenue', this)">
                            <i class="fas fa-dollar-sign"></i> ចំណូល
                        </button>
                        <button class="tab-btn ${reportsState.reportType === 'occupancy' ? 'active' : ''}" 
                                onclick="switchReport('occupancy', this)">
                            <i class="fas fa-bed"></i> អត្រាកាន់កាប់
                        </button>
                        <button class="tab-btn ${reportsState.reportType === 'tenants' ? 'active' : ''}" 
                                onclick="switchReport('tenants', this)">
                            <i class="fas fa-users"></i> អ្នកជួល
                        </button>
                        <button class="tab-btn ${reportsState.reportType === 'expenses' ? 'active' : ''}" 
                                onclick="switchReport('expenses', this)">
                            <i class="fas fa-file-invoice-dollar"></i> សេវាកម្ម
                        </button>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap; margin-bottom: 16px;">
                        <div>
                            <label class="form-label">ឆ្នាំ</label>
                            <select class="form-control" id="reportYear" onchange="reportsState.year=parseInt(this.value); loadReport()">
                                ${generateYearOptions()}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">ខែ</label>
                            <select class="form-control" id="reportMonth" onchange="reportsState.month=parseInt(this.value); loadReport()">
                                ${generateMonthOptions()}
                            </select>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="loadReport()">
                            <i class="fas fa-sync"></i> ផ្ទុកឡើងវិញ
                        </button>
                        <button class="btn btn-success btn-sm" onclick="exportReport()">
                            <i class="fas fa-file-export"></i> នាំចេញ CSV
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="printReport()">
                            <i class="fas fa-print"></i> បោះពុម្ព
                        </button>
                    </div>
                </div>
            </div>

            <!-- Report Content -->
            <div id="reportContent">
                ${Components.renderSkeleton(5)}
            </div>
        </div>
    `;

    loadReport();
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let html = '';
    for (let y = currentYear; y >= currentYear - 3; y--) {
        html += `<option value="${y}" ${y === reportsState.year ? 'selected' : ''}>${y}</option>`;
    }
    return html;
}

function generateMonthOptions() {
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    let html = '<option value="0">ទាំង ១២ ខែ</option>';
    for (let m = 1; m <= 12; m++) {
        html += `<option value="${m}" ${m === reportsState.month ? 'selected' : ''}>${khmerMonths[m - 1]}</option>`;
    }
    return html;
}

function switchReport(type, btn) {
    reportsState.reportType = type;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadReport();
}

async function loadReport() {
    const container = document.getElementById('reportContent');
    container.innerHTML = Components.renderSkeleton(5);

    try {
        switch (reportsState.reportType) {
            case 'revenue': await loadRevenueReport(container); break;
            case 'occupancy': await loadOccupancyReport(container); break;
            case 'tenants': await loadTenantsReport(container); break;
            case 'expenses': await loadExpensesReport(container); break;
        }
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

async function loadRevenueReport(container) {
    const summary = await API.getPaymentSummary({ year: reportsState.year, month: reportsState.month || undefined });
    const chartData = await API.getRevenueChart(12);

    container.innerHTML = `
        <div class="grid-2" style="margin-bottom: 24px;">
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-chart-bar"></i> សង្ខេបចំណូល ${reportsState.year}</h3></div>
                <div class="card-body">
                    <div class="chart-container"><canvas id="reportRevenueChart"></canvas></div>
                </div>
            </div>
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-calculator"></i> សង្ខេបហិរញ្ញវត្ថុ</h3></div>
                <div class="card-body">
                    <div style="padding: 12px 0;">
                        <div class="report-stat-item">
                            <span class="report-stat-label">ចំណូលសរុប (USD)</span>
                            <span class="report-stat-value success">${Utils.formatUSD(summary.total_collected_usd || 0)}</span>
                        </div>
                        <div class="report-stat-item">
                            <span class="report-stat-label">ចំណូលសរុប (KHR)</span>
                            <span class="report-stat-value success">${Utils.formatKHR(summary.total_collected_khr || 0)}</span>
                        </div>
                        <div class="report-stat-item">
                            <span class="report-stat-label">រង់ចាំបង់ (USD)</span>
                            <span class="report-stat-value warning">${Utils.formatUSD(summary.total_pending_usd || 0)}</span>
                        </div>
                        <div class="report-stat-item">
                            <span class="report-stat-label">បានទូទាត់រួច</span>
                            <span class="report-stat-value">${summary.completed_count || 0} ប្រតិបត្តិការ</span>
                        </div>
                        <div class="report-stat-item">
                            <span class="report-stat-label">រង់ចាំ</span>
                            <span class="report-stat-value">${summary.pending_count || 0} ប្រតិបត្តិការ</span>
                        </div>
                        <div class="report-stat-item">
                            <span class="report-stat-label">ហួសកំណត់</span>
                            <span class="report-stat-value danger">${summary.overdue_count || 0} ប្រតិបត្តិការ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Monthly Detail Table -->
        <div class="card">
            <div class="card-header"><h3><i class="fas fa-table"></i> តារាងចំណូលប្រចាំខែ</h3></div>
            <div class="card-body">
                ${renderRevenueTable(chartData)}
            </div>
        </div>
    `;

    // Initialize chart
    const ctx = document.getElementById('reportRevenueChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'USD ($)',
                    data: chartData.revenue_usd,
                    borderColor: '#1a237e',
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    fill: true,
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } },
            },
        });
    }
}

function renderRevenueTable(chartData) {
    if (!chartData || !chartData.labels) return '<p>គ្មានទិន្នន័យ</p>';

    let totalUsd = 0, totalKhr = 0;
    const rows = chartData.labels.map((label, i) => {
        totalUsd += chartData.revenue_usd[i] || 0;
        totalKhr += chartData.revenue_khr[i] || 0;
        return `<tr>
            <td>${label}</td>
            <td style="font-weight:600; color:var(--primary);">${Utils.formatUSD(chartData.revenue_usd[i])}</td>
            <td style="font-weight:600; color:var(--secondary);">${Utils.formatKHR(chartData.revenue_khr[i])}</td>
        </tr>`;
    }).join('');

    return `<div class="table-container">
        <table class="data-table">
            <thead><tr><th>ខែ</th><th>ចំណូល USD</th><th>ចំណូល KHR</th></tr></thead>
            <tbody>${rows}
                <tr style="font-weight:700; background:var(--gray-50);">
                    <td>សរុប</td>
                    <td style="color:var(--primary);">${Utils.formatUSD(totalUsd)}</td>
                    <td style="color:var(--secondary);">${Utils.formatKHR(totalKhr)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
}

async function loadOccupancyReport(container) {
    const [stats, occupancy] = await Promise.all([
        API.getRoomStats(),
        API.getOccupancy(),
    ]);

    const total = (stats.total || 0);
    const occupied = (stats.occupied || 0);
    const available = (stats.available || 0);
    const maintenance = (stats.maintenance || 0);
    const rate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div class="stats-grid stagger-animate" style="margin-bottom: 24px;">
            ${Components.renderStatCard('fa-building', total, 'បន្ទប់សរុប', 'primary')}
            ${Components.renderStatCard('fa-user-check', occupied, 'មានអ្នកជួល', 'success')}
            ${Components.renderStatCard('fa-door-open', available, 'ទំនេរ', 'warning')}
            ${Components.renderStatCard('fa-chart-pie', rate + '%', 'អត្រាកាន់កាប់', 'info')}
        </div>
        <div class="grid-2">
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-chart-pie"></i> ការបែងចែកបន្ទប់</h3></div>
                <div class="card-body">
                    <div class="chart-container"><canvas id="occupancyPieChart"></canvas></div>
                </div>
            </div>
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-building"></i> តាមជាន់</h3></div>
                <div class="card-body">
                    ${renderOccupancyByFloor(occupancy.floors)}
                </div>
            </div>
        </div>
    `;

    // Pie chart
    const ctx = document.getElementById('occupancyPieChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['មានអ្នកជួល', 'ទំនេរ', 'ជួសជុល'],
                datasets: [{
                    data: [occupied, available, maintenance],
                    backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: "'Noto Sans Khmer'" } } },
                },
            },
        });
    }
}

function renderOccupancyByFloor(floors) {
    if (!floors || floors.length === 0) return '<p class="empty-state">គ្មានទិន្នន័យ</p>';
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr><th>ជាន់</th><th>សរុប</th><th>មានអ្នកជួល</th><th>ទំនេរ</th><th>អត្រា</th></tr></thead>
            <tbody>
                ${floors.map(f => {
                    const rate = f.total > 0 ? ((f.occupied / f.total) * 100).toFixed(0) : 0;
                    return `<tr>
                        <td>ជាន់ ${f.floor}</td>
                        <td>${f.total}</td>
                        <td>${f.occupied}</td>
                        <td>${f.total - f.occupied}</td>
                        <td>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div class="progress-bar" style="width:100px; height:8px;">
                                    <div class="progress-fill ${rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'danger'}" style="width:${rate}%"></div>
                                </div>
                                <span>${rate}%</span>
                            </div>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

async function loadTenantsReport(container) {
    const result = await API.getTenants({ per_page: 100, status_filter: 'active' });
    const tenants = result.data || [];

    // Group by nationality
    const byNationality = {};
    const byGender = { 'ប្រុស': 0, 'ស្រី': 0, 'មិនបញ្ជាក់': 0 };
    const byOccupation = {};

    tenants.forEach(t => {
        const nat = t.nationality || 'មិនបញ្ជាក់';
        byNationality[nat] = (byNationality[nat] || 0) + 1;
        const gen = t.gender || 'មិនបញ្ជាក់';
        byGender[gen] = (byGender[gen] || 0) + 1;
        const occ = t.occupation || 'មិនបញ្ជាក់';
        byOccupation[occ] = (byOccupation[occ] || 0) + 1;
    });

    container.innerHTML = `
        <div class="stats-grid stagger-animate" style="margin-bottom: 24px;">
            ${Components.renderStatCard('fa-users', tenants.length, 'អ្នកជួលសកម្ម', 'primary')}
            ${Components.renderStatCard('fa-male', byGender['ប្រុស'] || 0, 'ប្រុស', 'info')}
            ${Components.renderStatCard('fa-female', byGender['ស្រី'] || 0, 'ស្រី', 'accent')}
            ${Components.renderStatCard('fa-globe', Object.keys(byNationality).length, 'សញ្ជាតិ', 'success')}
        </div>
        <div class="grid-2">
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-briefcase"></i> តាមមុខរបរ</h3></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>មុខរបរ</th><th>ចំនួន</th></tr></thead>
                            <tbody>
                                ${Object.entries(byOccupation).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
                                    <tr><td>${k}</td><td><strong>${v}</strong></td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="card hover-lift">
                <div class="card-header"><h3><i class="fas fa-globe-asia"></i> តាមសញ្ជាតិ</h3></div>
                <div class="card-body">
                    <div class="chart-container"><canvas id="nationalityChart"></canvas></div>
                </div>
            </div>
        </div>
    `;

    const ctx = document.getElementById('nationalityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(byNationality),
                datasets: [{
                    data: Object.values(byNationality),
                    backgroundColor: ['#1a237e', '#c62828', '#ff9800', '#4caf50', '#9c27b0'],
                }],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
        });
    }
}

async function loadExpensesReport(container) {
    const result = await API.getUtilities({ per_page: 100, year: reportsState.year });
    const utilities = result.data || [];

    let totalElectricity = 0, totalWater = 0, totalInternet = 0, totalGarbage = 0, totalAll = 0;
    utilities.forEach(u => {
        totalElectricity += u.electricity_amount || 0;
        totalWater += u.water_amount || 0;
        totalInternet += u.internet_amount || 0;
        totalGarbage += u.garbage_amount || 0;
        totalAll += u.total_amount || 0;
    });

    container.innerHTML = `
        <div class="stats-grid stagger-animate" style="margin-bottom: 24px;">
            ${Components.renderStatCard('fa-bolt', Utils.formatKHR(totalElectricity), 'ភ្លើង', 'warning')}
            ${Components.renderStatCard('fa-tint', Utils.formatKHR(totalWater), 'ទឹក', 'info')}
            ${Components.renderStatCard('fa-wifi', Utils.formatUSD(totalInternet), 'អ៊ីនធើណិត', 'success')}
            ${Components.renderStatCard('fa-trash', Utils.formatUSD(totalGarbage), 'សំរាម', 'danger')}
        </div>
        <div class="card hover-lift">
            <div class="card-header"><h3><i class="fas fa-table"></i> វិក័យប័ត្រសេវាប្រចាំខែ ${reportsState.year}</h3></div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr>
                            <th>បន្ទប់</th><th>ខែ</th><th>ភ្លើង</th><th>ទឹក</th><th>អ៊ីនធើណិត</th><th>សំរាម</th><th>សរុប</th>
                        </tr></thead>
                        <tbody>
                            ${utilities.slice(0, 30).map(u => `<tr>
                                <td>${u.room_number || '-'}</td>
                                <td>${u.period_month}/${u.period_year}</td>
                                <td>${Utils.formatKHR(u.electricity_amount)}</td>
                                <td>${Utils.formatKHR(u.water_amount)}</td>
                                <td>${Utils.formatUSD(u.internet_amount)}</td>
                                <td>${Utils.formatUSD(u.garbage_amount)}</td>
                                <td style="font-weight:700;">${Utils.formatKHR(u.total_amount)}</td>
                            </tr>`).join('')}
                            <tr style="font-weight:700; background:var(--gray-50);">
                                <td colspan="2">សរុប</td>
                                <td>${Utils.formatKHR(totalElectricity)}</td>
                                <td>${Utils.formatKHR(totalWater)}</td>
                                <td>${Utils.formatUSD(totalInternet)}</td>
                                <td>${Utils.formatUSD(totalGarbage)}</td>
                                <td>${Utils.formatKHR(totalAll)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function exportReport() {
    // Simple CSV export based on current report
    const table = document.querySelector('#reportContent .data-table');
    if (!table) { Components.showToast('គ្មានតារាងសម្រាប់នាំចេញ', 'warning'); return; }

    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => rowData.push('"' + col.textContent.trim().replace(/"/g, '""') + '"'));
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${reportsState.reportType}_${reportsState.year}_${reportsState.month}.csv`;
    link.click();
    Components.showToast('នាំចេញ CSV បានជោគជ័យ', 'success');
}

function printReport() {
    window.print();
}
