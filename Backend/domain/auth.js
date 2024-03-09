const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = "49efe9d4fad425ca754ed342752be6d79850c46feba6f1e6eb96af7925dc5274";

async function hashPassword(password) {
  return await bcryptjs.hash(password, 10);
}

function generateAccessToken(user) {
  return jwt.sign(user, SECRET, { expiresIn: '1000m' });
}

function validateToken(req, res, next) {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    res.send('access denied');
  } else {
    try {
      req.user = jwt.verify(accessToken, SECRET)
      next();

    } catch (err) {
      res.send('Access denied: Token invalid or expired');
    }
  }
};


async function checkPass(userDBPass, loginPassword) {
  const passMatch = await bcryptjs.compare(loginPassword, userDBPass);
  if (!passMatch) {
    throw new Error('Contraseña incorrecta');
  }
}


module.exports = {
  hashPassword,
  generateAccessToken,
  validateToken,
  checkPass,
};
