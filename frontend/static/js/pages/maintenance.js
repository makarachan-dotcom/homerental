/* ═══════════════════════════════════════════════════════════════
   Maintenance Page
   ═══════════════════════════════════════════════════════════════ */

let maintenanceState = { page: 1, status: 'all', priority: '' };

async function renderMaintenance() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const params = { page: maintenanceState.page, per_page: 20, status_filter: maintenanceState.status };
        if (maintenanceState.priority) params.priority = maintenanceState.priority;
        const result = await API.getMaintenance(params);

        content.innerHTML = `
            <div class="page-enter">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-tools"></i> សំណើថែទាំ/ជួសជុល</h3>
                        <button class="btn btn-primary btn-sm" onclick="showMaintenanceForm()">
                            <i class="fas fa-plus"></i> បង្កើតសំណើថ្មី
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="maintenanceState.status=this.value; maintenanceState.page=1; renderMaintenance();">
                                    <option value="all">ទាំងអស់</option>
                                    <option value="pending" ${maintenanceState.status==='pending'?'selected':''}>រង់ចាំ</option>
                                    <option value="in_progress" ${maintenanceState.status==='in_progress'?'selected':''}>កំពុងដំណើរការ</option>
                                    <option value="completed" ${maintenanceState.status==='completed'?'selected':''}>រួចរាល់</option>
                                </select>
                                <select class="filter-select" onchange="maintenanceState.priority=this.value; maintenanceState.page=1; renderMaintenance();">
                                    <option value="">អាទិភាពទាំងអស់</option>
                                    <option value="urgent" ${maintenanceState.priority==='urgent'?'selected':''}>បន្ទាន់</option>
                                    <option value="high" ${maintenanceState.priority==='high'?'selected':''}>ខ្ពស់</option>
                                    <option value="normal" ${maintenanceState.priority==='normal'?'selected':''}>ធម្មតា</option>
                                    <option value="low" ${maintenanceState.priority==='low'?'selected':''}>ទាប</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderMaintenanceTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToMaintenancePage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderMaintenanceTable(items) {
    if (!items || items.length === 0) {
        return Components.renderEmpty('fa-tools', 'គ្មានសំណើថែទាំ', 'មិនមានសំណើថែទាំ/ជួសជុល');
    }
    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>ចំណងជើង</th><th>បន្ទប់</th><th>អ្នកជួល</th><th>អាទិភាព</th><th>ស្ថានភាព</th><th>កាលបរិច្ឆេទ</th><th>សកម្មភាព</th>
            </tr></thead>
            <tbody>
                ${items.map(m => `<tr>
                    <td><strong>${Utils.truncateText(m.title, 40)}</strong></td>
                    <td>${m.room_number || '-'}</td>
                    <td>${m.tenant_name || '-'}</td>
                    <td>${Utils.getPriorityBadge(m.priority)}</td>
                    <td>${Utils.getStatusBadge(m.status)}</td>
                    <td>${Utils.formatDateShort(m.reported_date)}</td>
                    <td>
                        <button class="btn btn-ghost btn-icon sm" onclick="updateMaintenanceStatus(${m.id}, 'in_progress')" title="ចាប់ផ្តើម"><i class="fas fa-play" style="color:var(--info)"></i></button>
                        <button class="btn btn-ghost btn-icon sm" onclick="updateMaintenanceStatus(${m.id}, 'completed')" title="រួចរាល់"><i class="fas fa-check" style="color:var(--success)"></i></button>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function goToMaintenancePage(p) { maintenanceState.page = p; renderMaintenance(); }

async function showMaintenanceForm() {
    let rooms = [];
    try { const res = await API.getRooms({ per_page: 100 }); rooms = res.data || []; } catch (e) {}

    const body = `
        <form id="maintenanceForm" class="form-grid">
            ${Components.formInput('title', 'ចំណងជើង', 'text', '', true, 'ឧ. ម៉ាស៊ីនត្រជាក់ខូច')}
            ${Components.formSelect('room_id', 'បន្ទប់', rooms.map(r => ({value: r.id, label: `${r.room_number} (ជាន់ ${r.floor})`})), '', true)}
            ${Components.formSelect('priority', 'អាទិភាព', [
                {value:'low',label:'ទាប'},{value:'normal',label:'ធម្មតា'},{value:'high',label:'ខ្ពស់'},{value:'urgent',label:'បន្ទាន់'}
            ], 'normal', true)}
            ${Components.formInput('reported_date', 'កាលបរិច្ឆេទរាយការណ៍', 'date', new Date().toISOString().split('T')[0], true)}
            ${Components.formInput('assigned_to', 'ដាក់ឱ្យ', 'text', '')}
            ${Components.formInput('estimated_cost', 'ថ្លៃប៉ាន់ស្មាន ($)', 'number', '')}
            ${Components.formTextarea('description', 'ការពិពណ៌នា', '', true, 'ពណ៌នាពីបញ្ហា...')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveMaintenance()"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal('បង្កើតសំណើថែទាំថ្មី', body, footer, { large: true });
}

async function saveMaintenance() {
    const form = document.getElementById('maintenanceForm');
    const data = Object.fromEntries(new FormData(form));
    data.room_id = parseInt(data.room_id);
    data.estimated_cost = parseFloat(data.estimated_cost) || null;

    try {
        await API.createMaintenance(data);
        Components.showToast('បង្កើតសំណើថែទាំបានជោគជ័យ', 'success');
        closeModal(); renderMaintenance();
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function updateMaintenanceStatus(id, status) {
    try {
        await API.updateMaintenance(id, { status });
        Components.showToast('ធ្វើបច្ចុប្បន្នភាពស្ថានភាពបានជោគជ័យ', 'success');
        renderMaintenance();
    } catch (e) { Components.showToast(e.message, 'error'); }
}
