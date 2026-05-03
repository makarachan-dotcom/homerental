/* ═══════════════════════════════════════════════════════════════
   Help & About Page - System Information and User Guide
   ═══════════════════════════════════════════════════════════════ */

function renderHelp() {
    const content = document.getElementById('contentArea');

    content.innerHTML = `
        <div class="page-enter">
            <!-- Hero Banner -->
            <div class="card hover-lift" style="margin-bottom: 24px;">
                <div class="card-body" style="padding: 0;">
                    <div style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5c6bc0 100%); padding: 48px 40px; border-radius: 16px 16px 0 0; text-align: center; color: white;">
                        <div style="width: 90px; height: 90px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; backdrop-filter: blur(10px);">
                            <i class="fas fa-home" style="font-size: 40px;"></i>
                        </div>
                        <h1 style="font-family: 'Battambang', cursive; font-size: 28px; margin-bottom: 8px;">
                            ${HELP_CONFIG.appName}
                        </h1>
                        <p style="opacity: 0.9; font-size: 16px; margin-bottom: 4px;">
                            ${HELP_CONFIG.tagline}
                        </p>
                        <p style="opacity: 0.6; font-size: 13px;">
                            ${HELP_CONFIG.version} | ${HELP_CONFIG.edition}
                        </p>
                    </div>
                    <div style="padding: 32px 40px;">
                        <p style="font-size: 15px; line-height: 1.8; color: var(--gray-700);">
                            ${HELP_CONFIG.description}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Feature Grid -->
            <div class="card hover-lift" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-star"></i> មុខងារសំខាន់ៗ</h3>
                </div>
                <div class="card-body">
                    <div class="help-feature-grid">
                        ${renderFeatureCards()}
                    </div>
                </div>
            </div>

            <!-- Two column layout -->
            <div class="grid-2" style="margin-bottom: 24px;">
                <!-- Keyboard Shortcuts -->
                <div class="card hover-lift">
                    <div class="card-header">
                        <h3><i class="fas fa-keyboard"></i> ផ្លូវកាត់ក្តារចុច</h3>
                    </div>
                    <div class="card-body">
                        ${renderKeyboardShortcuts()}
                    </div>
                </div>

                <!-- System Info -->
                <div class="card hover-lift">
                    <div class="card-header">
                        <h3><i class="fas fa-server"></i> ព័ត៌មានប្រព័ន្ធ</h3>
                    </div>
                    <div class="card-body">
                        ${renderSystemInfo()}
                    </div>
                </div>
            </div>

            <!-- FAQ Section -->
            <div class="card hover-lift" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-question-circle"></i> សំណួរដែលសួរញឹកញាប់</h3>
                </div>
                <div class="card-body">
                    ${renderFAQSection()}
                </div>
            </div>

            <!-- Contact & Support -->
            <div class="card hover-lift" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3><i class="fas fa-headset"></i> ជំនួយ និងទំនាក់ទំនង</h3>
                </div>
                <div class="card-body">
                    <div class="help-contact-grid">
                        ${renderContactCards()}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 24px; color: var(--gray-500); font-size: 13px;">
                <p>&copy; ${new Date().getFullYear()} ${HELP_CONFIG.appName}</p>
                <p>${HELP_CONFIG.location}</p>
            </div>
        </div>
    `;
}

const HELP_CONFIG = {
    appName: 'សុខលីផ្ទះជួល',
    tagline: 'ប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលឌីជីថល',
    version: 'v2.0.0',
    edition: 'Premium Edition',
    location: 'Domnak Thom 5, Phnom Penh, Cambodia',
    owner: 'ចាន់ មករា',
    description: 'សុខលីផ្ទះជួល ជាប្រព័ន្ធគ្រប់គ្រងផ្ទះជួលទំនើបដែលរចនាឡើង ដើម្បីជួយម្ចាស់អចលនទ្រព្យក្នុងការគ្រប់គ្រងអ្នកជួល បន្ទប់ កិច្ចសន្យា និងការបង់ប្រាក់ ដោយស្វ័យប្រវត្តិកម្ម និងសុវត្ថិភាពខ្ពស់។',
};

