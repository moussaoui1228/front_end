const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('--- USERS IN DB ---');
        users.forEach(u => console.log(`- ${u.email} (${u.role})` || 'No Email'));
        console.log('-------------------');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
