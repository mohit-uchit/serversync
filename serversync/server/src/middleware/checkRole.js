const responseHandle = require('../helpers/responseHandle.js');
const responseCode = require('../helpers/responseCode.js');
const responseMessage = require('../helpers/responseMessage.js');
const db = require('../../models/index.js');
const User = db.User;
module.exports = (role) => async (req, res, next) => {
  try {
    const userDetail = await User.findOne({
      where: {
        id: req.userId,
      },
      attributes: ['role'],
    });
    
    if (!userDetail || !userDetail.role || userDetail.role !== role) {
      return responseHandle.responseWithError(
        res,
        responseCode.FORBIDDEN,
        responseMessage.UNAUTHORIZED,
      );
    }
    
    return next();
  } catch (error) {
    return responseHandle.responseWithError(
      res,
      responseCode.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};