const HELP_FEATURES = [
    { icon: 'fa-building', title: 'គ្រប់គ្រងអគារ', desc: 'បន្ថែម កែប្រែ និងតាមដានអគារ ជាន់ និងបន្ទប់ទាំងអស់', color: '#1a237e' },
    { icon: 'fa-users', title: 'គ្រប់គ្រងអ្នកជួល', desc: 'រក្សាទុកព័ត៌មានអ្នកជួល អត្តសញ្ញាណប័ណ្ណ និងទំនាក់ទំនង', color: '#00695c' },
    { icon: 'fa-file-contract', title: 'កិច្ចសន្យា', desc: 'បង្កើត និងគ្រប់គ្រងកិច្ចសន្យាជួល ជាមួយការរំលឹកស្វ័យប្រវត្តិ', color: '#e65100' },
    { icon: 'fa-money-bill-wave', title: 'ការបង់ប្រាក់', desc: 'កត់ត្រាការបង់ប្រាក់ជា USD និង KHR ជាមួយ KHQR', color: '#2e7d32' },
    { icon: 'fa-bolt', title: 'វិក័យប័ត្រសេវា', desc: 'គ្រប់គ្រងវិក័យប័ត្រ ភ្លើង ទឹក និងអ៊ីនធើណិត', color: '#f57f17' },
    { icon: 'fa-tools', title: 'ថែទាំជួសជុល', desc: 'សំណើថែទាំជាមួយអាទិភាព និងការតាមដានស្ថានភាព', color: '#6a1b9a' },
    { icon: 'fa-qrcode', title: 'QR កូដ', desc: 'បង្កើត QR កូដសម្រាប់អ្នកជួល បន្ទប់ និង KHQR បង់ប្រាក់', color: '#00838f' },
    { icon: 'fa-chart-line', title: 'របាយការណ៍', desc: 'វិភាគប្រាក់ចំណូល អត្រាកាន់កាប់ និងនាំចេញ CSV', color: '#c62828' },
    { icon: 'fa-bell', title: 'ការជូនដំណឹង', desc: 'ការរំលឹកកិច្ចសន្យាផុតកំណត់ និងការបង់ប្រាក់យឺត', color: '#ff6f00' },
    { icon: 'fa-shield-alt', title: 'សុវត្ថិភាព', desc: 'ការផ្ទៀងផ្ទាត់ JWT ការអ៊ិនគ្រីប និងការគ្រប់គ្រងតួនាទី', color: '#37474f' },
    { icon: 'fa-wallet', title: 'ចំណាយ', desc: 'កត់ត្រា និងវិភាគចំណាយប្រតិបត្តិការអចលនទ្រព្យ', color: '#4527a0' },
    { icon: 'fa-mobile-alt', title: 'ឆ្លើយតប', desc: 'រចនាឡើងសម្រាប់ទូរសព្ទ ថេប្លេត និងកុំព្យូទ័រ', color: '#0d47a1' },
];

const HELP_SHORTCUTS = [
    { keys: 'Ctrl + K', action: 'បើកប្រអប់ស្វែងរក' },
    { keys: 'Ctrl + 1', action: 'ទៅផ្ទាំងគ្រប់គ្រង' },
    { keys: 'Ctrl + 2', action: 'ទៅគ្រប់គ្រងបន្ទប់' },
    { keys: 'Ctrl + 3', action: 'ទៅគ្រប់គ្រងអ្នកជួល' },
    { keys: 'Ctrl + 4', action: 'ទៅកិច្ចសន្យា' },
    { keys: 'Ctrl + 5', action: 'ទៅការបង់ប្រាក់' },
    { keys: 'Ctrl + Q', action: 'ទៅ QR កូដ' },
    { keys: 'Esc', action: 'បិទ Modal/Popup' },
];

