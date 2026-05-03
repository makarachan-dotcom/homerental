/* ═══════════════════════════════════════════════════════════════
   Settings Page
   ═══════════════════════════════════════════════════════════════ */

async function renderSettings() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const [settings, users] = await Promise.all([
            API.getSettings(),
            API.getUsers().catch(() => ({ data: [] })),
        ]);

        content.innerHTML = `
            <div class="page-enter">
                <!-- Tab Navigation -->
                <div class="tab-nav" style="margin-bottom: 24px;">
                    <button class="tab-btn active" onclick="switchSettingsTab('general', this)">ទូទៅ</button>
                    <button class="tab-btn" onclick="switchSettingsTab('users', this)">អ្នកប្រើប្រាស់</button>
                    <button class="tab-btn" onclick="switchSettingsTab('business', this)">ព័ត៌មានអាជីវកម្ម</button>
                    <button class="tab-btn" onclick="switchSettingsTab('security', this)">សុវត្ថិភាព</button>
                </div>

                <!-- Settings Content -->
                <div id="settingsContent">
                    ${renderGeneralSettings(settings.data)}
                </div>

                <!-- Hidden data for tabs -->
                <script>
                    window._settingsData = ${JSON.stringify(settings.data)};
                    window._usersData = ${JSON.stringify(users.data)};
                </script>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function switchSettingsTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const container = document.getElementById('settingsContent');
    switch (tab) {
        case 'general': container.innerHTML = renderGeneralSettings(window._settingsData); break;
        case 'users': container.innerHTML = renderUsersSettings(window._usersData); break;
        case 'business': container.innerHTML = renderBusinessSettings(); break;
        case 'security': container.innerHTML = renderSecuritySettings(); break;
    }
}

function renderGeneralSettings(settings) {
    const settingLabels = {
        'electricity_rate': { label: 'តម្លៃភ្លើង/kWh', icon: 'fa-bolt', unit: 'រៀល' },
        'water_rate': { label: 'តម្លៃទឹក/m³', icon: 'fa-tint', unit: 'រៀល' },
        'internet_monthly': { label: 'អ៊ីនធើណិត/ខែ', icon: 'fa-wifi', unit: 'ដុល្លារ' },
        'garbage_monthly': { label: 'សំរាម/ខែ', icon: 'fa-trash', unit: 'ដុល្លារ' },
        'exchange_rate': { label: 'អត្រាប្តូរប្រាក់', icon: 'fa-exchange-alt', unit: 'រៀល/ដុល្លារ' },
        'late_fee_percent': { label: 'ពិន័យបង់ប្រាក់យឺត', icon: 'fa-percent', unit: '%' },
        'late_fee_days': { label: 'ថ្ងៃមុនពិន័យ', icon: 'fa-calendar', unit: 'ថ្ងៃ' },
    };

    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-sliders-h"></i> ការកំណត់ទូទៅ</h3>
            </div>
            <div class="card-body">
                <div class="form-grid">
                    ${(settings || []).map(s => {
                        const info = settingLabels[s.key] || { label: s.key, icon: 'fa-cog', unit: '' };
                        return `
                            <div class="form-group">
                                <label class="form-label"><i class="fas ${info.icon}" style="margin-right:6px; color:var(--primary);"></i>${info.label}</label>
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <input type="text" class="form-control" id="setting_${s.key}" value="${s.value}">
                                    <span style="font-size:12px; color:var(--gray-500); white-space:nowrap;">${info.unit}</span>
                                    <button class="btn btn-primary btn-sm btn-icon" onclick="saveSetting('${s.key}')" title="រក្សាទុក">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                                <small style="color: var(--gray-500);">${s.description || ''}</small>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderUsersSettings(users) {
    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-users-cog"></i> គ្រប់គ្រងអ្នកប្រើប្រាស់</h3>
                <button class="btn btn-primary btn-sm" onclick="showCreateUserForm()">
                    <i class="fas fa-user-plus"></i> បន្ថែមអ្នកប្រើថ្មី
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead><tr><th>ឈ្មោះអ្នកប្រើ</th><th>ឈ្មោះពេញ</th><th>តួនាទី</th><th>ស្ថានភាព</th><th>សកម្មភាព</th></tr></thead>
                        <tbody>
                            ${(users || []).map(u => `<tr>
                                <td><strong>${u.username}</strong></td>
                                <td>${u.full_name}</td>
                                <td>${u.role === 'admin' ? '<span class="badge badge-active">អ្នកគ្រប់គ្រង</span>' : '<span class="badge badge-reserved">បុគ្គលិក</span>'}</td>
                                <td>${u.is_active ? '<span class="badge badge-active">សកម្ម</span>' : '<span class="badge badge-terminated">បិទ</span>'}</td>
                                <td>
                                    <button class="btn btn-ghost btn-icon sm" onclick="toggleUserStatus(${u.id}, ${!u.is_active})" title="${u.is_active ? 'បិទ' : 'បើក'}">
                                        <i class="fas ${u.is_active ? 'fa-ban' : 'fa-check'}" style="color:${u.is_active ? 'var(--danger)' : 'var(--success)'}"></i>
                                    </button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderBusinessSettings() {
    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-building"></i> ព័ត៌មានអាជីវកម្ម</h3>
            </div>
            <div class="card-body">
                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); border-radius: 16px; padding: 30px; color: white; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-home" style="font-size: 36px;"></i>
                        </div>
                        <div>
                            <h2 style="font-family: 'Battambang', cursive; margin-bottom: 4px;">សុខលីផ្ទះជួល</h2>
                            <p style="opacity: 0.8;">ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលឌីជីថល</p>
                        </div>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">ឈ្មោះអាជីវកម្ម</label><p style="font-weight:700;">សុខលីផ្ទះជួល</p></div>
                    <div class="form-group"><label class="form-label">ម្ចាស់</label><p>ចាន់ មករា</p></div>
                    <div class="form-group"><label class="form-label">ទីតាំង</label><p>Domnak Thom 5, Phnom Penh, Cambodia</p></div>
                    <div class="form-group"><label class="form-label">ទូរស័ព្ទ</label><p>023 994 444</p></div>
                    <div class="form-group"><label class="form-label">ធនាគារ</label><p>ACLEDA Bank</p></div>
                    <div class="form-group"><label class="form-label">គណនី KHQR</label><p>ចាន់ មករា</p></div>
                </div>
            </div>
        </div>
    `;
}

function renderSecuritySettings() {
    return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-shield-alt"></i> សុវត្ថិភាព</h3>
            </div>
            <div class="card-body">
                <h4 style="margin-bottom: 16px;">ប្តូរពាក្យសម្ងាត់</h4>
                <form id="passwordForm" style="max-width: 400px;">
                    ${Components.formInput('current_password', 'ពាក្យសម្ងាត់បច្ចុប្បន្ន', 'password', '', true)}
                    ${Components.formInput('new_password', 'ពាក្យសម្ងាត់ថ្មី', 'password', '', true)}
                    ${Components.formInput('confirm_password', 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី', 'password', '', true)}
                    <button type="button" class="btn btn-primary" onclick="changePassword()">
                        <i class="fas fa-key"></i> ប្តូរពាក្យសម្ងាត់
                    </button>
                </form>
                <hr style="margin: 30px 0;">
                <h4 style="margin-bottom: 16px;">ព័ត៌មានសុវត្ថិភាព</h4>
                <div style="background: var(--success-bg); padding: 16px; border-radius: 12px;">
                    <p><i class="fas fa-check-circle" style="color:var(--success); margin-right:8px;"></i> ទិន្នន័យត្រូវបានអ៊ិនគ្រីបដោយ JWT</p>
                    <p style="margin-top:8px;"><i class="fas fa-check-circle" style="color:var(--success); margin-right:8px;"></i> ពាក្យសម្ងាត់ត្រូវបាន hash ដោយ bcrypt</p>
                    <p style="margin-top:8px;"><i class="fas fa-check-circle" style="color:var(--success); margin-right:8px;"></i> វគ្គចូលផុតកំណត់ក្នុង ២៤ម៉ោង</p>
                </div>
            </div>
        </div>
    `;
}

async function saveSetting(key) {
    const input = document.getElementById(`setting_${key}`);
    try {
        await API.updateSetting(key, input.value);
        Components.showToast('រក្សាទុកបានជោគជ័យ', 'success');
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function changePassword() {
    const form = document.getElementById('passwordForm');
    const data = Object.fromEntries(new FormData(form));

    if (data.new_password !== data.confirm_password) {
        Components.showToast('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា', 'error');
        return;
    }

    try {
        await API.changePassword({ current_password: data.current_password, new_password: data.new_password });
        Components.showToast('ប្តូរពាក្យសម្ងាត់បានជោគជ័យ', 'success');
        form.reset();
    } catch (e) { Components.showToast(e.message, 'error'); }
}

function showCreateUserForm() {
    const body = `
        <form id="createUserForm" class="form-grid">
            ${Components.formInput('username', 'ឈ្មោះអ្នកប្រើ', 'text', '', true)}
            ${Components.formInput('password', 'ពាក្យសម្ងាត់', 'password', '', true)}
            ${Components.formInput('full_name', 'ឈ្មោះពេញ', 'text', '', true)}
            ${Components.formSelect('role', 'តួនាទី', [{value:'staff',label:'បុគ្គលិក'},{value:'admin',label:'អ្នកគ្រប់គ្រង'}], 'staff', true)}
            ${Components.formInput('phone', 'ទូរស័ព្ទ', 'tel', '')}
            ${Components.formInput('email', 'អ៊ីមែល', 'email', '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="createUser()"><i class="fas fa-save"></i> បង្កើត</button>
    `;
    Components.showModal('បន្ថែមអ្នកប្រើថ្មី', body, footer);
}

async function createUser() {
    const form = document.getElementById('createUserForm');
    const data = Object.fromEntries(new FormData(form));
    try {
        await API.createUser(data);
        Components.showToast('បង្កើតអ្នកប្រើថ្មីបានជោគជ័យ', 'success');
        closeModal();
        renderSettings();
    } catch (e) { Components.showToast(e.message, 'error'); }
}

async function toggleUserStatus(id, newStatus) {
    try {
        await API.updateUser(id, { is_active: newStatus });
        Components.showToast('ធ្វើបច្ចុប្បន្នភាពបានជោគជ័យ', 'success');
        renderSettings();
    } catch (e) { Components.showToast(e.message, 'error'); }
}
