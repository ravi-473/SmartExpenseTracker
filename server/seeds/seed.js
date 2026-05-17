require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');

const MONGO = process.env.MONGO_URI;

async function seed() {
  if (!MONGO) {
    console.error('MONGO_URI missing in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO);
  console.log('Connected to MongoDB for seeding');

  // Remove existing test data (CAREFUL)
  await Expense.deleteMany({});
  await User.deleteMany({});

  // Create a demo user
  const demoUser = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    currency: 'INR',
    monthlyBudget: 30000,
  });

  const expenses = [
    { title: 'Grocery shopping', amount: 1200, type: 'expense', category: 'Groceries' },
    { title: 'Salary', amount: 60000, type: 'income', category: 'Salary & Income' },
    { title: 'Dinner out', amount: 800, type: 'expense', category: 'Food & Dining' },
    { title: 'Internet bill', amount: 999, type: 'expense', category: 'Utilities & Bills' },
    { title: 'Fuel', amount: 1500, type: 'expense', category: 'Fuel' },
  ];

  for (const e of expenses) {
    await Expense.create({ ...e, user: demoUser._id, date: new Date() });
  }

  console.log('Seeding complete. Demo user:', demoUser.email, 'password: password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
