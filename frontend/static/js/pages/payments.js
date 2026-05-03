/* ═══════════════════════════════════════════════════════════════
   Payments Page
   ═══════════════════════════════════════════════════════════════ */

let paymentsState = { page: 1, status: 'all', type: '', search: '' };

async function renderPayments() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(6);

    try {
        const params = { page: paymentsState.page, per_page: 20, status_filter: paymentsState.status };
        if (paymentsState.type) params.payment_type = paymentsState.type;

        const [result, summary] = await Promise.all([
            API.getPayments(params),
            API.getPaymentSummary(),
        ]);

        content.innerHTML = `
            <div class="page-enter">
                <div class="stats-grid stagger-animate" style="margin-bottom: 24px;">
                    ${Components.renderStatCard('fa-check-circle', Utils.formatUSD(summary.total_collected_usd || 0), 'បានប្រមូល (USD)', 'success')}
                    ${Components.renderStatCard('fa-clock', Utils.formatUSD(summary.total_pending_usd || 0), 'រង់ចាំបង់ (USD)', 'warning')}
                    ${Components.renderStatCard('fa-receipt', summary.completed_count || 0, 'ទូទាត់រួច', 'info')}
                    ${Components.renderStatCard('fa-exclamation-triangle', summary.overdue_count || 0, 'ហួសកំណត់', 'danger')}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> ការបង់ប្រាក់</h3>
                        <button class="btn btn-primary btn-sm" onclick="showPaymentForm()">
                            <i class="fas fa-plus"></i> កត់ត្រាការបង់ប្រាក់
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="paymentsState.status=this.value; paymentsState.page=1; renderPayments();">
                                    <option value="all">ទាំងអស់</option>
                                    <option value="completed" ${paymentsState.status==='completed'?'selected':''}>បានបង់</option>
                                    <option value="pending" ${paymentsState.status==='pending'?'selected':''}>រង់ចាំ</option>
                                    <option value="overdue" ${paymentsState.status==='overdue'?'selected':''}>ហួសកំណត់</option>
                                </select>
                                <select class="filter-select" onchange="paymentsState.type=this.value; paymentsState.page=1; renderPayments();">
                                    <option value="">ប្រភេទទាំងអស់</option>
                                    <option value="rent" ${paymentsState.type==='rent'?'selected':''}>ថ្លៃជួល</option>
                                    <option value="deposit" ${paymentsState.type==='deposit'?'selected':''}>ប្រាក់កក់</option>
                                    <option value="utility" ${paymentsState.type==='utility'?'selected':''}>សេវា</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderPaymentTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToPaymentPage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderPaymentTable(payments) {
    if (!payments || payments.length === 0) {
        return Components.renderEmpty('fa-money-bill-wave', 'គ្មានការបង់ប្រាក់', 'មិនមានកំណត់ត្រាការបង់ប្រាក់');
    }
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>វិក័យប័ត្រ</th><th>អ្នកជួល</th><th>បន្ទប់</th><th>ចំនួន</th><th>ប្រភេទ</th><th>វិធី</th><th>កាលបរិច្ឆេទ</th><th>ស្ថានភាព</th>
            </tr></thead>
            <tbody>
                ${payments.map(p => `<tr>
                    <td><strong>${p.receipt_number || '-'}</strong></td>
                    <td>${p.tenant_name || '-'}</td>
                    <td>${p.room_number || '-'}</td>
                    <td style="font-weight:700; color:var(--primary);">${p.currency === 'USD' ? Utils.formatUSD(p.amount_usd) : Utils.formatKHR(p.amount_khr)}</td>
                    <td>${Utils.getPaymentTypeLabel(p.payment_type)}</td>
                    <td>${Utils.getPaymentMethodLabel(p.payment_method)}</td>
                    <td>${Utils.formatDateShort(p.payment_date)}</td>
                    <td>${Utils.getStatusBadge(p.status)}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function goToPaymentPage(p) { paymentsState.page = p; renderPayments(); }

async function showPaymentForm() {
    let contracts = [];
    try {
        const res = await API.getContracts({ status_filter: 'active', per_page: 100 });
        contracts = res.data || [];
    } catch (e) {}

    const body = `
        <form id="paymentForm" class="form-grid">
            ${Components.formSelect('contract_id', 'កិច្ចសន្យា', contracts.map(c => ({
                value: c.id, label: `${c.contract_number} - ${c.tenant_name} (បន្ទប់ ${c.room_number})`
            })), '', true)}
            <input type="hidden" name="tenant_id" id="paymentTenantId">
            ${Components.formInput('amount_usd', 'ចំនួន USD', 'number', '', true)}
            ${Components.formInput('amount_khr', 'ចំនួន KHR', 'number', '')}
            ${Components.formSelect('currency', 'រូបិយប័ណ្ណ', [{value:'USD',label:'ដុល្លារ (USD)'},{value:'KHR',label:'រៀល (KHR)'}], 'USD', true)}
            ${Components.formSelect('payment_type', 'ប្រភេទ', [{value:'rent',label:'ថ្លៃជួល'},{value:'deposit',label:'ប្រាក់កក់'},{value:'utility',label:'សេវាប្រើប្រាស់'},{value:'late_fee',label:'ពិន័យយឺត'}], 'rent', true)}
            ${Components.formSelect('payment_method', 'វិធីបង់', [{value:'cash',label:'សាច់ប្រាក់'},{value:'bank_transfer',label:'ផ្ទេរធនាគារ'},{value:'khqr',label:'KHQR'}], 'cash', true)}
            ${Components.formInput('payment_date', 'កាលបរិច្ឆេទបង់', 'date', new Date().toISOString().split('T')[0], true)}
            ${Components.formInput('period_month', 'ខែ (១-១២)', 'number', new Date().getMonth() + 1)}
            ${Components.formInput('period_year', 'ឆ្នាំ', 'number', new Date().getFullYear())}
            ${Components.formInput('transaction_ref', 'លេខប្រតិបត្តិការ', 'text', '')}
            ${Components.formTextarea('notes', 'កំណត់សម្គាល់', '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="savePayment()"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal('កត់ត្រាការបង់ប្រាក់ថ្មី', body, footer, { large: true });

    // Auto-fill tenant_id when contract selected
    setTimeout(() => {
        const sel = document.querySelector('[name="contract_id"]');
        if (sel) {
            sel.addEventListener('change', () => {
                const contract = contracts.find(c => c.id == sel.value);
                if (contract) document.getElementById('paymentTenantId').value = contract.tenant_id;
            });
        }
    }, 100);
}

async function savePayment() {
    const form = document.getElementById('paymentForm');
    const data = Object.fromEntries(new FormData(form));
    data.contract_id = parseInt(data.contract_id);
    data.tenant_id = parseInt(data.tenant_id) || data.contract_id;
    data.amount_usd = parseFloat(data.amount_usd) || 0;
    data.amount_khr = parseFloat(data.amount_khr) || 0;
    data.period_month = parseInt(data.period_month) || null;
    data.period_year = parseInt(data.period_year) || null;

    try {
        const result = await API.createPayment(data);
        Components.showToast(`កត់ត្រាការបង់ប្រាក់បានជោគជ័យ (${result.receipt_number})`, 'success');
        closeModal();
        renderPayments();
    } catch (e) { Components.showToast(e.message, 'error'); }
}
