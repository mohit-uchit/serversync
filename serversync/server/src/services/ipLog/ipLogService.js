const db = require('../../../models');
const { IpRecord } = db;
const { ipStatus } = require('../../../config/constants');
const {
  getPagination,
  getValueByKeyOrNull,
  paginate,
} = require('../../helpers/commonHelper');
const net = require('net');
const sequelize = db.sequelize;
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Check if an IP:port is active
 * @param {string} host
 * @param {number} port
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
const _checkPortStatus = (host, port, timeout = 2000) => {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let status = false;

    const onError = () => {
      socket.destroy();
      resolve(status);
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      status = true;
      socket.end();
      resolve(status);
    });
  });
};

/**
 * Check the status of multiple IP:port combinations and update the database
 * @param {string[]} ipPortArray
 * @param {interger} userId
 * @returns {Promise<void>}
 */
const checkAndUpdateIpStatus = async (ipPortArray, userId) => {
  if (!Array.isArray(ipPortArray) || ipPortArray.length === 0) {
    throw new Error('Invalid input: ipPortArray must be a non-empty array');
  }

  await sequelize.transaction(async transaction => {
    for (const ipPort of ipPortArray) {
      const [host, port] = ipPort.split(':');
      const isActive = await _checkPortStatus(host, parseInt(port, 10));

      let existingIpRecord = await IpRecord.findOne({
        where: {
          ip: ipPort,
          user_id: userId,
        },
        transaction,
      });

      if (existingIpRecord) {
        await existingIpRecord.update(
          {
            status: isActive ? 1 : 2,
          },
          { transaction },
        );
      } else {
        await IpRecord.create(
          {
            ip: ipPort,
            status: isActive ? 1 : 2,
          },
          { transaction },
        );
      }
    }
  });

  return await getIpList();
};

const getIpList = async (
  currentPage = 1,
  pageSize,
  filters = false,
  userId,
) => {
  const { page, limit, offset, pagination } = getPagination(
    currentPage,
    pageSize,
    25,
  ); // Default page size.

  let query = {
    where: {
      user_id: userId,
    },
    order: [['id', 'DESC']],
  };

  if (filters === 'true') {
    query.where = {
      status: 2,
    };
  }

  if (pagination) {
    query.limit = limit;
    query.offset = offset;
  }

  console.log(query);

  const logsRes = await IpRecord.findAndCountAll(query);

  return {
    logs: _formatLogsData(logsRes.rows),
    meta: paginate(logsRes, page, limit),
  };
};

const _formatLogsData = data => {
  return data.map(d => ({
    id: d.id,
    ip: d.ip,
    status: getValueByKeyOrNull(ipStatus, d.status),
    lastChecked: moment(d.updated_at).format('DD-MM-YYYY HH:mm:ss'),
  }));
};

const deleteIpLogs = async (ips, userId) => {
  if (!Array.isArray(ips) || ips.length === 0) {
    throw new Error('Invalid input: ids must be a non-empty array');
  }

  return await IpRecord.destroy({
    where: {
      ip: ips,
      user_id: userId,
    },
  });
};

/**
 * Search IP records and provide suggestions
 * @param {string} term - Search term for IP address
 * @param {interger} userId
 * @returns {Promise<{ ipRecords: Object[], suggestions: string[] }>} - Matching IP records and suggestions
 */
const searchIpRecords = async (term, userId) => {
  const searchCriteria = {
    where: {
      user_id: userId,
      ip: {
        [Op.like]: `%${term}%`,
      },
    },
  };

  const data = await IpRecord.findAll(searchCriteria);

  const suggestions = data.reduce((acc, record) => {
    if (!acc.includes(record.ip)) {
      acc.push(record.ip);
    }
    return acc;
  }, []);

  const ipRecords = _formatLogsData(data);

  return { ipRecords, suggestions };
};

module.exports = {
  getIpList,
  deleteIpLogs,
  checkAndUpdateIpStatus,
  searchIpRecords,
};
