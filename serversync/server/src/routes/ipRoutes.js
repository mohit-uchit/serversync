const router = require('express').Router();
const ipLogsController = require('../controller/ipLog/ipLogController');
const auth = require('../middleware/auth')
router.get('/', auth, ipLogsController.getIpList);

router.delete('/delete', auth, ipLogsController.deleteIpLogs);

router.post('/status', auth, ipLogsController.checkAndUpdateIpStatus);

router.get('/search', auth, ipLogsController.searchIpRecords);


module.exports = router;
