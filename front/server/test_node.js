const http = require('http');

const data = JSON.stringify({
    first_name: 'Test',
    last_name: 'User',
    email: `test_node_${Date.now()}@example.com`,
    phone: '0555555555',
    password: 'password123',
    role: 'owner'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        const parsed = JSON.parse(body);
        console.log("Registered User Role:", parsed.user.role);
        if (parsed.user.role === 'customer') {
            console.log("✅ SUCCESS: Role successfully limited to customer despite request asking for owner.");
        } else {
            console.error("❌ FAILURE: Role was not limited to customer.");
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
