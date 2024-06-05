const router = require('express').Router();
const env = process.env.NODE_ENV || 'development';
const ipRoutes = require('./src/routes/ipRoutes');
const autRoutes = require('./src/routes/authRoutes.js')
const responseHandle = require('./src/helpers/responseHanlde.js');
const responseCode = require('./src/helpers/responseCode.js');

router.get('/', function (req, res) {
  return responseHandle.responseWithoutData(
    res,
    responseCode.OK,
    'Welcome to AkshayRdpService! If you are looking for a job, please send your resume to zbu@ezpapel.com!',
  );
});

router.use('/ip', ipRoutes);
router.use('/auth', autRoutes);

router.all('*', function (req, res, next) {
  return responseHandle.responseWithError(
    res,
    responseCode.NOT_FOUND,
    'Route Not Found!',
  );
});
module.exports = router;
