const responseHandle = require('../helpers/responseHanlde.js');
const responseCode = require('../helpers/responseCode.js');
const responseMessage = require('../helpers/responseMessage.js');
const authHelper = require('../helpers/authHelper');

module.exports = async (req, res, next) => {
  try {
    const validatedAuthObject = await authHelper.validateAuth(req);
   
    if (validatedAuthObject.isValid) {
      req.userId = validatedAuthObject.userId;
      return next();
    }

    return responseHandle.responseWithError(
      res,
      validatedAuthObject.responseCode,
      validatedAuthObject.responseMessage,
    );
  } catch (e) {
    return responseHandle.responseWithError(
      res,
      responseCode.UNAUTHORIZED,
      responseMessage.UNAUTHORIZED,
    );
  }
};
