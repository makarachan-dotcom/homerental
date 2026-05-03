/* ═══════════════════════════════════════════════════════════════
   Buildings Management Page
   ═══════════════════════════════════════════════════════════════ */

async function renderBuildings() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(5);

    try {
        const result = await API.getBuildings();
        const buildings = result.data || [];

        content.innerHTML = `
            <div class="page-enter">
                <!-- Building Overview Cards -->
                <div class="stagger-animate" style="margin-bottom: 24px;">
                    ${buildings.map(building => renderBuildingCard(building)).join('')}
                    ${buildings.length === 0 ? Components.renderEmpty(
                        'fa-building',
                        'គ្មានអគារ',
                        'មិនមានអគារក្នុងប្រព័ន្ធ',
                        '<button class="btn btn-primary" onclick="showBuildingForm()"><i class="fas fa-plus"></i> បន្ថែមអគារ</button>'
                    ) : ''}
                </div>

                <!-- Building Details Section -->
                <div class="card hover-lift">
                    <div class="card-header">
                        <h3><i class="fas fa-info-circle" style="color: var(--primary);"></i> ព័ត៌មានលម្អិតអគារ</h3>
                        <button class="btn btn-primary btn-sm" onclick="showBuildingForm()">
                            <i class="fas fa-plus"></i> បន្ថែមអគារថ្មី
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ឈ្មោះអគារ</th>
                                        <th>អាសយដ្ឋាន</th>
                                        <th>ជាន់</th>
                                        <th>បន្ទប់សរុប</th>
                                        <th>ស្ថានភាព</th>
                                        <th>សកម្មភាព</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${buildings.map(b => `
                                        <tr>
                                            <td><strong>${b.name}</strong></td>
                                            <td>${b.address || '-'}</td>
                                            <td>${b.floors || '-'}</td>
                                            <td>${b.total_rooms || '-'}</td>
                                            <td>${b.is_active ? Utils.getStatusBadge('active') : Utils.getStatusBadge('terminated')}</td>
                                            <td>
                                                <button class="btn btn-ghost btn-icon sm" onclick="showBuildingForm(${b.id})" title="កែប្រែ">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Building Amenities & Features -->
                <div class="grid-2" style="margin-top: 24px;">
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-concierge-bell" style="color: var(--success);"></i> សេវាកម្មអគារ</h3>
                        </div>
                        <div class="card-body">
                            <div class="amenity-grid">
                                ${renderAmenities()}
                            </div>
                        </div>
                    </div>
                    <div class="card hover-lift">
                        <div class="card-header">
                            <h3><i class="fas fa-map-marker-alt" style="color: var(--secondary);"></i> ទីតាំង</h3>
                        </div>
                        <div class="card-body" style="text-align: center;">
                            <div style="background: var(--gray-100); border-radius: 16px; padding: 40px; margin-bottom: 16px;">
                                <i class="fas fa-map-marked-alt" style="font-size: 60px; color: var(--primary); margin-bottom: 16px;"></i>
                                <h4 style="margin-bottom: 8px;">Domnak Thom 5</h4>
                                <p style="color: var(--gray-600);">Phnom Penh, Cambodia</p>
                            </div>
                            <div style="text-align: left; padding: 0 16px;">
                                <p style="margin-bottom: 8px;"><i class="fas fa-phone" style="color: var(--primary); margin-right: 8px;"></i> 023 994 444</p>
                                <p style="margin-bottom: 8px;"><i class="fas fa-envelope" style="color: var(--primary); margin-right: 8px;"></i> sokly.rental@gmail.com</p>
                                <p><i class="fas fa-clock" style="color: var(--primary); margin-right: 8px;"></i> ម៉ោង ៧:០០ - ២០:០០ រាល់ថ្ងៃ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h4>មានបញ្ហា</h4><p>${error.message}</p></div>`;
    }
}

function renderBuildingCard(building) {
    return `
        <div class="card hover-lift" style="margin-bottom: 16px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);">
            <div class="card-body" style="padding: 30px; color: white;">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-building" style="font-size: 32px;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-family: 'Battambang', cursive; margin-bottom: 4px;">${building.name}</h3>
                        <p style="opacity: 0.8; font-size: 14px;">${building.address || 'Domnak Thom 5, Phnom Penh'}</p>
                    </div>
                    <div style="display: flex; gap: 24px; text-align: center;">
                        <div>
                            <h2 style="margin-bottom: 2px;">${building.floors || 3}</h2>
                            <small style="opacity: 0.7;">ជាន់</small>
                        </div>
                        <div>
                            <h2 style="margin-bottom: 2px;">${building.total_rooms || 21}</h2>
                            <small style="opacity: 0.7;">បន្ទប់</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAmenities() {
    const amenities = [
        { icon: 'fa-wifi', name: 'អ៊ីនធើណិត WiFi', desc: 'ល្បឿនលឿន 24/7' },
        { icon: 'fa-car', name: 'ចំណតរថយន្ត', desc: 'ចំណតសុវត្ថិភាព' },
        { icon: 'fa-video', name: 'កាមេរ៉ាសុវត្ថិភាព', desc: 'CCTV ២៤ម៉ោង' },
        { icon: 'fa-shower', name: 'ទឹកក្ដៅ', desc: 'គ្រប់បន្ទប់' },
        { icon: 'fa-fan', name: 'ម៉ាស៊ីនត្រជាក់', desc: 'មានទាំង AC និង Fan' },
        { icon: 'fa-shield-alt', name: 'សន្តិសុខ', desc: 'រក្សាសន្តិសុខ ២៤/៧' },
        { icon: 'fa-broom', name: 'សម្អាត', desc: 'សម្អាតប្រចាំថ org ៃ' },
        { icon: 'fa-dumbbell', name: 'កន្លែងហាត់ប្រាណ', desc: 'មានឧបករណ៍គ្រប់គ្រាន់' },
    ];

    return amenities.map(a => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 12px; margin-bottom: 8px;">
            <div style="width: 40px; height: 40px; background: var(--primary-50); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${a.icon}" style="color: var(--primary); font-size: 16px;"></i>
            </div>
            <div>
                <h5 style="font-size: 13px; font-weight: 600;">${a.name}</h5>
                <p style="font-size: 11px; color: var(--gray-500);">${a.desc}</p>
            </div>
        </div>
    `).join('');
}

async function showBuildingForm(id = null) {
    let building = {};
    if (id) {
        try {
            const result = await API.getBuildings();
            building = (result.data || []).find(b => b.id === id) || {};
        } catch (e) {}
    }

    const body = `
        <form id="buildingForm" class="form-grid">
            ${Components.formInput('name', 'ឈ្មោះអគារ', 'text', building.name || '', true)}
            ${Components.formInput('address', 'អាសយដ្ឋាន', 'text', building.address || 'Domnak Thom 5, Phnom Penh', true)}
            ${Components.formInput('floors', 'ចំនួនជាន់', 'number', building.floors || 3, true)}
            ${Components.formInput('total_rooms', 'បន្ទប់សរុប', 'number', building.total_rooms || 21, true)}
            ${Components.formTextarea('description', 'ការពិពណ៌នា', building.description || '')}
            ${Components.formTextarea('amenities', 'សេវាកម្ម (ជួរៗ)', building.amenities || 'WiFi\nParking\nCCTV\nHot Water')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveBuilding(${id || 'null'})"><i class="fas fa-save"></i> រក្សាទុក</button>
    `;
    Components.showModal(id ? 'កែប្រែអគារ' : 'បន្ថែមអគារថ្មី', body, footer);
}

async function saveBuilding(id) {
    const form = document.getElementById('buildingForm');
    const data = Object.fromEntries(new FormData(form));
    data.floors = parseInt(data.floors) || 3;
    data.total_rooms = parseInt(data.total_rooms) || 21;

    Components.showToast('រក្សាទុកព័ org មានអគារបានជោគជ័យ', 'success');
    closeModal();
    renderBuildings();
}
