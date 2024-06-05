const authService = require('../../services/auth/authService');
const responseHandle = require('../../helpers/responseHanlde');

/**
 * Signup.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<*>}
 */
const signup = async (req, res) => {
  try {
    const data = await authService.signup(req.body);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

/**
 * login
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<*>}
 */
const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

/**
 * Delete ip Logs
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<*>}
 */
const logout = async (req, res) => {
  try {
    await authService.logout(req);
    return responseHandle.handleOK(res);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

module.exports = {
  login,
  signup,
  logout,
};
