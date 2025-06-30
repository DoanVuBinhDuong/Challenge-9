const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const adminUser = {
    email: 'admin@example.com',
    password: 'admin123'
};

const normalUser = {
    email: 'user@example.com',
    password: 'user123'
};

let adminToken = '';
let userToken = '';

// Helper function để test API với token
async function testAPI(endpoint, token, description) {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
        console.log(`✅ ${description}: SUCCESS (${response.status})`);
        console.log(`   Response:`, response.data);
    } catch (error) {
        console.log(`❌ ${description}: FAILED (${error.response?.status || 'Network Error'})`);
        console.log(`   Error:`, error.response?.data || error.message);
    }
    console.log('---');
}

// Helper function để login và lấy token
async function loginAndGetToken(userData, userType) {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, userData);
        const token = response.data.data.token;
        console.log(`🔑 ${userType} login successful, token: ${token.substring(0, 20)}...`);
        return token;
    } catch (error) {
        console.log(`❌ ${userType} login failed:`, error.response?.data || error.message);
        return null;
    }
}

async function testAuthorization() {
    console.log('🚀 Testing Authorization System\n');

    // 1. Login để lấy token
    console.log('1. Logging in users...');
    adminToken = await loginAndGetToken(adminUser, 'Admin');
    userToken = await loginAndGetToken(normalUser, 'User');
    console.log('');

    if (!adminToken || !userToken) {
        console.log('❌ Cannot proceed without valid tokens');
        return;
    }

    // 2. Test các endpoint với quyền khác nhau
    console.log('2. Testing endpoints with different permissions...\n');

    // Test endpoint chỉ dành cho ADMIN
    console.log('🔒 Testing ADMIN-only endpoints:');
    await testAPI('/api/users', adminToken, 'Admin accessing /api/users (should succeed)');
    await testAPI('/api/users', userToken, 'User accessing /api/users (should fail with 403)');
    await testAPI('/api/users', '', 'No token accessing /api/users (should fail with 401)');

    // Test endpoint cho cả USER và ADMIN
    console.log('👥 Testing USER/ADMIN endpoints:');
    await testAPI('/api/users/profile', adminToken, 'Admin accessing /api/users/profile (should succeed)');
    await testAPI('/api/users/profile', userToken, 'User accessing /api/users/profile (should succeed)');
    await testAPI('/api/users/profile', '', 'No token accessing /api/users/profile (should fail with 401)');

    // Test endpoint public (không cần auth)
    console.log('🌐 Testing public endpoints:');
    await testAPI('/health', '', 'No token accessing /health (should succeed)');
    await testAPI('/test-db', '', 'No token accessing /test-db (should succeed)');

    // Test với token không hợp lệ
    console.log('🚫 Testing with invalid token:');
    await testAPI('/api/users/profile', 'invalid-token', 'Invalid token accessing /api/users/profile (should fail with 403)');

    console.log('✅ Authorization testing completed!');
}

// Chạy test
testAuthorization().catch(console.error); 