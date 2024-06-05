const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../../models');
const { User, AuthToken } = db;
const { readAuthKeyFile } = require('../../helpers/authHelper');
const { ValidationError } = require('../../helpers/customErrors');
const { getIntKeyByValueOrNull } = require('../../helpers/commonHelper');
const { role: roleConst } = require('../../../config/constants.js');
require('dotenv').config();

const privateKey = readAuthKeyFile(false);

const generateToken = userId => {
  const expiresIn = '90d';
  const token = jwt.sign({ sub: userId }, privateKey, {
    algorithm: 'RS256',
    expiresIn,
  });
  return { token, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) };
};

const signup = async body => {
  const { firstName, lastName, email, password, role } = body;

  const existingUser = await _getUser(email);
  
  if (existingUser) {
    throw new ValidationError(`The email is already registered.`);
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const user = await User.create({
    name: firstName,
    last_name: lastName,
    email,
    role: getIntKeyByValueOrNull(roleConst, role),
    password: hashedPassword,
  });

  const { token, expiresAt } = generateToken(user.id);
  await AuthToken.create({ token, user_id: user.id, expires_at: expiresAt });

  return { token };
};

const login = async body => {
  const { email, password } = body;
  const user = await _getUser(email);

  if (!user) {
    throw new ValidationError(`User not found!`);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ValidationError(`Invalid User Credentials.`);
  }

  const { token, expiresAt } = generateToken(user.id);

  const existingToken = await AuthToken.findOne({
    where: { user_id: user.id },
  });

  if (existingToken) {
    existingToken.token = token;
    existingToken.expiresAt = expiresAt;
    await existingToken.save();
  } else {
    await AuthToken.create({ token: token, userId: user.id, expires_at: expiresAt });
  }

  return { token };
};

const _getUser = async email => {
  return await User.findOne({ where: { email: email } });
};

const logout = async (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new ValidationError('Token not provided');
  }

  return await AccessToken.destroy({ where: { token } });
};

module.exports = {
  signup,
  login,
  logout,
};
