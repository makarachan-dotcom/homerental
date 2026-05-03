/* ═══════════════════════════════════════════════════════════════
   Main Application Controller
   ═══════════════════════════════════════════════════════════════ */

let currentPage = 'dashboard';

// Page configuration
const PAGE_CONFIG = {
    dashboard: { title: 'ផ្ទាំងគ្រប់គ្រង', subtitle: 'ទិដ្ឋភាពទូទៅនៃអាជីវកម្មរបស់អ្នក', render: renderDashboard },
    rooms: { title: 'គ្រប់គ្រងបន្ទប់', subtitle: 'មើល និងគ្រប់គ្រងបន្ទប់ទាំងអស់', render: renderRooms },
    tenants: { title: 'គ្រប់គ្រងអ្នកជួល', subtitle: 'ព័ត៌មានអ្នកជួល និងកិច្ចសន្យា', render: renderTenants },
    contracts: { title: 'កិច្ចសន្យា', subtitle: 'គ្រប់គ្រងកិច្ចសន្យាជួលទាំងអស់', render: renderContracts },
    payments: { title: 'ការបង់ប្រាក់', subtitle: 'កត់ត្រា និងតាមដានការបង់ប្រាក់', render: renderPayments },
    utilities: { title: 'វិក័យប័ត្រសេវា', subtitle: 'ភ្លើង ទឹក អ៊ីនធើណិត', render: renderUtilities },
    maintenance: { title: 'ថែទាំ/ជួសជុល', subtitle: 'សំណើថែទាំ និងជួសជុល', render: renderMaintenance },
    qrcodes: { title: 'QR កូដ', subtitle: 'បង្កើត និងគ្រប់គ្រង QR កូដ', render: renderQRCodes },
    settings: { title: 'ការកំណត់', subtitle: 'កំណត់ប្រព័ន្ធ និងអ្នកប្រើប្រាស់', render: renderSettings },
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('sokly_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load user info
    const user = JSON.parse(localStorage.getItem('sokly_user') || '{}');
    document.getElementById('userName').textContent = user.full_name || 'Admin';
    document.getElementById('userRole').textContent = user.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'បុគ្គលិក';

    // Set current date
    document.getElementById('currentDate').textContent = Utils.getCurrentKhmerDate();

    // Show app
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hide');
        document.getElementById('app').style.display = 'flex';

        // Navigate to dashboard
        navigateTo('dashboard');

        // Load notification counts
        loadBadges();
    }, 1500);
});

// Navigation
function navigateTo(page) {
    if (!PAGE_CONFIG[page]) return;

    currentPage = page;
    const config = PAGE_CONFIG[page];

    // Update page title
    document.getElementById('pageTitle').textContent = config.title;
    document.getElementById('pageSubtitle').textContent = config.subtitle;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Render page content
    config.render();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');

    // Update URL hash
    window.location.hash = page;
}

// Load badge counts
async function loadBadges() {
    try {
        const stats = await API.getDashboardStats();
        const roomBadge = document.getElementById('roomBadge');
        const paymentBadge = document.getElementById('paymentBadge');
        const maintenanceBadge = document.getElementById('maintenanceBadge');

        if (stats.available_rooms > 0) {
            roomBadge.textContent = stats.available_rooms;
        }
        if (stats.pending_payments > 0) {
            paymentBadge.textContent = stats.pending_payments;
        }
        if (stats.pending_maintenance > 0) {
            maintenanceBadge.textContent = stats.pending_maintenance;
        }
    } catch (e) {}
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// Notification toggle
function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('show');
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-notifications')) {
        document.getElementById('notifDropdown').classList.remove('show');
    }
});

// Global search handler
function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            // Navigate to tenants with search
            tenantsState.search = query;
            tenantsState.page = 1;
            navigateTo('tenants');
        }
    }
}

// Logout
function logout() {
    localStorage.removeItem('sokly_token');
    localStorage.removeItem('sokly_user');
    window.location.href = '/login';
}

// Handle hash navigation
window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '');
    if (page && PAGE_CONFIG[page] && page !== currentPage) {
        navigateTo(page);
    }
});

// Handle initial hash
if (window.location.hash) {
    const page = window.location.hash.replace('#', '');
    if (PAGE_CONFIG[page]) {
        setTimeout(() => navigateTo(page), 1600);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+K for search
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
    }
});
