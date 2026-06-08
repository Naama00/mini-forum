// checkHash.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

(async () => {
  const url = 'mongodb://127.0.0.1:27017';
  const client = await MongoClient.connect(url);
  const db = client.db('forumDB');
  const user = await db.collection('users').findOne({ email: 'admin@gmail.com' }, { projection: { password: 1 } });

  if (!user) {
    console.log('User not found');
    await client.close();
    return;
  }

  const hash = user.password;
  console.log('password (raw, JSON):', JSON.stringify(hash));
  console.log('length:', typeof hash === 'string' ? hash.length : '<not a string>');
  if (typeof hash === 'string') {
    const first = hash.slice(0,5).split('').map(c => c.charCodeAt(0)).join(',');
    const last = hash.slice(-5).split('').map(c => c.charCodeAt(0)).join(',');
    console.log('first 5 char codes:', first);
    console.log('last 5 char codes :', last);
  }
  const testPassword = process.env.CHECK_PASSWORD;
  if (!testPassword) {
    console.log('Set CHECK_PASSWORD env var to test bcrypt comparison');
  } else {
    console.log('bcrypt compare result:', bcrypt.compareSync(testPassword, hash));
  }

  await client.close();
})();