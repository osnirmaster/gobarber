const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const authConfig = require('../../config/auth');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decode = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decode.id;
    console.log(decode);

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid ' });
  }
};
