/* ═══════════════════════════════════════════════════════════════
   Expenses Management Page - Track Property Operating Costs
   ═══════════════════════════════════════════════════════════════ */

let expensesState = { page: 1, category: '', month: '', year: '' };

const EXPENSE_CATEGORIES = [
    { value: 'repairs', label: 'ជួសជុល', icon: 'fa-wrench', color: '#e65100' },
    { value: 'utilities', label: 'សេវាកម្មសាធារណៈ', icon: 'fa-bolt', color: '#f57f17' },
    { value: 'insurance', label: 'ធានារ៉ាប់រង', icon: 'fa-shield-alt', color: '#1565c0' },
    { value: 'taxes', label: 'ពន្ធ', icon: 'fa-receipt', color: '#c62828' },
    { value: 'cleaning', label: 'សម្អាត', icon: 'fa-broom', color: '#2e7d32' },
    { value: 'security', label: 'សន្តិសុខ', icon: 'fa-lock', color: '#37474f' },
    { value: 'supplies', label: 'សម្ភារៈ', icon: 'fa-box', color: '#6a1b9a' },
    { value: 'marketing', label: 'ទីផ្សារ', icon: 'fa-bullhorn', color: '#00838f' },
    { value: 'salary', label: 'ប្រាក់ខែបុគ្គលិក', icon: 'fa-users', color: '#4527a0' },
    { value: 'other', label: 'ផ្សេងៗ', icon: 'fa-ellipsis-h', color: '#455a64' },
];

