// Usage: node hash-password.js
// This script will prompt you for a password and print its bcrypt hash.

import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash: ', async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Bcrypt hash:', hash);
  rl.close();
});
