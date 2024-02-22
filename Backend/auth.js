const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = "49efe9d4fad425ca754ed342752be6d79850c46feba6f1e6eb96af7925dc5274";

async function hashPassword(pw) {
	return await bcryptjs.hash(pw, 10);
}

function generateAccessToken(user) {
	return jwt.sign(user, SECRET, { expiresIn: '5m' });
}

function validateToken(req, res, next) {
	const accessToken = req.headers['authorization'];
	if (!accessToken) {
		res.send('Access denied');
	} else {
		jwt.verify(accessToken, SECRET, (err, token) => {
			if (err) {
				res.send('Access denied: Token invalid or expired');
			} else {
				next();
			}
		});
	}
}

module.exports = {
	hashPassword,
	generateAccessToken,
	validateToken,
};
