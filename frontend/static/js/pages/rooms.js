/* ═══════════════════════════════════════════════════════════════
   Rooms Page
   ═══════════════════════════════════════════════════════════════ */

let roomsState = { page: 1, status: 'all', floor: '', type: '', search: '', viewMode: 'grid' };

async function renderRooms() {
    const content = document.getElementById('contentArea');
    content.innerHTML = Components.renderSkeleton(6);

    try {
        const params = {
            page: roomsState.page,
            per_page: 50,
        };
        if (roomsState.status !== 'all') params.status_filter = roomsState.status;
        if (roomsState.floor) params.floor = roomsState.floor;
        if (roomsState.type) params.room_type = roomsState.type;
        if (roomsState.search) params.search = roomsState.search;

        const [result, stats] = await Promise.all([
            API.getRooms(params),
            API.getRoomStats(),
        ]);

        content.innerHTML = `
            <div class="page-enter">
                <!-- Room Stats -->
                <div class="stats-grid stagger-animate" style="margin-bottom: 24px;">
                    ${Components.renderStatCard('fa-door-open', stats.total || 0, 'បន្ទប់សរុប', 'primary')}
                    ${Components.renderStatCard('fa-check-circle', stats.available || 0, 'ទំនេរ', 'success')}
                    ${Components.renderStatCard('fa-user-check', stats.occupied || 0, 'មានអ្នកជួល', 'warning')}
                    ${Components.renderStatCard('fa-wrench', stats.maintenance || 0, 'កំពុងជួសជុល', 'danger')}
                </div>

                <!-- Toolbar -->
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-door-open"></i> គ្រប់គ្រងបន្ទប់</h3>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-ghost btn-sm ${roomsState.viewMode === 'grid' ? 'active' : ''}"
                                    onclick="roomsState.viewMode='grid'; renderRooms();">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="btn btn-ghost btn-sm ${roomsState.viewMode === 'table' ? 'active' : ''}"
                                    onclick="roomsState.viewMode='table'; renderRooms();">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="showRoomForm()">
                                <i class="fas fa-plus"></i> បន្ថែមបន្ទប់ថ្មី
                            </button>
                        </div>
                    </div>
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--gray-200);">
                        <div class="toolbar" style="margin-bottom: 0;">
                            <div class="toolbar-left">
                                <select class="filter-select" onchange="roomsState.status=this.value; roomsState.page=1; renderRooms();">
                                    <option value="all" ${roomsState.status === 'all' ? 'selected' : ''}>ស្ថានភាពទាំងអស់</option>
                                    <option value="available" ${roomsState.status === 'available' ? 'selected' : ''}>ទំនេរ</option>
                                    <option value="occupied" ${roomsState.status === 'occupied' ? 'selected' : ''}>មានអ្នកជួល</option>
                                    <option value="maintenance" ${roomsState.status === 'maintenance' ? 'selected' : ''}>កំពុងជួសជុល</option>
                                </select>
                                <select class="filter-select" onchange="roomsState.floor=this.value; roomsState.page=1; renderRooms();">
                                    <option value="">ជាន់ទាំងអស់</option>
                                    <option value="1" ${roomsState.floor === '1' ? 'selected' : ''}>ជាន់ ១</option>
                                    <option value="2" ${roomsState.floor === '2' ? 'selected' : ''}>ជាន់ ២</option>
                                    <option value="3" ${roomsState.floor === '3' ? 'selected' : ''}>ជាន់ ៣</option>
                                </select>
                            </div>
                            <div class="toolbar-right">
                                <div class="search-wrapper">
                                    <i class="fas fa-search"></i>
                                    <input type="text" class="search-input" placeholder="ស្វែងរកបន្ទប់..."
                                           value="${roomsState.search}"
                                           oninput="roomsState.search=this.value; debounceRoomSearch();">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${roomsState.viewMode === 'grid' ? renderRoomGrid(result.data) : renderRoomTable(result.data)}
                        ${Components.renderPagination(result.total, result.page, result.per_page, 'goToRoomPage')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>មានបញ្ហា</h4><p>${error.message}</p>
        </div>`;
    }
}

