/* ═══════════════════════════════════════════════════════════════
   QR Codes Page
   ═══════════════════════════════════════════════════════════════ */

async function renderQRCodes() {
    const content = document.getElementById('contentArea');

    content.innerHTML = `
        <div class="page-enter">
            <!-- Business QR -->
            <div class="grid-2" style="margin-bottom: 24px;">
                <div class="card hover-lift">
                    <div class="card-header">
                        <h3><i class="fas fa-building" style="color: var(--primary);"></i> QR កូដអាជីវកម្ម</h3>
                    </div>
                    <div class="card-body">
                        <div class="qr-display">
                            <img src="${API.getBusinessQR(350)}" alt="Business QR" style="width: 280px; height: 280px;">
                            <h4 style="margin: 16px 0 8px;">សុខលីផ្ទះជួល</h4>
                            <p style="color: var(--gray-500);">Domnak Thom 5, Phnom Penh, Cambodia</p>
                            <div class="qr-actions">
                                <a href="${API.getBusinessQR(600)}" download="sokly-business-qr.png" class="btn btn-primary btn-sm">
                                    <i class="fas fa-download"></i> ទាញយក
                                </a>
                                <button class="btn btn-outline btn-sm" onclick="printQR('${API.getBusinessQR(600)}', 'សុខលីផ្ទះជួល')">
                                    <i class="fas fa-print"></i> បោះពុម្ព
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment QR Info -->
                <div class="card hover-lift">
                    <div class="card-header">
                        <h3><i class="fas fa-money-check" style="color: var(--secondary);"></i> KHQR បង់ប្រាក់</h3>
                    </div>
                    <div class="card-body">
                        <div class="qr-display">
                            <div style="background: var(--primary-50); border-radius: 16px; padding: 30px; display: inline-block; margin-bottom: 16px;">
                                <i class="fas fa-qrcode" style="font-size: 120px; color: var(--primary);"></i>
                            </div>
                            <h4 style="margin-bottom: 8px;">ចាន់ មករា - ACLEDA Bank</h4>
                            <p style="color: var(--gray-500); margin-bottom: 16px;">ទទួលទូទាត់ទាំង រៀល និង ដុល្លារ</p>
                            <div style="background: var(--gray-50); border-radius: 12px; padding: 16px; text-align: left;">
                                <p style="margin-bottom: 8px;"><strong>ធនាគារ:</strong> ACLEDA Bank</p>
                                <p style="margin-bottom: 8px;"><strong>ឈ្មោះគណនី:</strong> ចាន់ មករា</p>
                                <p><strong>រូបិយប័ណ្ណ:</strong> USD / KHR</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tenant QR Generator -->
            <div class="card hover-lift" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-user-tag" style="color: var(--success);"></i> បង្កើត QR កូដអ្នកជួល</h3>
                </div>
                <div class="card-body">
                    <p style="margin-bottom: 16px; color: var(--gray-600);">ជ្រើសរើសអ្នកជួលដើម្បីបង្កើត QR កូដសម្រាប់មើលព័ត៌មាន</p>
                    <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label class="form-label">ជ្រើសរើសអ្នកជួល</label>
                            <select id="qrTenantSelect" class="form-control" onchange="generateTenantQR()">
                                <option value="">-- ជ្រើសរើសអ្នកជួល --</option>
                            </select>
                        </div>
                        <button class="btn btn-success" onclick="generateTenantQR()">
                            <i class="fas fa-qrcode"></i> បង្កើត QR
                        </button>
                    </div>
                    <div id="tenantQRResult" style="margin-top: 24px;"></div>
                </div>
            </div>

            <!-- Room QR Generator -->
            <div class="card hover-lift">
                <div class="card-header">
                    <h3><i class="fas fa-door-open" style="color: var(--info);"></i> បង្កើត QR កូដបន្ទប់</h3>
                </div>
                <div class="card-body">
                    <p style="margin-bottom: 16px; color: var(--gray-600);">ជ្រើសរើសបន្ទប់ដើម្បីបង្កើត QR កូដសម្រាប់មើលព័ត៌មាន</p>
                    <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label class="form-label">ជ្រើសរើសបន្ទប់</label>
                            <select id="qrRoomSelect" class="form-control" onchange="generateRoomQR()">
                                <option value="">-- ជ្រើសរើសបន្ទប់ --</option>
                            </select>
                        </div>
                        <button class="btn btn-info" onclick="generateRoomQR()" style="background:var(--info); color:white;">
                            <i class="fas fa-qrcode"></i> បង្កើត QR
                        </button>
                    </div>
                    <div id="roomQRResult" style="margin-top: 24px;"></div>
                </div>
            </div>
        </div>
    `;

    // Load tenants and rooms
    loadQRSelects();
}

