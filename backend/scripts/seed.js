require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = 'admin@oxymedic.local';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
  } else {
    await User.create({ name: 'Admin', email, password: 'admin123', role: 'admin' });
    console.log('✅ Admin created → email: admin@oxymedic.local | password: admin123');
  }
  process.exit(0);
})();