function renderRoomGrid(rooms) {
    if (!rooms || rooms.length === 0) {
        return Components.renderEmpty('fa-door-closed', 'គ្មានបន្ទប់', 'មិនមានបន្ទប់ត្រូវនឹងលក្ខខណ្ឌស្វែងរក');
    }

    return `<div class="room-grid stagger-animate">
        ${rooms.map(room => `
            <div class="room-card ${room.status}" onclick="showRoomDetail(${room.id})">
                <div class="room-number">${room.room_number}</div>
                <div class="room-type">${Utils.getRoomTypeLabel(room.room_type)}</div>
                ${Utils.getStatusBadge(room.status)}
                <div class="room-price">${Utils.formatUSD(room.price_usd)}</div>
                ${room.tenant_name ? `<div class="room-tenant"><i class="fas fa-user"></i> ${room.tenant_name}</div>` : ''}
            </div>
        `).join('')}
    </div>`;
}

function renderRoomTable(rooms) {
    if (!rooms || rooms.length === 0) {
        return Components.renderEmpty('fa-door-closed', 'គ្មានបន្ទប់', 'មិនមានបន្ទប់');
    }

    return `<div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>លេខបន្ទប់</th>
                    <th>ជាន់</th>
                    <th>ប្រភេទ</th>
                    <th>តម្លៃ (USD)</th>
                    <th>តម្លៃ (KHR)</th>
                    <th>ស្ថានភាព</th>
                    <th>អ្នកជួល</th>
                    <th>សកម្មភាព</th>
                </tr>
            </thead>
            <tbody>
                ${rooms.map(room => `
                    <tr>
                        <td><strong>${room.room_number}</strong></td>
                        <td>ជាន់ ${room.floor}</td>
                        <td>${Utils.getRoomTypeLabel(room.room_type)}</td>
                        <td>${Utils.formatUSD(room.price_usd)}</td>
                        <td>${Utils.formatKHR(room.price_khr)}</td>
                        <td>${Utils.getStatusBadge(room.status)}</td>
                        <td>${room.tenant_name || '-'}</td>
                        <td>
                            <button class="btn btn-ghost btn-icon sm" onclick="showRoomDetail(${room.id})" title="មើល">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-ghost btn-icon sm" onclick="showRoomForm(${room.id})" title="កែប្រែ">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
}

const debounceRoomSearch = Utils.debounce(() => {
    roomsState.page = 1;
    renderRooms();
}, 400);

function goToRoomPage(page) {
    roomsState.page = page;
    renderRooms();
}