async function renderExpenses() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const params = { page: expensesState.page, per_page: 20 };
        if (expensesState.category) params.category = expensesState.category;
        if (expensesState.month) params.month = expensesState.month;
        if (expensesState.year) params.year = expensesState.year;

        const [result, summary] = await Promise.all([
            API.getExpenses(params),
            API.getExpenseSummary({ year: expensesState.year || new Date().getFullYear() }),
        ]);

        content.innerHTML = `
            <div class="page-enter">
                <!-- Summary Cards -->
                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #c62828, #e53935);">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">ចំណាយសរុប (USD)</span>
                            <span class="stat-value">$${Utils.formatNumber(summary.totals.total_usd)}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #1a237e, #3949ab);">
                            <i class="fas fa-money-bill"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">ចំណាយសរុប (KHR)</span>
                            <span class="stat-value">${Utils.formatNumber(summary.totals.total_khr)}៛</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #00695c, #00897b);">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">ប្រភេទចំណាយ</span>
                            <span class="stat-value">${summary.categories.length}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #e65100, #ef6c00);">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">កំណត់ត្រាសរុប</span>
                            <span class="stat-value">${summary.totals.total_count}</span>
                        </div>
                    </div>
                </div>

                <!-- Category Breakdown -->
                ${renderExpenseCategoryBreakdown(summary.categories)}

                <!-- Expense Table -->
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-list-alt"></i> កំណត់ត្រាចំណាយ</h3>
                        <button class="btn btn-primary btn-sm" onclick="showExpenseForm()">
                            <i class="fas fa-plus"></i> បន្ថែមចំណាយ
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="expensesState.category=this.value; expensesState.page=1; renderExpenses();">
                                    <option value="">ប្រភេទទាំងអស់</option>
                                    ${EXPENSE_CATEGORIES.map(c => `<option value="${c.value}" ${expensesState.category===c.value?'selected':''}>${c.label}</option>`).join('')}
                                </select>
                                <select class="filter-select" onchange="expensesState.year=this.value; expensesState.page=1; renderExpenses();">
                                    <option value="">ឆ្នាំទាំងអស់</option>
                                    ${generateYearOptions()}
                                </select>
                                <select class="filter-select" onchange="expensesState.month=this.value; expensesState.page=1; renderExpenses();">
                                    <option value="">ខែទាំងអស់</option>
                                    ${generateMonthOptions()}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderExpenseTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToExpensePage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderExpenseCategoryBreakdown(categories) {
    if (!categories || categories.length === 0) return '';

    const maxUsd = Math.max(...categories.map(c => c.total_usd), 1);

    return `
        <div class="card hover-lift" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3><i class="fas fa-chart-bar"></i> វិភាគតាមប្រភេទ</h3>
            </div>
            <div class="card-body">
                <div class="expense-category-bars">
                    ${categories.map(cat => {
                        const catInfo = EXPENSE_CATEGORIES.find(c => c.value === cat.category) || { label: cat.category, color: '#666', icon: 'fa-tag' };
                        const pct = (cat.total_usd / maxUsd * 100).toFixed(0);
                        return `
                            <div class="expense-bar-item">
                                <div class="expense-bar-label">
                                    <i class="fas ${catInfo.icon}" style="color: ${catInfo.color};"></i>
                                    <span>${catInfo.label}</span>
                                    <span class="expense-bar-count">${cat.count} កំណត់ត្រា</span>
                                </div>
                                <div class="expense-bar-track">
                                    <div class="expense-bar-fill" style="width: ${pct}%; background: ${catInfo.color};"></div>
                                </div>
                                <div class="expense-bar-value">$${Utils.formatNumber(cat.total_usd)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderExpenseTable(items) {
    if (!items || items.length === 0) {
        return Components.renderEmpty('fa-wallet', 'គ្មានកំណត់ត្រាចំណាយ', 'សូមបន្ថែមកំណត់ត្រាចំណាយថ្មី');
    }
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>កាលបរិច្ឆេទ</th><th>ប្រភេទ</th><th>ការពិពណ៌នា</th><th>អគារ</th><th>USD</th><th>KHR</th><th>សកម្មភាព</th>
            </tr></thead>
            <tbody>
                ${items.map(e => {
                    const catInfo = EXPENSE_CATEGORIES.find(c => c.value === e.category) || { label: e.category, color: '#666', icon: 'fa-tag' };
                    return `<tr>
                        <td>${Utils.formatDateShort(e.expense_date)}</td>
                        <td><span class="badge" style="background: ${catInfo.color}15; color: ${catInfo.color};"><i class="fas ${catInfo.icon}"></i> ${catInfo.label}</span></td>
                        <td><strong>${Utils.truncateText(e.description, 35)}</strong>${e.vendor ? `<br><small style="color:var(--gray-500);">${e.vendor}</small>` : ''}</td>
                        <td>${e.building_name || '-'}</td>
                        <td style="font-weight:600;">$${Utils.formatNumber(e.amount_usd)}</td>
                        <td>${Utils.formatNumber(e.amount_khr)}៛</td>
                        <td>
                            <button class="btn btn-ghost btn-icon sm" onclick="editExpense(${e.id})" title="កែប្រែ"><i class="fas fa-edit" style="color:var(--info)"></i></button>
                            <button class="btn btn-ghost btn-icon sm" onclick="deleteExpense(${e.id})" title="លុប"><i class="fas fa-trash" style="color:var(--danger)"></i></button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let y = currentYear; y >= currentYear - 3; y--) {
        options += `<option value="${y}" ${expensesState.year == y ? 'selected' : ''}>${y}</option>`;
    }
    return options;
}

function generateMonthOptions() {
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    return khmerMonths.map((m, i) => `<option value="${i + 1}" ${expensesState.month == (i + 1) ? 'selected' : ''}>${m}</option>`).join('');
}

function goToExpensePage(p) { expensesState.page = p; renderExpenses(); }

async function showExpenseForm(expenseId = null) {
    let expense = null;
    if (expenseId) {
        try {
            expense = await API.get(`/expenses/${expenseId}`);
        } catch (e) {
            Utils.showToast('មិនអាចផ្ទុកទិន្នន័យចំណាយបានទេ', 'error');
            return;
        }
    }

    const title = expense ? 'កែប្រែចំណាយ' : 'បន្ថែមចំណាយថ្មី';
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = `
        <form id="expenseForm" class="form-grid">
            <div class="form-group">
                <label>ប្រភេទចំណាយ <span class="required">*</span></label>
                <select id="expCategory" required>
                    <option value="">ជ្រើសរើសប្រភេទ</option>
                    ${EXPENSE_CATEGORIES.map(c => `<option value="${c.value}" ${expense && expense.category === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>ការពិពណ៌នា <span class="required">*</span></label>
                <input type="text" id="expDescription" value="${expense ? expense.description : ''}" required placeholder="ពិពណ៌នាចំណាយ">
            </div>
            <div class="form-group">
                <label>ចំនួនទឹកប្រាក់ (USD) <span class="required">*</span></label>
                <input type="number" id="expAmountUsd" value="${expense ? expense.amount_usd : ''}" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>ចំនួនទឹកប្រាក់ (KHR)</label>
                <input type="number" id="expAmountKhr" value="${expense ? expense.amount_khr : '0'}" step="100" min="0">
            </div>
            <div class="form-group">
                <label>កាលបរិច្ឆេទ <span class="required">*</span></label>
                <input type="date" id="expDate" value="${expense ? expense.expense_date : today}" required>
            </div>
            <div class="form-group">
                <label>អ្នកផ្គត់ផ្គង់/ក្រុមហ៊ុន</label>
                <input type="text" id="expVendor" value="${expense ? (expense.vendor || '') : ''}" placeholder="ឈ្មោះអ្នកផ្គត់ផ្គង់">
            </div>
            <div class="form-group">
                <label>លេខវិក្កយបត្រ</label>
                <input type="text" id="expReceipt" value="${expense ? (expense.receipt_number || '') : ''}" placeholder="លេខយោង">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
                <label>កំណត់ចំណាំ</label>
                <textarea id="expNotes" rows="3" placeholder="កំណត់ចំណាំបន្ថែម">${expense ? (expense.notes || '') : ''}</textarea>
            </div>
        </form>
    `;
    document.getElementById('modalFooter').innerHTML = `
        <button class="btn btn-ghost" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveExpense(${expenseId || 'null'})">
            <i class="fas fa-save"></i> រក្សាទុក
        </button>
    `;
    openModal();
}

async function saveExpense(expenseId) {
    const data = {
        category: document.getElementById('expCategory').value,
        description: document.getElementById('expDescription').value,
        amount_usd: parseFloat(document.getElementById('expAmountUsd').value) || 0,
        amount_khr: parseInt(document.getElementById('expAmountKhr').value) || 0,
        expense_date: document.getElementById('expDate').value,
        vendor: document.getElementById('expVendor').value || null,
        receipt_number: document.getElementById('expReceipt').value || null,
        notes: document.getElementById('expNotes').value || null,
        building_id: null,
    };

    if (!data.category || !data.description || !data.expense_date) {
        Utils.showToast('សូមបំពេញព័ត៌មានចាំបាច់', 'error');
        return;
    }

    try {
        if (expenseId) {
            await API.put(`/expenses/${expenseId}`, data);
            Utils.showToast('ធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាចំណាយបានជោគជ័យ', 'success');
        } else {
            await API.post('/expenses', data);
            Utils.showToast('បង្កើតកំណត់ត្រាចំណាយបានជោគជ័យ', 'success');
        }
        closeModal();
        renderExpenses();
    } catch (error) {
        Utils.showToast(error.message, 'error');
    }
}

function editExpense(id) {
    showExpenseForm(id);
}

async function deleteExpense(id) {
    if (!confirm('តើអ្នកពិតជាចង់លុបកំណត់ត្រាចំណាយនេះមែនទេ?')) return;
    try {
        await API.delete(`/expenses/${id}`);
        Utils.showToast('លុបកំណត់ត្រាចំណាយបានជោគជ័យ', 'success');
        renderExpenses();
    } catch (error) {
        Utils.showToast(error.message, 'error');
    }
}