const HELP_FAQ = [
    {
        q: 'តើខ្ញុំអាចបន្ថែមអ្នកជួលថ្មីយ៉ាងដូចម្តេច?',
        a: 'ចូលទៅទំព័រ "អ្នកជួល" ហើយចុចប៊ូតុង "បន្ថែមអ្នកជួលថ្មី"។ បំពេញព័ត៌មានចាំបាច់ រួចចុច "រក្សាទុក"។',
    },
    {
        q: 'តើខ្ញុំអាចបង្កើតកិច្ចសន្យាជួលយ៉ាងដូចម្តេច?',
        a: 'ចូលទៅទំព័រ "កិច្ចសន្យា" ហើយចុច "បង្កើតកិច្ចសន្យាថ្មី"។ ជ្រើសរើសអ្នកជួល បន្ទប់ និងកំណត់រយៈពេលកិច្ចសន្យា រួចរក្សាទុក។',
    },
    {
        q: 'តើ QR កូដសម្រាប់អ្វី?',
        a: 'QR កូដមានពីរប្រភេទ: (១) QR កូដព័ត៌មានអ្នកជួល/បន្ទប់ សម្រាប់ស្កេនមើលព័ត៌មាន និង (២) KHQR សម្រាប់ស្កេនបង់ប្រាក់ជា USD ឬ KHR។',
    },
    {
        q: 'តើអត្រាប្តូរប្រាក់គណនាយ៉ាងដូចម្តេច?',
        a: 'អត្រាប្តូរប្រាក់ 1 USD = 4,100 KHR។ អ្នកអាចកែប្រែអត្រានេះក្នុងទំព័រ "ការកំណត់"។',
    },
    {
        q: 'តើខ្ញុំអាចនាំចេញរបាយការណ៍យ៉ាងដូចម្តេច?',
        a: 'ចូលទៅទំព័រ "របាយការណ៍" ជ្រើសរើសប្រភេទរបាយការណ៍ រួចចុចប៊ូតុង "នាំចេញ CSV" ដើម្បីទាញយកជាឯកសារ។',
    },
    {
        q: 'តើប្រព័ន្ធរក្សាសុវត្ថិភាពទិន្នន័យយ៉ាងដូចម្តេច?',
        a: 'ប្រព័ន្ធប្រើការផ្ទៀងផ្ទាត់ JWT, ពាក្យសម្ងាត់ bcrypt hash, និង HTTPS សម្រាប់ការភ្ជាប់ដែលមានសុវត្ថិភាព។ តួនាទីអ្នកប្រើប្រាស់ត្រូវបានគ្រប់គ្រងដោយម្ចាស់ប្រព័ន្ធ។',
    },
    {
        q: 'តើអ្នកប្រើប្រាស់ Admin និង Staff ខុសគ្នាយ៉ាងដូចម្តេច?',
        a: 'Admin មានសិទ្ធិពេញលេញក្នុងការគ្រប់គ្រងអ្នកប្រើប្រាស់ ការកំណត់ប្រព័ន្ធ និងទិន្នន័យទាំងអស់។ Staff មានសិទ្ធិកំណត់ ដូចជាមើល និងកែប្រែទិន្នន័យ ប៉ុន្តែមិនអាចគ្រប់គ្រងអ្នកប្រើប្រាស់បាន។',
    },
    {
        q: 'តើខ្ញុំអាចកែប្រែពាក្យសម្ងាត់របស់ខ្ញុំយ៉ាងដូចម្តេច?',
        a: 'ចូលទៅទំព័រ "ការកំណត់" រួចចុចលើផ្នែក "កែប្រែពាក្យសម្ងាត់"។ វាយពាក្យសម្ងាត់ចាស់ និងពាក្យសម្ងាត់ថ្មី រួចចុចរក្សាទុក។',
    },
];