async function showRoomDetail(roomId) {
    try {
        const room = await API.getRoom(roomId);
        const body = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">លេខបន្ទប់</label>
                    <p style="font-size:18px; font-weight:700;">${room.room_number}</p>
                </div>
                <div class="form-group">
                    <label class="form-label">ស្ថានភាព</label>
                    <p>${Utils.getStatusBadge(room.status)}</p>
                </div>
                <div class="form-group">
                    <label class="form-label">ជាន់</label>
                    <p>ជាន់ ${room.floor}</p>
                </div>
                <div class="form-group">
                    <label class="form-label">ប្រភេទ</label>
                    <p>${Utils.getRoomTypeLabel(room.room_type)}</p>
                </div>
                <div class="form-group">
                    <label class="form-label">តម្លៃ USD</label>
                    <p style="font-weight:700; color:var(--primary);">${Utils.formatUSD(room.price_usd)}/ខែ</p>
                </div>
                <div class="form-group">
                    <label class="form-label">តម្លៃ KHR</label>
                    <p style="font-weight:700; color:var(--secondary);">${Utils.formatKHR(room.price_khr)}/ខែ</p>
                </div>
                <div class="form-group">
                    <label class="form-label">ទំហំ</label>
                    <p>${room.size_sqm || '-'} m²</p>
                </div>
                <div class="form-group">
                    <label class="form-label">អគារ</label>
                    <p>${room.building_name || '-'}</p>
                </div>
                ${room.tenant_name ? `
                <div class="form-group full-width" style="background:var(--success-bg); padding:16px; border-radius:12px;">
                    <label class="form-label" style="color:var(--success);">អ្នកជួលបច្ចុប្បន្ន</label>
                    <p style="font-weight:600;">${room.tenant_name} | ${room.tenant_phone || ''}</p>
                    <p style="font-size:13px; color:var(--gray-600);">កិច្ចសន្យា: ${Utils.formatDateShort(room.contract_start)} - ${Utils.formatDateShort(room.contract_end)}</p>
                </div>
                ` : ''}
            </div>
        `;
        const footer = `
            <button class="btn btn-outline" onclick="closeModal()">បិទ</button>
            <button class="btn btn-primary" onclick="closeModal(); showRoomForm(${room.id})">
                <i class="fas fa-edit"></i> កែប្រែ
            </button>
        `;
        Components.showModal(`បន្ទប់ ${room.room_number}`, body, footer);
    } catch (e) {
        Components.showToast(e.message, 'error');
    }
}

async function showRoomForm(roomId = null) {
    let room = {};
    if (roomId) {
        try { room = await API.getRoom(roomId); } catch (e) { Components.showToast(e.message, 'error'); return; }
    }

    const body = `
        <form id="roomForm" class="form-grid">
            ${Components.formInput('room_number', 'លេខបន្ទប់', 'text', room.room_number || '', true)}
            ${Components.formSelect('floor', 'ជាន់', [
                {value: '1', label: 'ជាន់ ១'}, {value: '2', label: 'ជាន់ ២'}, {value: '3', label: 'ជាន់ ៣'}
            ], room.floor || '1', true)}
            ${Components.formSelect('room_type', 'ប្រភេទ', [
                {value: 'standard', label: 'ស្តង់ដារ'}, {value: 'deluxe', label: 'ឌីឡុក'}, {value: 'suite', label: 'ស្វ៊ីត'}
            ], room.room_type || 'standard', true)}
            ${Components.formInput('size_sqm', 'ទំហំ (m²)', 'number', room.size_sqm || '')}
            ${Components.formInput('price_usd', 'តម្លៃ USD/ខែ', 'number', room.price_usd || '', true)}
            ${Components.formInput('price_khr', 'តម្លៃ KHR/ខែ', 'number', room.price_khr || '', true)}
            ${Components.formInput('deposit_usd', 'ប្រាក់កក់ USD', 'number', room.deposit_usd || '')}
            ${Components.formInput('deposit_khr', 'ប្រាក់កក់ KHR', 'number', room.deposit_khr || '')}
            ${roomId ? Components.formSelect('status', 'ស្ថានភាព', [
                {value: 'available', label: 'ទំនេរ'}, {value: 'occupied', label: 'មានអ្នកជួល'},
                {value: 'maintenance', label: 'កំពុងជួសជុល'}, {value: 'reserved', label: 'កក់រួច'}
            ], room.status) : ''}
            ${Components.formTextarea('amenities', 'សេវាកម្ម', room.amenities || '')}
        </form>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">បោះបង់</button>
        <button class="btn btn-primary" onclick="saveRoom(${roomId || 'null'})">
            <i class="fas fa-save"></i> រក្សាទុក
        </button>
    `;
    Components.showModal(roomId ? 'កែប្រែបន្ទប់' : 'បន្ថែមបន្ទប់ថ្មី', body, footer);
}

async function saveRoom(roomId) {
    const form = document.getElementById('roomForm');
    const data = Object.fromEntries(new FormData(form));
    data.building_id = 1;
    data.floor = parseInt(data.floor);
    data.price_usd = parseFloat(data.price_usd) || 0;
    data.price_khr = parseFloat(data.price_khr) || 0;
    data.deposit_usd = parseFloat(data.deposit_usd) || 0;
    data.deposit_khr = parseFloat(data.deposit_khr) || 0;
    data.size_sqm = parseFloat(data.size_sqm) || null;

    try {
        if (roomId) {
            await API.updateRoom(roomId, data);
            Components.showToast('ធ្វើបច្ចុប្បន្នភាពបន្ទប់បានជោគជ័យ', 'success');
        } else {
            await API.createRoom(data);
            Components.showToast('បង្កើតបន្ទប់ថ្មីបានជោគជ័យ', 'success');
        }
        closeModal();
        renderRooms();
    } catch (e) {
        Components.showToast(e.message, 'error');
    }
}
