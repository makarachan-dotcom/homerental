/* ═══════════════════════════════════════════════════════════════
   Tenants Page
   ═══════════════════════════════════════════════════════════════ */

let tenantsState = { page: 1, search: '', status: 'all' };

async function renderTenants() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(6);

    try {
        const params = { page: tenantsState.page, per_page: 20, search: tenantsState.search, status_filter: tenantsState.status };
        const result = await API.getTenants(params);

        content.innerHTML = `
            <div class="page-enter">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> គ្រប់គ្រងអ្នកជួល</h3>
                        <button class="btn btn-primary btn-sm" onclick="showTenantForm()">
                            <i class="fas fa-user-plus"></i> បន្ថែមអ្នកជួលថ្មី
                        </button>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom:0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="tenantsState.status=this.value; tenantsState.page=1; renderTenants();">
                                    <option value="all">ទាំងអស់</option>
                                    <option value="active" ${tenantsState.status==='active'?'selected':''}>សកម្ម</option>
                                    <option value="inactive" ${tenantsState.status==='inactive'?'selected':''}>អសកម្ម</option>
                                </select>
                            </div>
                            <div class="toolbar-right">
                                <div class="search-wrapper">
                                    <i class="fas fa-search"></i>
                                    <input type="text" class="search-input" placeholder="ស្វែងរកអ្នកជួល..."
                                           value="${tenantsState.search}" oninput="tenantsState.search=this.value; debounceTenantSearch();">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${renderTenantTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToTenantPage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderTenantTable(tenants) {
    if (!tenants || tenants.length === 0) {
        return Components.renderEmpty('fa-users', 'គ្មានអ្នកជួល', 'មិនមានអ្នកជួលត្រូវនឹងលក្ខខណ្ឌស្វែងរក',
            '<button class="btn btn-primary" onclick="showTenantForm()"><i class="fas fa-plus"></i> បន្ថែមអ្នកជួលថ្មី</button>');
    }

    return `<div class="table-container">
        <table class="data-table">
            <thead><tr>
                <th>ឈ្មោះ</th><th>ទូរស័ព្ទ</th><th>បន្ទប់</th><th>មុខរបរ</th><th>ស្ថានភាព</th><th>សកម្មភាព</th>
            </tr></thead>
            <tbody>
                ${tenants.map(t => `<tr>
                    <td><strong>${t.first_name} ${t.last_name}</strong></td>
                    <td>${t.phone}</td>
                    <td>${t.room_number || '<span style="color:var(--gray-400)">គ្មាន</span>'}</td>
                    <td>${t.occupation || '-'}</td>
                    <td>${t.contract_status ? Utils.getStatusBadge(t.contract_status) : Utils.getStatusBadge(t.is_active ? 'active' : 'terminated')}</td>
                    <td>
                        <button class="btn btn-ghost btn-icon sm" onclick="showTenantDetail(${t.id})" title="មើល"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-ghost btn-icon sm" onclick="showTenantForm(${t.id})" title="កែប្រែ"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-ghost btn-icon sm" onclick="deleteTenant(${t.id})" title="លុប"><i class="fas fa-trash" style="color:var(--danger)"></i></button>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

const debounceTenantSearch = Utils.debounce(() => { tenantsState.page = 1; renderTenants(); }, 400);
function goToTenantPage(p) { tenantsState.page = p; renderTenants(); }

async function showTenantDetail(id) {
    try {
        const t = await API.getTenant(id);
        const body = `
            <div style="text-align:center; margin-bottom:20px;">
                <div style="width:80px;height:80px;border-radius:50%;background:var(--primary-50);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                    <i class="fas fa-user" style="font-size:32px; color:var(--primary);"></i>
                </div>
                <h3>${t.first_name} ${t.last_name}</h3>
                <p style="color:var(--gray-500);">${t.occupation || ''}</p>
            </div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">ទូរស័ព្ទ</label><p>${t.phone}</p></div>
                <div class="form-group"><label class="form-label">អ៊ីមែល</label><p>${t.email || '-'}</p></div>
                <div class="form-group"><label class="form-label">ភេទ</label><p>${t.gender || '-'}</p></div>
                <div class="form-group"><label class="form-label">សញ្ជាតិ</label><p>${t.nationality || '-'}</p></div>
                <div class="form-group"><label class="form-label">អត្តសញ្ញាណប័ណ្ណ</label><p>${t.id_card_number || '-'}</p></div>
                <div class="form-group"><label class="form-label">កន្លែងធ្វើការ</label><p>${t.workplace || '-'}</p></div>
                ${t.room_number ? `
                <div class="form-group full-width" style="background:var(--primary-50); padding:16px; border-radius:12px;">
                    <label class="form-label" style="color:var(--primary);">ព័ត៌មានបន្ទប់</label>
                    <p>បន្ទប់ ${t.room_number} | ${Utils.formatUSD(t.monthly_rent_usd)}/ខែ</p>
                    <p style="font-size:13px;">កិច្ចសន្យា: ${Utils.formatDateShort(t.contract_start)} - ${Utils.formatDateShort(t.contract_end)}</p>
                </div>` : ''}
                ${t.emergency_contact_name ? `
                <div class="form-group full-width" style="background:var(--warning-bg); padding:16px; border-radius:12px;">
                    <label class="form-label" style="color:var(--warning);">ទំនាក់ទំនងបន្ទាន់</label>
                    <p>${t.emergency_contact_name} (${t.emergency_contact_relation || ''}) - ${t.emergency_contact_phone || ''}</p>
                </div>` : ''}
            </div>
        `;
        const footer = `
            <button class="btn btn-outline" onclick="closeModal()">បិទ</button>
            <a class="btn btn-success" href="${API.getTenantQR(id)}" target="_blank"><i class="fas fa-qrcode"></i> QR កូដ</a>
            <button class="btn btn-primary" onclick="closeModal(); showTenantForm(${id})"><i class="fas fa-edit"></i> កែប្រែ</button>
        `;
        Components.showModal('ព័ត៌មានអ្នកជួល', body, footer, { large: true });
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function showTenantForm(id = null) {
    let t = {};
    if (id) { try { t = await API.getTenant(id); } catch (e) { Components.showToast(e.message, 'error'); return; } }

    const body = `
        <form id="tenantForm" class="form-grid">
            ${Components.formInput('first_name', 'នាមខ្លួន', 'text', t.first_name || '', true)}
            ${Components.formInput('last_name', 'នាមត្រកូល', 'text', t.last_name || '', true)}
            ${Components.formInput('phone', 'ទូរស័ព្ទ', 'tel', t.phone || '', true)}
            ${Components.formInput('email', 'អ៊ីមែល', 'email', t.email || '')}
            ${Components.formSelect('gender', 'ភេទ', [{value:'ប្រុស',label:'ប្រុស'},{value:'ស្រី',label:'ស្រី'}], t.gender || '')}
            ${Components.formInput('id_card_number', 'លេខអត្តសញ្ញាណប័ណ្ណ', 'text', t.id_card_number || '')}
            ${Components.formInput('date_of_birth', 'ថ្ងៃខែឆ្នាំកំណើត', 'date', t.date_of_birth || '')}
            ${Components.formInput('nationality', 'សញ្ជាតិ', 'text', t.nationality || 'កម្ពុជា')}
            ${Components.formInput('occupation', 'មុខរបរ', 'text', t.occupation || '')}
            ${Components.formInput('workplace', 'កន្លែងធ្វើការ', 'text', t.workplace || '')}
            ${Components.formInput('emergency_contact_name', 'ឈ្មោះទំនាក់ទំនងបន្ទាន់', 'text', t.emergency_contact_name || '')}
            ${Components.formInput('emergency_contact_phone', 'ទូរស័ព្ទទំនាក់ទំនងបន្ទាន់', 'tel', t.emergency_contact_phone || '')}
            ${Components.formInput('emergency_contact_relation', 'ទំនាក់ទំនង', 'text', t.emergency_contact_relation || '')}
            ${Components.formTextarea('notes', 'កំណត់សម្គាល់', t.notes || '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveTenant(${id || 'null'})"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal(id ? 'កែប្រែអ្នកជួល' : 'បន្ថែមអ្នកជួលថ្មី', body, footer, { large: true });
}

async function saveTenant(id) {
    const form = document.getElementById('tenantForm');
    const data = Object.fromEntries(new FormData(form));
    try {
        if (id) { await API.updateTenant(id, data); Components.showToast('ធ្វើបច្ចុប្បន្នភាពអ្នកជួលបានជោគជ័យ', 'success'); }
        else { await API.createTenant(data); Components.showToast('បង្កើតអ្នកជួលថ្មីបានជោគជ័យ', 'success'); }
        closeModal();
        renderTenants();
    } catch (e) { Components.showToast(e.message, 'error'); }
}

function deleteTenant(id) {
    Components.confirm('តើអ្នកប្រាកដជាចង់លុបអ្នកជួលនេះមែនទេ?', async () => {
        try { await API.deleteTenant(id); Components.showToast('លុបអ្នកជួលបានជោគជ័យ', 'success'); renderTenants(); }
        catch (e) { Components.showToast(e.message, 'error'); }
    });
}
