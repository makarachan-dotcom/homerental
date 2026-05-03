/* ═══════════════════════════════════════════════════════════════
   Contracts Page
   ═══════════════════════════════════════════════════════════════ */

let contractsState = { page: 1, search: '', status: 'all' };

async function renderContracts() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(6);

    try {
        const params = { page: contractsState.page, per_page: 20, search: contractsState.search, status_filter: contractsState.status };
        const result = await API.getContracts(params);

        content.innerHTML = `
            <div class="page-enter">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-contract"></i> គ្រប់គ្រងកិច្ចសន្យា</h3>
                        <button class="btn btn-primary btn-sm" onclick="showContractForm()">
                            <i class="fas fa-plus"></i> បង្កើតកិច្ចសន្យាថ្មី
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="contractsState.status=this.value; contractsState.page=1; renderContracts();">
                                    <option value="all">ទាំងអស់</option>
                                    <option value="active" ${contractsState.status==='active'?'selected':''}>សកម្ម</option>
                                    <option value="expired" ${contractsState.status==='expired'?'selected':''}>ផុតកំណត់</option>
                                    <option value="terminated" ${contractsState.status==='terminated'?'selected':''}>បានបញ្ចប់</option>
                                </select>
                            </div>
                            <div class="toolbar-right">
                                <div class="search-wrapper">
                                    <i class="fas fa-search"></i>
                                    <input type="text" class="search-input" placeholder="ស្វែងរកកិច្ចសន្យា..."
                                           value="${contractsState.search}" oninput="contractsState.search=this.value; debounceContractSearch();">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderContractTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToContractPage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderContractTable(contracts) {
    if (!contracts || contracts.length === 0) {
        return Components.renderEmpty('fa-file-contract', 'គ្មានកិច្ចសន្យា', 'មិនមានកិច្ចសន្យាត្រូវនឹងលក្ខខណ្ឌស្វែងរក');
    }
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>លេខកិច្ចសន្យា</th><th>អ្នកជួល</th><th>បន្ទប់</th><th>ថ្លៃជួល</th><th>រយៈពេល</th><th>ស្ថានភាព</th><th>សកម្មភាព</th>
            </tr></thead>
            <tbody>
                ${contracts.map(c => `<tr>
                    <td><strong>${c.contract_number}</strong></td>
                    <td>${c.tenant_name || '-'}</td>
                    <td>${c.room_number || '-'}</td>
                    <td>${Utils.formatUSD(c.monthly_rent_usd)}</td>
                    <td>${Utils.formatDateShort(c.start_date)} - ${Utils.formatDateShort(c.end_date)}</td>
                    <td>${Utils.getStatusBadge(c.status)}</td>
                    <td>
                        <button class="btn btn-ghost btn-icon sm" onclick="showContractDetail(${c.id})" title="មើល"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-ghost btn-icon sm" onclick="showContractForm(${c.id})" title="កែប្រែ"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

const debounceContractSearch = Utils.debounce(() => { contractsState.page = 1; renderContracts(); }, 400);
function goToContractPage(p) { contractsState.page = p; renderContracts(); }

async function showContractDetail(id) {
    try {
        const c = await API.getContract(id);
        const body = `
            <div class="form-grid">
                <div class="form-group"><label class="form-label">លេខកិច្ចសន្យា</label><p style="font-weight:700">${c.contract_number}</p></div>
                <div class="form-group"><label class="form-label">ស្ថានភាព</label><p>${Utils.getStatusBadge(c.status)}</p></div>
                <div class="form-group"><label class="form-label">អ្នកជួល</label><p>${c.tenant_name || '-'}</p></div>
                <div class="form-group"><label class="form-label">បន្ទប់</label><p>${c.room_number || '-'} (ជាន់ ${c.floor || '-'})</p></div>
                <div class="form-group"><label class="form-label">ថ្លៃជួល USD</label><p style="font-weight:700; color:var(--primary);">${Utils.formatUSD(c.monthly_rent_usd)}/ខែ</p></div>
                <div class="form-group"><label class="form-label">ថ្លៃជួល KHR</label><p style="font-weight:700; color:var(--secondary);">${Utils.formatKHR(c.monthly_rent_khr)}/ខែ</p></div>
                <div class="form-group"><label class="form-label">ថ្ងៃចាប់ផ្តើម</label><p>${Utils.formatDate(c.start_date)}</p></div>
                <div class="form-group"><label class="form-label">ថ្ងៃបញ្ចប់</label><p>${Utils.formatDate(c.end_date)}</p></div>
                <div class="form-group"><label class="form-label">ប្រាក់កក់ USD</label><p>${Utils.formatUSD(c.deposit_paid_usd)}</p></div>
                <div class="form-group"><label class="form-label">ប្រាក់កក់ KHR</label><p>${Utils.formatKHR(c.deposit_paid_khr)}</p></div>
                <div class="form-group"><label class="form-label">ថ្ងៃបង់ប្រាក់</label><p>ថ្ងៃទី ${c.payment_due_day} ប្រចាំខែ</p></div>
            </div>
        `;
        const footer = `
            <button class="btn btn-outline" onclick="closeModal()">បិទ</button>
            ${c.status === 'active' ? `<button class="btn btn-danger btn-sm" onclick="terminateContract(${c.id})"><i class="fas fa-ban"></i> បញ្ចប់កិច្ចសន្យា</button>` : ''}
            <button class="btn btn-primary" onclick="closeModal(); showContractForm(${c.id})"><i class="fas fa-edit"></i> កែប្រែ</button>
        `;
        Components.showModal('ព័ត៌មានកិច្ចសន្យា', body, footer, { large: true });
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function showContractForm(id = null) {
    let c = {};
    if (id) { try { c = await API.getContract(id); } catch (e) { Components.showToast(e.message, 'error'); return; } }

    // Load tenants and rooms for selection
    let tenants = [], rooms = [];
    try {
        const [tRes, rRes] = await Promise.all([
            API.getTenants({ per_page: 100, status_filter: 'active' }),
            API.getRooms({ status_filter: id ? 'all' : 'available', per_page: 100 }),
        ]);
        tenants = tRes.data || [];
        rooms = rRes.data || [];
    } catch (e) {}

    const body = `
        <form id="contractForm" class="form-grid">
            ${Components.formSelect('tenant_id', 'អ្នកជួល', tenants.map(t => ({value: t.id, label: `${t.first_name} ${t.last_name} (${t.phone})`})), c.tenant_id || '', true)}
            ${Components.formSelect('room_id', 'បន្ទប់', rooms.map(r => ({value: r.id, label: `${r.room_number} - ${Utils.formatUSD(r.price_usd)} (${Utils.getStatusBadge(r.status).replace(/<[^>]*>/g, '')})`})), c.room_id || '', true)}
            ${Components.formInput('start_date', 'ថ្ងៃចាប់ផ្តើម', 'date', c.start_date || '', true)}
            ${Components.formInput('end_date', 'ថ្ងៃបញ្ចប់', 'date', c.end_date || '', true)}
            ${Components.formInput('monthly_rent_usd', 'ថ្លៃជួល USD/ខែ', 'number', c.monthly_rent_usd || '', true)}
            ${Components.formInput('monthly_rent_khr', 'ថ្លៃជួល KHR/ខែ', 'number', c.monthly_rent_khr || '')}
            ${Components.formInput('deposit_paid_usd', 'ប្រាក់កក់ USD', 'number', c.deposit_paid_usd || '')}
            ${Components.formInput('deposit_paid_khr', 'ប្រាក់កក់ KHR', 'number', c.deposit_paid_khr || '')}
            ${Components.formInput('payment_due_day', 'ថ្ងៃបង់ប្រាក់ប្រចាំខែ', 'number', c.payment_due_day || 5)}
            ${Components.formTextarea('notes', 'កំណត់សម្គាល់', c.notes || '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveContract(${id || 'null'})"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal(id ? 'កែប្រែកិច្ចសន្យា' : 'បង្កើតកិច្ចសន្យាថ្មី', body, footer, { large: true });
}

async function saveContract(id) {
    const form = document.getElementById('contractForm');
    const data = Object.fromEntries(new FormData(form));
    data.tenant_id = parseInt(data.tenant_id);
    data.room_id = parseInt(data.room_id);
    data.monthly_rent_usd = parseFloat(data.monthly_rent_usd) || 0;
    data.monthly_rent_khr = parseFloat(data.monthly_rent_khr) || 0;
    data.deposit_paid_usd = parseFloat(data.deposit_paid_usd) || 0;
    data.deposit_paid_khr = parseFloat(data.deposit_paid_khr) || 0;
    data.payment_due_day = parseInt(data.payment_due_day) || 5;

    try {
        if (id) { await API.updateContract(id, data); Components.showToast('ធ្វើបច្ចុប្បន្នភាពកិច្ចសន្យាបានជោគជ័យ', 'success'); }
        else { await API.createContract(data); Components.showToast('បង្កើតកិច្ចសន្យាថ្មីបានជោគជ័យ', 'success'); }
        closeModal(); renderContracts();
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function terminateContract(id) {
    Components.confirm('តើអ្នកប្រាកដជាចង់បញ្ចប់កិច្ចសន្យានេះមែនទេ?', async () => {
        try { await API.updateContract(id, { status: 'terminated' }); Components.showToast('បញ្ចប់កិច្ចសន្យាបានជោគជ័យ', 'success'); closeModal(); renderContracts(); }
        catch (e) { Components.showToast(e.message, 'error'); }
    });
}
