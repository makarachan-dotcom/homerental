/* ═══════════════════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════════════════ */

let revenueChart = null;

async function renderDashboard() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(8);

    try {
        const [stats, chartData, activity, occupancy] = await Promise.all([
            API.getDashboardStats(),
            API.getRevenueChart(6),
            API.getRecentActivity(8),
            API.getOccupancy(),
        ]);

        content.innerHTML = `
            <div class="page-enter">
                <!-- Stats Cards -->
                <div class="stats-grid stagger-animate">
                    ${Components.renderStatCard('fa-door-open', stats.total_rooms, 'បន្ទប់សរុប', 'primary')}
                    ${Components.renderStatCard('fa-user-check', stats.occupied_rooms, 'មានអ្នកជួល', 'success')}
                    ${Components.renderStatCard('fa-door-closed', stats.available_rooms, 'ទំនេរ', 'warning')}
                    ${Components.renderStatCard('fa-users', stats.total_tenants, 'អ្នកជួលសរុប', 'info')}
                    ${Components.renderStatCard('fa-dollar-sign', Utils.formatUSD(stats.monthly_revenue_usd), 'ចំណូលខែនេះ (USD)', 'success')}
                    ${Components.renderStatCard('fa-money-bill', Utils.formatKHR(stats.monthly_revenue_khr), 'ចំណូលខែនេះ (KHR)', 'accent')}
                    ${Components.renderStatCard('fa-file-contract', stats.active_contracts, 'កិច្ចសន្យាសកម្ម', 'primary')}
                    ${Components.renderStatCard('fa-chart-pie', stats.occupancy_rate + '%', 'អត្រាកាន់កាប់', 'info')}
                </div>

                <!-- Charts & Activity Row -->
                <div class="grid-2" style="margin-bottom: 24px;">
                    <!-- Revenue Chart -->
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-bar"></i> ចំណូលប្រចាំខែ</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Occupancy by Floor -->
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-building"></i> អត្រាកាន់កាប់តាមជាន់</h3>
                        </div>
                        <div class="card-body">
                            ${renderOccupancyBars(occupancy.floors)}
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Expiring -->
                <div class="grid-2">
                    <!-- Recent Payments -->
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-history"></i> ការបង់ប្រាក់ថ្មីៗ</h3>
                        </div>
                        <div class="card-body" style="padding: 12px 20px;">
                            <ul class="activity-list">
                                ${renderRecentPayments(activity.recent_payments)}
                            </ul>
                        </div>
                    </div>

                    <!-- Expiring Contracts -->
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-exclamation-triangle" style="color: var(--warning)"></i> កិច្ចសន្យាជិតផុត</h3>
                        </div>
                        <div class="card-body" style="padding: 12px 20px;">
                            <ul class="activity-list">
                                ${renderExpiringContracts(activity.expiring_contracts)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize chart
        initRevenueChart(chartData);

    } catch (error) {
        content.innerHTML = `<div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</h4>
            <p>${error.message}</p>
            <button class="btn btn-primary" onclick="renderDashboard()">ព្យាយាមម្តងទៀត</button>
        </div>`;
    }
}

function renderOccupancyBars(floors) {
    if (!floors || floors.length === 0) return '<p class="empty-state">គ្មានទិន្នន័យ</p>';

    return floors.map(floor => {
        const rate = floor.total > 0 ? (floor.occupied / floor.total * 100) : 0;
        const colorClass = rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger';
        return `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 14px;">ជាន់ ${floor.floor}</span>
                    <span style="font-size: 13px; color: var(--gray-600);">
                        ${floor.occupied}/${floor.total} បន្ទប់ (${Math.round(rate)}%)
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${colorClass}" style="width: ${rate}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRecentPayments(payments) {
    if (!payments || payments.length === 0) {
        return '<li class="activity-item"><p style="color: var(--gray-500);">គ្មានការបង់ប្រាក់ថ្មី</p></li>';
    }

    return payments.slice(0, 6).map(p => `
        <li class="activity-item">
            <div class="activity-icon payment">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="activity-content">
                <h5>${p.tenant_name || 'មិនស្គាល់'} - បន្ទប់ ${p.room_number || '-'}</h5>
                <p>${Utils.formatUSD(p.amount_usd)} | ${Utils.formatDateShort(p.payment_date)}</p>
            </div>
        </li>
    `).join('');
}

function renderExpiringContracts(contracts) {
    if (!contracts || contracts.length === 0) {
        return '<li class="activity-item"><p style="color: var(--gray-500);">គ្មានកិច្ចសន្យាជិតផុត</p></li>';
    }

    return contracts.map(c => `
        <li class="activity-item">
            <div class="activity-icon warning">
                <i class="fas fa-clock"></i>
            </div>
            <div class="activity-content">
                <h5>${c.tenant_name || 'មិនស្គាល់'} - បន្ទប់ ${c.room_number || '-'}</h5>
                <p>ផុតកំណត់: ${Utils.formatDateShort(c.end_date)}</p>
            </div>
        </li>
    `).join('');
}

function initRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'USD ($)',
                    data: data.revenue_usd,
                    backgroundColor: 'rgba(26, 35, 126, 0.8)',
                    borderColor: '#1a237e',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.6,
                },
                {
                    label: 'KHR (៛) x1000',
                    data: data.revenue_khr.map(v => v / 1000),
                    backgroundColor: 'rgba(198, 40, 40, 0.7)',
                    borderColor: '#c62828',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { family: "'Noto Sans Khmer', sans-serif", size: 12 } },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                },
                x: {
                    grid: { display: false },
                },
            },
        },
    });
}