const HELP_CONTACTS = [
    { icon: 'fa-map-marker-alt', title: 'អាសយដ្ឋាន', value: 'Domnak Thom 5, Phnom Penh, Cambodia', color: '#c62828' },
    { icon: 'fa-phone', title: 'ទូរសព្ទ', value: '+855 12 345 678', color: '#2e7d32' },
    { icon: 'fa-envelope', title: 'អ៊ីមែល', value: 'info@soklyrental.com', color: '#1565c0' },
    { icon: 'fa-clock', title: 'ម៉ោងធ្វើការ', value: 'ច័ន្ទ - សៅរ៍: 8:00 - 17:00', color: '#e65100' },
];

const HELP_SYSTEM_INFO = [
    { label: 'កំណែ', value: 'v2.0.0 Premium' },
    { label: 'ម៉ាស៊ីនមេ', value: 'FastAPI + Python 3.11' },
    { label: 'មូលដ្ឋានទិន្នន័យ', value: 'SQLite (aiosqlite)' },
    { label: 'ការអ៊ិនគ្រីប', value: 'JWT + bcrypt' },
    { label: 'រូបិយប័ណ្ណ', value: 'USD / KHR' },
    { label: 'អត្រាប្តូរប្រាក់', value: '1 USD = 4,100 KHR' },
    { label: 'ភាសា', value: 'ខ្មែរ (Khmer)' },
    { label: 'បញ្ជាក់ការបង់ប្រាក់', value: 'KHQR - ACLEDA Bank' },
];

function renderFeatureCards() {
    return HELP_FEATURES.map(f => `
        <div class="help-feature-item" style="border-left: 4px solid ${f.color};">
            <div class="help-feature-icon" style="background: ${f.color}15; color: ${f.color};">
                <i class="fas ${f.icon}"></i>
            </div>
            <div class="help-feature-text">
                <strong>${f.title}</strong>
                <span>${f.desc}</span>
            </div>
        </div>
    `).join('');
}

function renderKeyboardShortcuts() {
    return `<div class="help-shortcut-list">
        ${HELP_SHORTCUTS.map(s => `
            <div class="help-shortcut-item">
                <kbd>${s.keys}</kbd>
                <span>${s.action}</span>
            </div>
        `).join('')}
    </div>`;
}

function renderSystemInfo() {
    return `<div class="help-sysinfo-list">
        ${HELP_SYSTEM_INFO.map(s => `
            <div class="help-sysinfo-item">
                <span class="help-sysinfo-label">${s.label}</span>
                <span class="help-sysinfo-value">${s.value}</span>
            </div>
        `).join('')}
    </div>`;
}

function renderFAQSection() {
    return `<div class="help-faq-list">
        ${HELP_FAQ.map((faq, i) => `
            <div class="help-faq-item" onclick="toggleFAQ(this)">
                <div class="help-faq-question">
                    <span>${i + 1}. ${faq.q}</span>
                    <i class="fas fa-chevron-down help-faq-arrow"></i>
                </div>
                <div class="help-faq-answer">
                    <p>${faq.a}</p>
                </div>
            </div>
        `).join('')}
    </div>`;
}

function renderContactCards() {
    return HELP_CONTACTS.map(c => `
        <div class="help-contact-item">
            <div class="help-contact-icon" style="background: ${c.color}15; color: ${c.color};">
                <i class="fas ${c.icon}"></i>
            </div>
            <div class="help-contact-text">
                <strong>${c.title}</strong>
                <span>${c.value}</span>
            </div>
        </div>
    `).join('');
}

function toggleFAQ(element) {
    const isOpen = element.classList.contains('open');
    document.querySelectorAll('.help-faq-item.open').forEach(el => {
        el.classList.remove('open');
    });
    if (!isOpen) {
        element.classList.add('open');
    }
}
