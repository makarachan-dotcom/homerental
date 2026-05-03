/* ═══════════════════════════════════════════════════════════════
   Utilities Page
   ═══════════════════════════════════════════════════════════════ */

let utilitiesState = { page: 1, status: 'all' };

async function renderUtilities() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const result = await API.getUtilities({ page: utilitiesState.page, per_page: 20, status_filter: utilitiesState.status });

        content.innerHTML = `
            <div class="page-enter">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-bolt"></i> វិក័យប័ត្រសេវាប្រើប្រាស់</h3>
                        <button class="btn btn-primary btn-sm" onclick="showUtilityForm()">
                            <i class="fas fa-plus"></i> បង្កើតវិក័យប័ត្រ
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <select class="filter-select" onchange="utilitiesState.status=this.value; utilitiesState.page=1; renderUtilities();">
                                <option value="all">ទាំងអស់</option>
                                <option value="pending" ${utilitiesState.status==='pending'?'selected':''}>រង់ចាំ</option>
                                <option value="paid" ${utilitiesState.status==='paid'?'selected':''}>បានបង់</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderUtilityTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToUtilityPage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderUtilityTable(utilities) {
    if (!utilities || utilities.length === 0) {
        return Components.renderEmpty('fa-bolt', 'គ្មានវិក័យប័ត្រ', 'មិនមានវិក័យប័ត្រសេវាប្រើប្រាស់');
    }
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>បន្ទប់</th><th>ខែ/ឆ្នាំ</th><th>ភ្លើង</th><th>ទឹក</th><th>អ៊ីនធើណិត</th><th>សរុប</th><th>ស្ថានភាព</th>
            </tr></thead>
            <tbody>
                ${utilities.map(u => `<tr>
                    <td><strong>${u.room_number || '-'}</strong></td>
                    <td>${u.period_month}/${u.period_year}</td>
                    <td>${Utils.formatKHR(u.electricity_amount)} <small>(${u.electricity_usage}kWh)</small></td>
                    <td>${Utils.formatKHR(u.water_amount)} <small>(${u.water_usage}m³)</small></td>
                    <td>${Utils.formatUSD(u.internet_amount)}</td>
                    <td style="font-weight:700;">${u.currency === 'USD' ? Utils.formatUSD(u.total_amount) : Utils.formatKHR(u.total_amount)}</td>
                    <td>${Utils.getStatusBadge(u.status)}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function goToUtilityPage(p) { utilitiesState.page = p; renderUtilities(); }

async function showUtilityForm() {
    let contracts = [];
    try {
        const res = await API.getContracts({ status_filter: 'active', per_page: 100 });
        contracts = res.data || [];
    } catch (e) {}

    const now = new Date();
    const body = `
        <form id="utilityForm" class="form-grid">
            ${Components.formSelect('contract_id', 'កិច្ចសន្យា/បន្ទប់', contracts.map(c => ({
                value: c.id, label: `${c.tenant_name} - បន្ទប់ ${c.room_number}`
            })), '', true)}
            <input type="hidden" name="room_id" id="utilityRoomId">
            ${Components.formInput('period_month', 'ខែ', 'number', now.getMonth() + 1, true)}
            ${Components.formInput('period_year', 'ឆ្នាំ', 'number', now.getFullYear(), true)}
            <div class="form-group full-width"><h4 style="color:var(--warning); margin-top:10px;"><i class="fas fa-bolt"></i> ភ្លើង</h4></div>
            ${Components.formInput('electricity_previous', 'មីទ័រចាស់ (kWh)', 'number', '0', true)}
            ${Components.formInput('electricity_current', 'មីទ័រថ្មី (kWh)', 'number', '', true)}
            ${Components.formInput('electricity_rate', 'តម្លៃ/kWh (រៀល)', 'number', '610')}
            <div class="form-group full-width"><h4 style="color:var(--info); margin-top:10px;"><i class="fas fa-tint"></i> ទឹក</h4></div>
            ${Components.formInput('water_previous', 'មីទ័រចាស់ (m³)', 'number', '0', true)}
            ${Components.formInput('water_current', 'មីទ័រថ្មី (m³)', 'number', '', true)}
            ${Components.formInput('water_rate', 'តម្លៃ/m³ (រៀល)', 'number', '1500')}
            <div class="form-group full-width"><h4 style="color:var(--success); margin-top:10px;"><i class="fas fa-wifi"></i> សេវាផ្សេង</h4></div>
            ${Components.formInput('internet_amount', 'អ៊ីនធើណិត (USD)', 'number', '10')}
            ${Components.formInput('garbage_amount', 'សំរាម (USD)', 'number', '2')}
            ${Components.formInput('other_amount', 'ផ្សេងៗ', 'number', '0')}
            ${Components.formTextarea('notes', 'កំណត់សម្គាល់', '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveUtility()"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal('បង្កើតវិក័យប័ត្រសេវា', body, footer, { large: true });

    setTimeout(() => {
        const sel = document.querySelector('[name="contract_id"]');
        if (sel) {
            sel.addEventListener('change', () => {
                const contract = contracts.find(c => c.id == sel.value);
                if (contract) document.getElementById('utilityRoomId').value = contract.room_id;
            });
        }
    }, 100);
}

async function saveUtility() {
    const form = document.getElementById('utilityForm');
    const data = Object.fromEntries(new FormData(form));
    data.contract_id = parseInt(data.contract_id);
    data.room_id = parseInt(data.room_id) || 1;
    data.period_month = parseInt(data.period_month);
    data.period_year = parseInt(data.period_year);
    data.electricity_previous = parseFloat(data.electricity_previous) || 0;
    data.electricity_current = parseFloat(data.electricity_current) || 0;
    data.electricity_rate = parseFloat(data.electricity_rate) || 610;
    data.water_previous = parseFloat(data.water_previous) || 0;
    data.water_current = parseFloat(data.water_current) || 0;
    data.water_rate = parseFloat(data.water_rate) || 1500;
    data.internet_amount = parseFloat(data.internet_amount) || 0;
    data.garbage_amount = parseFloat(data.garbage_amount) || 0;
    data.other_amount = parseFloat(data.other_amount) || 0;
    data.currency = 'KHR';

    try {
        const result = await API.createUtility(data);
        Components.showToast(`កត់ត្រាវិក័យប័ត្របានជោគជ័យ (សរុប: ${Utils.formatKHR(result.total_amount)})`, 'success');
        closeModal(); renderUtilities();
    } catch (e) { Components.showToast(e.message, 'error'); }
}
