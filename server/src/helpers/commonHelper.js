const axios = require('axios');
const _ = require('lodash');
const { defaultPage, defaultPageSize } = require('../../config/constants');

class Helper {
  static findKeyByValue = (obj, value) => {
    return Object.keys(obj).find(key => obj[key] === value);
  };

  static getKeyByValueOrNull = (obj, value) => {
    if (value !== null && value !== undefined) {
      return Object.keys(obj).find(key => obj[key] === value);
    }
    return null;
  };

  static findIntKeyByValue = (obj, value) => {
    return parseInt(Object.keys(obj).find(key => obj[key] === value));
  };

  static getIntKeyByValueOrNull = (obj, value) => {
    if (value !== null && value !== undefined) {
      return parseInt(Object.keys(obj).find(key => obj[key] === value));
    }
    return null;
  };

  /**
   * If key exists in obj, return obj[key]. Else return null.
   * @param obj
   * @param key
   */
  static getValueByKeyOrNull = (obj, key) => {
    if (key !== null && key !== undefined) {
      return obj[key];
    }
    return null;
  };

  /**
   * Call the callback to transform value, or return null if value is null or undefined.
   * @param callback
   * @param value
   */
  static getReturnValueOrNull = (callback, value) => {
    if (value !== null && value !== undefined) {
      return callback(value);
    }
    return null;
  };

  /**
   * Call the callback to transform value, or return undefined if value is null or undefined.
   * @param callback
   * @param value
   */
  static getReturnValueOrUndefined = (callback, value) => {
    if (value !== null && value !== undefined) {
      return callback(value);
    }
    return undefined;
  };

  /**
   * Checks if a value exists in the array. If the value is found, returns 1; otherwise, returns null.
   * @param {Array} array - The array to check for the condition.
   * @param {string|number} valueToCheck - The value to check for in the array.
   * @returns {number|null} Returns 1 if the value is found, otherwise returns null.
   */
  static findValueInArrayOrNull = (array, valueToCheck) => {
    if (array?.length > 0 && array.includes(valueToCheck)) {
      return 1;
    }
    return null;
  };

  static getHttpWithHeaderResponse = async (url, authorization) => {
    try {
      let config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
      };
      let response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error.message;
    }
  };

  static getHttpResponse = async url => {
    try {
      let config = {
        method: 'get',
        url: url,
      };
      let response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error.message;
    }
  };

  /**
   * Pagination For Sequelize
   * @param items
   * @param pageNumber
   * @param pageSize
   * @return object
   */
  static paginate = (items, pageNumber = 1, pageSize = 50) => {
    return {
      currentPage: pageNumber,
      totalPage: Math.ceil(items.count / pageSize),
      totalItems: items.count,
      perPage: pageSize,
    };
  };

  /**
   * Pagination For Sequelize
   * @param items
   * @param pageNumber
   * @param pageSize
   * @return object
   */
  static paginateWithItemsArray = (items, pageNumber = 1, pageSize = 25) => {
    let itemsCount = items.length;

    return {
      currentPage: pageNumber,
      totalPage: Math.ceil(itemsCount / pageSize),
      totalItems: itemsCount,
      perPage: pageSize,
    };
  };

  /**
   * Calculate pagination. Paging will only be turned on if one of currentPage and pageSize is set.
   * @param {*} currentPage Paging request from API payload.
   * @param {*} pageSize Paging request from API payload.
   * @param {number|undefined} overRideDefaultPageSize Use this default page size instead of system's default size 50.
   * @returns
   */
  static getPagination = (currentPage, pageSize, defaultPageSizeToUse) => {
    let pagination = true;
    if (!pageSize && !currentPage) {
      pagination = false;
    }
    const page = this.getPage(currentPage);
    const limit = this.getPageSize(pageSize, defaultPageSizeToUse);
    const offset = (page - 1) * limit;
    return { page, limit, offset, pagination };
  };

  static getPage = page => {
    if (page) {
      return parseInt(page);
    }
    return defaultPage;
  };

  static getPageSize = (pageSize, defaultPageSizeToUse) => {
    if (pageSize) {
      return parseInt(pageSize);
    }
    if (defaultPageSizeToUse) {
      return defaultPageSizeToUse;
    }
    return defaultPageSize;
  };

  static splitStringToArray = (value, separator = ',') => {
    if (value !== null && value !== undefined) {
      return value.split(separator);
    }
    return [];
  };

  /**
   * Checks if an array contains duplicate items.
   * @param {array} items
   * @returns {boolean}
   */
  static containsDuplicates(items) {
    const uniqueItems = new Set(items.map(id => String(id))); // Convert all values to String for comparison
    return uniqueItems.size !== items.length;
  }

  /**
   * Checks if a string contains only whitespace characters.
   * @param {string} name
   * @returns {boolean}
   */
  static containsOnlyWhitespace(name) {
    return /^\s*$/.test(name);
  }

  /**
   * Create a new object with specified property or Null.
   * @param {string} propertyName - The name of the property.
   * @param {any} value - The value of the property.
   * @returns {Object|null} - The formatted object, or null if value is null or undefined.
   */
  static newObjWithPropOrNull = (propertyName, value) => {
    if (!_.isNil(value)) {
      return { [propertyName]: value };
    }
    return null;
  };
}

module.exports = Helper;
