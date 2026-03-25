import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';

async function testRegistration() {
    console.log('--- Testing Registration ---');
    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `testuser${randomSuffix}@example.com`;
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Test',
                last_name: 'User',
                email: email,
                phone: '0555555555',
                password: 'password123',
                role: 'owner' // This should be ignored by the backend now
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Registration successful. Assigned role: ${data.user.role} (Should be 'customer')`);
            if (data.user.role !== 'customer') {
                console.error(`❌ Registration security flaw! Role was set to ${data.user.role} instead of 'customer'`);
                return null;
            }
            return { email, password: 'password123', token: data.token };
        } else {
            console.error('❌ Registration failed:', data);
            return null;
        }
    } catch (err) {
        console.error('❌ Registration request failed:', err);
        return null;
    }
}

async function testLogin(email: string, password: string) {
    console.log('\n--- Testing Login ---');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('✅ Login successful');
            return data.token;
        } else {
            console.error('❌ Login failed:', data);
            return null;
        }
    } catch (err) {
        console.error('❌ Login request failed:', err);
        return null;
    }
}

async function testProtectedRoutes(token: string) {
    console.log('\n--- Testing Protected Routes (Customer) ---');
    // Test a customer route (my orders)
    try {
        const response = await fetch(`${API_URL}/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            console.log('✅ Access to /orders/my successful');
        } else {
            console.error('❌ Access to /orders/my failed:', await response.json());
        }
    } catch (err) {
        console.error('❌ Request to /orders/my failed:', err);
    }

    // Test an owner route (should be forbidden)
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 403) {
            console.log('✅ Access to owner route /orders correctly forbidden (403)');
        } else {
            console.error(`❌ Security flaw! Access to owner route /orders returned status ${response.status}`, await response.text());
        }
    } catch (err) {
        console.error('❌ Request to /orders failed:', err);
    }
}

async function runTests() {
    console.log('Starting Backend Verification tests...\n');
    let healthDetails = await fetch(`${API_URL}/health`).then(r => r.json()).catch(e => null);
    if (!healthDetails) {
        console.error('❌ Server is not reachable at /api/health');
        return;
    } else {
        console.log('✅ Server health status check: OK');
    }

    const credentials = await testRegistration();
    if (credentials) {
        const token = await testLogin(credentials.email, credentials.password);
        if (token) {
            await testProtectedRoutes(token);

            // Test CORS
            try {
                const corsResponse = await fetch(`${API_URL}/health`, {
                    method: 'OPTIONS',
                    headers: {
                        'Origin': 'https://random-malicious-site.com',
                        'Access-Control-Request-Method': 'GET'
                    }
                });
                const allowedOrigin = corsResponse.headers.get('access-control-allow-origin');

                console.log('\n--- Testing CORS ---');
                if (allowedOrigin === 'https://random-malicious-site.com' || allowedOrigin === '*') {
                    console.error(`❌ CORS is insecure! Allowed origin: ${allowedOrigin}`);
                } else {
                    console.log(`✅ CORS is secured. Header access-control-allow-origin: ${allowedOrigin}`);
                }

            } catch (err) {
                console.error('❌ CORS test failed:', err);
            }
        }
    }
    console.log('\nAll tests finished.');
}

runTests();
