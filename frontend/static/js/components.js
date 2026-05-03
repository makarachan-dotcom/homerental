/* ═══════════════════════════════════════════════════════════════
   Reusable UI Components
   ═══════════════════════════════════════════════════════════════ */

const Components = {
    // Toast notification
    showToast(message, type = 'success', duration = 4000) {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Show modal
    showModal(title, body, footer = '', options = {}) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');
        const footerEl = document.getElementById('modalFooter');

        titleEl.textContent = title;
        bodyEl.innerHTML = body;
        footerEl.innerHTML = footer;

        if (options.large) {
            container.classList.add('large');
        } else {
            container.classList.remove('large');
        }

        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        const body = `<p style="font-size:15px; text-align:center; padding:20px 0;">${message}</p>`;
        const footer = `
            <button class="btn btn-outline" onclick="closeModal(); ${onCancel ? onCancel + '()' : ''}">
                បោះបង់
            </button>
            <button class="btn btn-danger" onclick="closeModal(); (${onConfirm})()">
                បាទ/ចាស លុប
            </button>
        `;
        this.showModal('ការបញ្ជាក់', body, footer);
    },

    // Pagination component
    renderPagination(total, page, perPage, onPageChange) {
        const totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        html += `<button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChange}(${page - 1})">
            <i class="fas fa-chevron-left"></i></button>`;

        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);

        if (startPage > 1) {
            html += `<button onclick="${onPageChange}(1)">1</button>`;
            if (startPage > 2) html += '<button disabled>...</button>';
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === page ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += '<button disabled>...</button>';
            html += `<button onclick="${onPageChange}(${totalPages})">${totalPages}</button>`;
        }

        html += `<button ${page >= totalPages ? 'disabled' : ''} onclick="${onPageChange}(${page + 1})">
            <i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';
        return html;
    },

    // Loading skeleton
    renderSkeleton(rows = 5) {
        let html = '<div style="padding: 20px;">';
        for (let i = 0; i < rows; i++) {
            html += `<div class="shimmer shimmer-line ${i % 3 === 0 ? 'short' : i % 2 === 0 ? 'medium' : 'full'}"></div>`;
        }
        html += '</div>';
        return html;
    },

    // Empty state
    renderEmpty(icon, title, description, actionBtn = '') {
        return `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <h4>${title}</h4>
                <p>${description}</p>
                ${actionBtn}
            </div>
        `;
    },

    // Stat card
    renderStatCard(icon, value, label, colorClass = 'primary', trend = '') {
        return `
            <div class="stat-card ${colorClass} hover-lift">
                <div class="stat-icon"><i class="fas ${icon}"></i></div>
                <div class="stat-info">
                    <h3 class="count-up">${value}</h3>
                    <p>${label}</p>
                    ${trend}
                </div>
            </div>
        `;
    },

    // Form input helper
    formInput(name, label, type = 'text', value = '', required = false, placeholder = '') {
        return `
            <div class="form-group">
                <label class="form-label">${label}${required ? '<span class="required">*</span>' : ''}</label>
                <input type="${type}" name="${name}" class="form-control"
                       value="${value}" ${required ? 'required' : ''}
                       placeholder="${placeholder || label}">
            </div>
        `;
    },

    formSelect(name, label, options, value = '', required = false) {
        const optionsHtml = options.map(opt =>
            `<option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        return `
            <div class="form-group">
                <label class="form-label">${label}${required ? '<span class="required">*</span>' : ''}</label>
                <select name="${name}" class="form-control" ${required ? 'required' : ''}>
                    <option value="">-- ជ្រើសរើស --</option>
                    ${optionsHtml}
                </select>
            </div>
        `;
    },

    formTextarea(name, label, value = '', required = false, placeholder = '') {
        return `
            <div class="form-group full-width">
                <label class="form-label">${label}${required ? '<span class="required">*</span>' : ''}</label>
                <textarea name="${name}" class="form-control"
                          ${required ? 'required' : ''}
                          placeholder="${placeholder || label}">${value}</textarea>
            </div>
        `;
    },
};

// Global close modal
function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
