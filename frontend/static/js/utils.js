/* ═══════════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════════ */

const Utils = {
    // Format currency
    formatUSD(amount) {
        if (!amount && amount !== 0) return '$0.00';
        return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatKHR(amount) {
        if (!amount && amount !== 0) return '៛0';
        return '៛' + Number(amount).toLocaleString('km-KH');
    },

    // Format date in Khmer
    formatDate(dateStr) {
        if (!dateStr) return 'គ្មាន';
        const date = new Date(dateStr);
        const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
            'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
        return `${date.getDate()} ${khmerMonths[date.getMonth()]} ${date.getFullYear()}`;
    },

    formatDateShort(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    },

    // Get current Khmer date
    getCurrentKhmerDate() {
        const now = new Date();
        const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
        const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
            'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
        return `ថ្ងៃ${khmerDays[now.getDay()]} ${now.getDate()} ${khmerMonths[now.getMonth()]} ${now.getFullYear()}`;
    },

    // Status badges
    getStatusBadge(status) {
        const statusMap = {
            'available': { text: 'ទំនេរ', class: 'badge-available' },
            'occupied': { text: 'មានអ្នកជួល', class: 'badge-occupied' },
            'maintenance': { text: 'កំពុងជួសជុល', class: 'badge-maintenance' },
            'reserved': { text: 'កក់រួច', class: 'badge-reserved' },
            'active': { text: 'សកម្ម', class: 'badge-active' },
            'expired': { text: 'ផុតកំណត់', class: 'badge-expired' },
            'terminated': { text: 'បញ្ចប់', class: 'badge-terminated' },
            'completed': { text: 'បានបង់', class: 'badge-completed' },
            'pending': { text: 'រង់ចាំ', class: 'badge-pending' },
            'overdue': { text: 'ហួសកំណត់', class: 'badge-overdue' },
        };
        const s = statusMap[status] || { text: status, class: 'badge-pending' };
        return `<span class="badge ${s.class}">${s.text}</span>`;
    },

    // Priority badges
    getPriorityBadge(priority) {
        const map = {
            'urgent': { text: 'បន្ទាន់', class: 'badge-overdue' },
            'high': { text: 'ខ្ពស់', class: 'badge-occupied' },
            'normal': { text: 'ធម្មតា', class: 'badge-active' },
            'low': { text: 'ទាប', class: 'badge-reserved' },
        };
        const p = map[priority] || { text: priority, class: 'badge-pending' };
        return `<span class="badge ${p.class}">${p.text}</span>`;
    },

    // Room type labels
    getRoomTypeLabel(type) {
        const types = {
            'standard': 'ស្តង់ដារ',
            'deluxe': 'ឌីឡុក',
            'suite': 'ស្វ៊ីត',
            'studio': 'ស្ទូឌីយ៉ូ',
        };
        return types[type] || type;
    },

    // Payment type labels
    getPaymentTypeLabel(type) {
        const types = {
            'rent': 'ថ្លៃជួល',
            'deposit': 'ប្រាក់កក់',
            'utility': 'សេវាប្រើប្រាស់',
            'late_fee': 'ពិន័យយឺត',
            'other': 'ផ្សេងៗ',
        };
        return types[type] || type;
    },

    // Payment method labels
    getPaymentMethodLabel(method) {
        const methods = {
            'cash': 'សាច់ប្រាក់',
            'bank_transfer': 'ផ្ទេរធនាគារ',
            'khqr': 'KHQR',
            'check': 'មូលប្បទានប័ត្រ',
            'other': 'ផ្សេងៗ',
        };
        return methods[method] || method;
    },

    // Animate counter
    animateCounter(element, target, duration = 1000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.floor(start + (target - start) * eased);
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    },

    // Debounce function
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate receipt/contract numbers display
    truncateText(text, maxLength = 30) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    // Sleep helper
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};
