const http = require('http');

// Get the actual test email we created previously, or just make a new one
const email = `test_node_1741308354924@example.com`; // From the previous registration test

console.log(`\n--- Requesting Password Reset for ${email} ---`);

const data = JSON.stringify({ email });

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/forgot-password',
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
        console.log("Response Status:", res.statusCode);
        console.log("Response Body:", body);
        console.log("\n✅ SUCCESS: Request went through. Check the backend terminal running 'npm run dev:all'.");
        console.log("There should be an Ethereal test email link, but the 6-digit code ITSELF should NOT be printed in the console!");
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
