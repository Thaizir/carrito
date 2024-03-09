const mySQL = require('./connection');
const { User } = require('../models/models')
const { hashPassword, checkPass, generateAccessToken } = require('../domain/auth');


async function createUser(userData) {
  if (!userData || !userData.email || !userData.password) {
    throw new Error('No se pueden crear usuarios sin email o password');

  } else {
    let [usedEmail] = await (await mySQL.connectDataBase()).execute(
      'SELECT email FROM users WHERE email = ?', [userData.email]);
    if (usedEmail.length > 0) {
      throw new Error('El email ya existe');
    } else {
      let hashedPass = await hashPassword(userData.password);
      const user = new User(userData.name, userData.email, hashedPass);
      const savedUser = await (await mySQL.connectDataBase()).execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [user.name, user.email, user.password]);
      return savedUser;
    }
  }
}

async function getUsers() {
  const [users] = await (await mySQL.connectDataBase()).execute(
    'SELECT * from users');
  console.log(users);
  if (users.length === 0) {
    throw new Error('No hay usuarios registrados');
  }
  return users;
}

async function getUsersByEmail(userEmail) {
  const [user] = await (await mySQL.connectDataBase()).execute('SELECT * FROM users WHERE email = ?', [userEmail]);
  if (user.length === 0) {
    throw new Error('Usuario no encontrado');
  }
  return user;
}

async function authenticateUser(email, password) {
  const user = await getUsersByEmail(email);
  if (user && user.length > 0) {
    await checkPass(user[0].password, password);
    return generateAccessToken({ "user": user[0].email });
  } else {
    throw new Error('Usuario no encontrado');
  }
}

async function updateUserOders(userEmail, orders) {
  const updatedUser = await (await mySQL.connectDataBase()).execute(
    'UPDATE users SET orders = ? WHERE email = ?', [orders, userEmail]
  )
}


module.exports = {
  createUser,
  getUsers,
  authenticateUser,
  getUsersByEmail,
  updateUserOders
}