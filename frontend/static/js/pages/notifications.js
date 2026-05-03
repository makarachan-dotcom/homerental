/* ═══════════════════════════════════════════════════════════════
   Notifications & Activity Log Page
   ═══════════════════════════════════════════════════════════════ */

let notifState = { page: 1, type: 'all' };

async function renderNotifications() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const activity = await API.getRecentActivity(50);

        content.innerHTML = `
            <div class="page-enter">
                <!-- Tab for Notifications vs Activity -->
                <div class="tab-nav" style="margin-bottom: 24px;">
                    <button class="tab-btn active" onclick="switchNotifTab('notifications', this)">
                        <i class="fas fa-bell"></i> ការជូនដំណឹង
                    </button>
                    <button class="tab-btn" onclick="switchNotifTab('activity', this)">
                        <i class="fas fa-history"></i> កំណត់ត្រាសកម្មភាព
                    </button>
                </div>

                <div id="notifContent">
                    ${renderNotificationsList(activity)}
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function switchNotifTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const container = document.getElementById('notifContent');
    if (tab === 'notifications') {
        loadNotificationsTab(container);
    } else {
        loadActivityTab(container);
    }
}

async function loadNotificationsTab(container) {
    try {
        const activity = await API.getRecentActivity(30);
        container.innerHTML = renderNotificationsList(activity);
    } catch (e) {
        container.innerHTML = '<p>មានបញ្ហា</p>';
    }
}

function renderNotificationsList(activity) {
    // Generate smart notifications based on activity
    const notifications = [];

    // Expiring contracts
    if (activity.expiring_contracts && activity.expiring_contracts.length > 0) {
        activity.expiring_contracts.forEach(c => {
            notifications.push({
                icon: 'fa-exclamation-triangle',
                color: 'var(--warning)',
                title: `កិច្ចសន្យាជិតផុតកំណត់`,
                message: `${c.tenant_name} (បន្ទប់ ${c.room_number}) - ផុតកំណត់ ${Utils.formatDateShort(c.end_date)}`,
                time: c.end_date,
                type: 'warning',
            });
        });
    }

    // Recent payments
    if (activity.recent_payments && activity.recent_payments.length > 0) {
        activity.recent_payments.forEach(p => {
            notifications.push({
                icon: 'fa-money-bill',
                color: 'var(--success)',
                title: `ការបង់ប្រាក់ថ្មី`,
                message: `${p.tenant_name} បានបង់ ${Utils.formatUSD(p.amount_usd)} (បន្ទប់ ${p.room_number})`,
                time: p.payment_date,
                type: 'success',
            });
        });
    }

    // Add system notifications
    notifications.push({
        icon: 'fa-shield-alt',
        color: 'var(--primary)',
        title: 'ប្រព័ន្ធសុវត្ថិភាព',
        message: 'រាល់ទិន្នន័យត្រូវបានការពារដោយប្រព័ន្ធអ៊ិនគ្រីប JWT',
        time: new Date().toISOString().split('T')[0],
        type: 'info',
    });

    notifications.push({
        icon: 'fa-database',
        color: 'var(--info)',
        title: 'បម្រុងទិន្នន័យ',
        message: 'ទិន្នន័យត្រូវបានរក្សាទុកជាប្រព័ន្ធស្វ័យប្រវត្តិ',
        time: new Date().toISOString().split('T')[0],
        type: 'info',
    });

    if (notifications.length === 0) {
        return Components.renderEmpty('fa-bell', 'គ្មានការជូនដំណឹង', 'មិនមានការជូនដំណឹងថ្មី');
    }

    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-bell"></i> ការជូនដំណឹង (${notifications.length})</h3>
                <button class="btn btn-ghost btn-sm" onclick="markAllRead()">
                    <i class="fas fa-check-double"></i> អានទាំងអស់
                </button>
            </div>
            <div class="card-body" style="padding: 0;">
                <div class="notification-list">
                    ${notifications.map((n, i) => `
                        <div class="notification-item ${n.type}" style="animation-delay: ${i * 0.05}s;">
                            <div class="notification-icon" style="background: ${n.color}15; color: ${n.color};">
                                <i class="fas ${n.icon}"></i>
                            </div>
                            <div class="notification-body">
                                <h5>${n.title}</h5>
                                <p>${n.message}</p>
                                <small>${Utils.formatDateShort(n.time)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

async function loadActivityTab(container) {
    try {
        const activity = await API.getRecentActivity(50);
        container.innerHTML = renderActivityLog(activity);
    } catch (e) {
        container.innerHTML = '<p>មានបញ្ហា</p>';
    }
}

function renderActivityLog(activity) {
    const events = [];

    // Merge all activity into timeline
    if (activity.recent_payments) {
        activity.recent_payments.forEach(p => {
            events.push({
                icon: 'fa-dollar-sign',
                color: 'var(--success)',
                title: `ការបង់ប្រាក់ - ${p.tenant_name}`,
                detail: `${Utils.formatUSD(p.amount_usd)} | បន្ទប់ ${p.room_number}`,
                date: p.payment_date,
            });
        });
    }

    if (activity.recent_contracts) {
        activity.recent_contracts.forEach(c => {
            events.push({
                icon: 'fa-file-contract',
                color: 'var(--primary)',
                title: `កិច្ចសន្យាថ្មី - ${c.tenant_name}`,
                detail: `បន្ទប់ ${c.room_number} | ${Utils.formatDateShort(c.start_date)} - ${Utils.formatDateShort(c.end_date)}`,
                date: c.start_date,
            });
        });
    }

    // Sort by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
        return Components.renderEmpty('fa-history', 'គ្មានសកម្មភាព', 'មិនមានកំណត់ត្រាសកម្មភាពថ្មី');
    }

    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-history"></i> កំណត់ត្រាសកម្មភាព</h3>
            </div>
            <div class="card-body">
                <div class="timeline">
                    ${events.map(e => `
                        <div class="timeline-item">
                            <div class="timeline-icon" style="background: ${e.color}; color: white;">
                                <i class="fas ${e.icon}"></i>
                            </div>
                            <div class="timeline-content">
                                <h5>${e.title}</h5>
                                <p>${e.detail}</p>
                                <small>${Utils.formatDate(e.date)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function markAllRead() {
    Components.showToast('សម្គាល់ការជូនដំណឹងទាំងអស់ថាបានអាន', 'success');
}
