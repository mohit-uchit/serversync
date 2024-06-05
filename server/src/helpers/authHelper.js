const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const helper = require('../helpers/commonHelper');
const responseCode = require('../helpers/responseCode.js');
const responseMessage = require('../helpers/responseMessage.js');

const validateAuth = async req => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return {
      isValid: false,
      responseCode: responseCode.FORBIDDEN,
      responseMessage: responseMessage.FORBIDDEN,
    };
  }

  let publicKey = readAuthKeyFile();
  let userId = await validateJwtToken(token, publicKey);

  if (userId) {
    return {
      isValid: true,
      userId: userId,
    };
  }

  return {
    isValid: false,
    responseCode: responseCode.UNAUTHORIZED,
    responseMessage: responseMessage.UNAUTHORIZED,
  };
};

/**
 * Validate jwt token, returns userId if valid token else false
 * @param token
 * @param publicKey
 * @returns {Promise<void>}
 */
const validateJwtToken = async (token, publicKey) => {
  return jwt.verify(
    token,
    publicKey,
    { algorithms: ['RS256'], clockTolerance: 1 },
    async (err, user) => {
      if (err) {
        return false;
      }
      const userId = user.sub;

      return userId;
    },
  );
};

/**
 * Read authentication key file.
 * @param {boolean} isPublic - Whether to read the public key file.
 * @returns {string} - Contents of the key file.
 */
const readAuthKeyFile = (isPublic = true) => {
    const keyFilename = isPublic ? 'oauth-public.key' : 'oauth-private.key';
    return fs.readFileSync(
      path.join(__dirname, `../../${keyFilename}`),
      'utf8'
    );
  };

module.exports = {
  validateAuth,
  validateJwtToken,
  readAuthKeyFile,
};