async function loadQRSelects() {
    try {
        const [tenants, rooms] = await Promise.all([
            API.getTenants({ per_page: 100, status_filter: 'active' }),
            API.getRooms({ per_page: 100 }),
        ]);

        const tenantSel = document.getElementById('qrTenantSelect');
        const roomSel = document.getElementById('qrRoomSelect');

        if (tenantSel && tenants.data) {
            tenants.data.forEach(t => {
                tenantSel.innerHTML += `<option value="${t.id}">${t.first_name} ${t.last_name} (${t.phone})</option>`;
            });
        }

        if (roomSel && rooms.data) {
            rooms.data.forEach(r => {
                roomSel.innerHTML += `<option value="${r.id}">បន្ទប់ ${r.room_number} - ជាន់ ${r.floor}</option>`;
            });
        }
    } catch (e) {}
}

function generateTenantQR() {
    const select = document.getElementById('qrTenantSelect');
    const result = document.getElementById('tenantQRResult');
    if (!select.value) { result.innerHTML = ''; return; }

    const qrUrl = API.getTenantQR(select.value, 350);
    result.innerHTML = `
        <div class="qr-display scale-in">
            <img src="${qrUrl}" alt="Tenant QR" style="width: 250px; height: 250px;">
            <div class="qr-actions">
                <a href="${API.getTenantQR(select.value, 600)}" download="tenant-qr.png" class="btn btn-success btn-sm">
                    <i class="fas fa-download"></i> ទាញយក
                </a>
                <button class="btn btn-outline btn-sm" onclick="printQR('${API.getTenantQR(select.value, 600)}', 'អ្នកជួល QR')">
                    <i class="fas fa-print"></i> បោះពុម្ព
                </button>
            </div>
        </div>
    `;
}

function generateRoomQR() {
    const select = document.getElementById('qrRoomSelect');
    const result = document.getElementById('roomQRResult');
    if (!select.value) { result.innerHTML = ''; return; }

    const qrUrl = API.getRoomQR(select.value, 350);
    result.innerHTML = `
        <div class="qr-display scale-in">
            <img src="${qrUrl}" alt="Room QR" style="width: 250px; height: 250px;">
            <div class="qr-actions">
                <a href="${API.getRoomQR(select.value, 600)}" download="room-qr.png" class="btn btn-primary btn-sm">
                    <i class="fas fa-download"></i> ទាញយក
                </a>
                <button class="btn btn-outline btn-sm" onclick="printQR('${API.getRoomQR(select.value, 600)}', 'បន្ទប់ QR')">
                    <i class="fas fa-print"></i> បោះពុម្ព
                </button>
            </div>
        </div>
    `;
}

function printQR(imgUrl, title) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head><title>${title}</title></head>
        <body style="text-align:center; padding:40px; font-family: sans-serif;">
            <h2>${title}</h2>
            <h3>សុខលីផ្ទះជួល</h3>
            <img src="${imgUrl}" style="width:400px; height:400px; margin:20px auto;">
            <p>Domnak Thom 5, Phnom Penh, Cambodia</p>
            <script>setTimeout(() => window.print(), 500);<\/script>
        </body>
        </html>
    `);
}
