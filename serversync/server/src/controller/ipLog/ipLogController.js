const ipLogService = require('../../services/ipLog/ipLogService');
const responseHandle = require('../../helpers/responseHanlde');

/**
 * Get all expenses.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<*>}
 */
const getIpList = async (req, res) => {
  try {
    const { pageSize, page, filters } = req.query;
    const data = await ipLogService.getIpList(page, pageSize, filters, req.userId);
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
const deleteIpLogs = async (req, res) => {
  try {
    const { ips } = req.body;
    await ipLogService.deleteIpLogs(ips, req.userId);
    return responseHandle.handleOK(res);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

/**
 * Check and Update ip Logs
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<*>}
 */
const checkAndUpdateIpStatus = async (req, res) => {
  try {
    const { ips } = req.body;
    const data = await ipLogService.checkAndUpdateIpStatus(ips, req.userId);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

/**
 * search ip logs
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<*>}
 */
const searchIpRecords = async (req, res) => {
  try {
    const { term } = req.query;
    const data = await ipLogService.searchIpRecords(term, req.userId);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

module.exports = {
  getIpList,
  deleteIpLogs,
  checkAndUpdateIpStatus,
  searchIpRecords,
};
