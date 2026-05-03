/* ═══════════════════════════════════════════════════════════════
   API Client - HTTP Request Handler
   ═══════════════════════════════════════════════════════════════ */

const API = {
    baseUrl: '/api',

    getToken() {
        return localStorage.getItem('sokly_token');
    },

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    },

    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method,
            headers: this.getHeaders(),
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                localStorage.removeItem('sokly_token');
                localStorage.removeItem('sokly_user');
                window.location.href = '/login';
                return null;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'មានបញ្ហាក្នុងការដំណើរការ');
            }

            return result;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ');
            }
            throw error;
        }
    },

    get(endpoint) { return this.request('GET', endpoint); },
    post(endpoint, data) { return this.request('POST', endpoint, data); },
    put(endpoint, data) { return this.request('PUT', endpoint, data); },
    delete(endpoint) { return this.request('DELETE', endpoint); },

    // Auth
    login(username, password) {
        return this.post('/auth/login', { username, password });
    },

    getMe() { return this.get('/auth/me'); },

    changePassword(data) {
        return this.post('/auth/change-password', data);
    },

    // Dashboard
    getDashboardStats() { return this.get('/dashboard/stats'); },
    getRevenueChart(months = 6) { return this.get(`/dashboard/revenue-chart?months=${months}`); },
    getRecentActivity(limit = 10) { return this.get(`/dashboard/recent-activity?limit=${limit}`); },
    getOccupancy() { return this.get('/dashboard/occupancy'); },

    // Rooms
    getRooms(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/rooms?${query}`);
    },
    getRoomStats() { return this.get('/rooms/stats'); },
    getRoom(id) { return this.get(`/rooms/${id}`); },
    createRoom(data) { return this.post('/rooms', data); },
    updateRoom(id, data) { return this.put(`/rooms/${id}`, data); },
    deleteRoom(id) { return this.delete(`/rooms/${id}`); },

    // Tenants
    getTenants(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/tenants?${query}`);
    },
    getTenant(id) { return this.get(`/tenants/${id}`); },
    createTenant(data) { return this.post('/tenants', data); },
    updateTenant(id, data) { return this.put(`/tenants/${id}`, data); },
    deleteTenant(id) { return this.delete(`/tenants/${id}`); },

    // Contracts
    getContracts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/contracts?${query}`);
    },
    getContract(id) { return this.get(`/contracts/${id}`); },
    createContract(data) { return this.post('/contracts', data); },
    updateContract(id, data) { return this.put(`/contracts/${id}`, data); },

    // Payments
    getPayments(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/payments?${query}`);
    },
    getPaymentSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/payments/summary?${query}`);
    },
    getPayment(id) { return this.get(`/payments/${id}`); },
    createPayment(data) { return this.post('/payments', data); },
    updatePayment(id, data) { return this.put(`/payments/${id}`, data); },

    // Utilities
    getUtilities(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/utilities?${query}`);
    },
    createUtility(data) { return this.post('/utilities', data); },

    // Maintenance
    getMaintenance(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/maintenance?${query}`);
    },
    createMaintenance(data) { return this.post('/maintenance', data); },
    updateMaintenance(id, data) { return this.put(`/maintenance/${id}`, data); },

    // Expenses
    getExpenses(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/expenses?${query}`);
    },
    getExpenseSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/expenses/summary?${query}`);
    },
    createExpense(data) { return this.post('/expenses', data); },
    updateExpense(id, data) { return this.put(`/expenses/${id}`, data); },
    deleteExpense(id) { return this.delete(`/expenses/${id}`); },

    // QR Codes
    getTenantQR(id, size = 300) { return `/api/qr/tenant/${id}?size=${size}`; },
    getRoomQR(id, size = 300) { return `/api/qr/room/${id}?size=${size}`; },
    getPaymentQR(contractId, amount, currency) {
        return `/api/qr/payment/${contractId}?amount=${amount}&currency=${currency}`;
    },
    getBusinessQR(size = 400) { return `/api/qr/business?size=${size}`; },

    // Settings
    getSettings() { return this.get('/settings'); },
    updateSetting(key, value) { return this.put(`/settings/${key}`, { value }); },
    getUsers() { return this.get('/settings/users'); },
    createUser(data) { return this.post('/settings/users', data); },
    updateUser(id, data) { return this.put(`/settings/users/${id}`, data); },
    getBuildings() { return this.get('/settings/buildings'); },
};
