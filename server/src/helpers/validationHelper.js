const { validationResult } = require('express-validator');
const _ = require('lodash');
const responseCode = require('./responseCode');
const { Op } = require('sequelize');
const helper = require('./commonHelper');
const { NotFoundError } = require('./customErrors');
const responseHandle = require('./responseHandle');
const { isValidDateFormat } = require('../validations/validationUtils');

class ValidationHelper {
  /**
   * Format validation errors from Express Validator for consistent handling.
   * @param {object} req - Express request object
   * @returns {Array|null} - An array of formatted validation errors, or null if no errors are found.
   */

  static formatValidationErrors = req => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errors.array().map(error => ({
        type: 'field',
        value: error.value,
        msg: error.msg,
        path: error.path, // Use 'location' to get the field's path
        location: 'body',
      }));
    }
    return null;
  };

  static validateRequest = (req, res, next) => {
    const validationErrors = this.formatValidationErrors(req);
    if (validationErrors) {
      return responseHandle.responseWithValidationErrors(
        res,
        responseCode.BAD_REQUEST, // Google does not use 422: https://cloud.google.com/apis/design/errors#error_mapping
        validationErrors,
      );
    } else {
      next();
    }
  };

  /**
   * Validates a given value against a set of valid values for a specific field.
   * @param {string|[]} value - The value to be validated.
   * @param {object} validValues - An object containing valid values for the field.
   * @param {string} fieldName - The name of the field being validated.
   * @returns {boolean} - Returns true if the value is valid.
   * @throws {Error} - Throws an error if the value is not among the expected valid values.
   *
   * @example
   * // Usage example for validating a 'type' field:
   * const value = 'bike';
   * const validValues = { 1: 'bike', 2: 'bus', 3: 'car' };
   * validateObjectValues(value, validValues, 'commuteType');
   */
  static validateObjectValues(value, validValues, fieldName) {
    const validTypes = Object.values(validValues);
    if (Array.isArray(value)) {
      if (!value.every(item => validTypes.includes(item))) {
        throw new Error(
          `Invalid ${fieldName}. Must be one of the expected strings are ${validTypes.join(
            ', ',
          )}`,
        );
      }
    } else if (!validTypes.includes(value)) {
      throw new Error(
        `Invalid ${fieldName}. Must be one of the expected strings are ${validTypes.join(
          ', ',
        )}`,
      );
    }
    return true;
  }

  /**
   * Validates an array of fields to query against a set of valid fields.
   * @param {string[]} value - An array of fields to be validated.
   * @param {object} validFields - An object containing valid fields for the query.
   * @param {string} fieldName - The name of the field being validated.
   * @returns {boolean} - Returns true if all fields in the array are valid.
   * @throws {Error} - Throws an error if any field in the array is not among the expected valid fields.
   *
   * @example
   * const fieldsToQuery = ['field1', 'field2', 'field3:str1,str2'];
   * const validQueryFields = { field1: 'Field 1', field2: 'Field 2', field3: {str1:'str1',str2:'str2'} };
   * validateObjectKeys(fieldsToQuery, validQueryFields, 'fields');
   * TODO: support string as value in addition to arrays.
   */
  static validateObjectKeys(value, validFields, fieldName) {
    const allowedFields = Object.keys(validFields);
    value.forEach(field => {
      const [category, subFields] = field.includes(':')
        ? field.split(':')
        : [field];
      const errorMsg = `The ${fieldName} contains invalid values. ${fieldName} values should be in ${allowedFields.join(
        ', ',
      )}`;
      const subFieldsArray = subFields?.split(',');
      if (!allowedFields.includes(category)) {
        throw new Error(errorMsg);
      }
      if (subFieldsArray?.length > 0) {
        const allowedSubFields = validFields[category];
        if (typeof allowedSubFields !== 'object') {
          throw new Error(errorMsg);
        }
        const allowedSubFieldsArray = Object.keys(allowedSubFields);
        subFieldsArray.forEach(subField => {
          if (!allowedSubFieldsArray.includes(subField)) {
            throw new Error(
              `The ${fieldName} contains invalid values. ${category} values should be in ${allowedSubFieldsArray.join(
                ', ',
              )}`,
            );
          }
        });
      }
    });
    return true;
  }

  /**
   * Get and validate an array of IDs for a specific model, ensuring they exist and belong to the specified company.
   * @param {Model} model - The Sequelize model to validate IDs against.
   * @param {number[]} ids - An array of unique ids to be validated.
   * @param {number} companyId - The company ID to check against.
   * @param {string[]} attributes - An array of attributes to retrieve from the model when validating.
   * @param {string} modelName - The name of the model being validated (e.g., 'User', 'Task').
   * @param {string} [companyIdForeignKey='company_id'] - The foreign key attribute in the model representing the company ID.
   * @returns {Promise<Model[]>} - Returns an array of found model instances.
   * @throws {NotFoundError} - Throws an error if any provided ID is not found or does not belong to the specified company.
   *
   * @example
   * const userIds = [1, 2, 3];
   * const userAttributes = ['id', 'name', 'email'];
   * const foundUsers = await getAll(userModel, userIds, companyId, userAttributes, modelName);
   */
  static async getAll(
    model,
    ids,
    companyId,
    attributes,
    modelName,
    companyIdForeignKey = 'company_id',
  ) {
    const whereClause = {
      id: { [Op.in]: ids },
      [companyIdForeignKey]: companyId,
    };
    const foundItems = await model.findAll({
      where: whereClause,
      attributes: attributes,
    });
    if (ids.length != foundItems.length) {
      throw new NotFoundError(`${modelName} not found.`);
    }
    return foundItems;
  }

  /**
   * Get and validate an id for a specific model, ensuring id exist and belong to the specified company.
   * @param {Model} model - The Sequelize model to validate ID against.
   * @param {number} id - An id to be validated.
   * @param {number} companyId - The company ID to check against.
   * @param {string[]} attributes - An array of attributes to retrieve from the model when validating.
   * @param {string} modelName - The name of the model being validated (e.g., 'User', 'Task').
   * @param {string} [companyIdForeignKey='company_id'] - The foreign key attribute in the model representing the company ID.
   * @returns {Promise<Model>} - Returns a found model instances.
   * @throws {NotFoundError} - Throws an error if provided ID is not found or does not belong to the specified company.
   * getAll for example usage.
   */
  static async getOne(
    model,
    id,
    companyId,
    attributes,
    modelName,
    companyIdForeignKey = 'company_id',
  ) {
    const whereClause = {
      id: id,
      [companyIdForeignKey]: companyId,
    };
    const foundItem = await model.findOne({
      where: whereClause,
      attributes: attributes,
    });
    if (!foundItem) {
      throw new NotFoundError(`${modelName} not found.`);
    }
    return foundItem;
  }

  /**
   * Generic validator for various validation scenarios.
   * @param {object} req - The express-validator request object.
   * @param {string} fieldName - The fieldName of the field being validated.
   * @param {object} options - Validation options.
   * @param {boolean} [options.isRequired] - Indicates if the field is required or allow null value when using the isNullableRequired option.
   * @param {boolean} [options.isNullableOptional] - Indicates if the field is nullable optional.
   * @param {boolean} [options.isNullableRequired] - Indicates requiredWith and isRequired allow null value or not.
   * @param {boolean} [options.isString] - Indicates if the field must be a string.
   * @param {string|string[]} [options.requiredWith] - Current field is required when all listed fields present, or any field is present when using the checkSome option and allow null value when using the isNullableRequired option. Requires reqType to be specified.
   * @param {string|string[]} [options.onlyPresentWith] - The field shall only present if all listed fields are present or any field is present when using the checkSome option. Requires reqType to be specified.
   * @param {boolean} [options.checkSome] - Indicates requiredWith and onlyPresentWith apply to all listed fields or any listed field.
   * @param {boolean} [options.isInt] - Indicates if the field must be an integer.
   * @param {boolean} [options.isBoolean] - Indicates if the field must be a boolean value.
   * @param {boolean} [options.isEmail] - Indicates if the field must be a valid email.
   * @param {object} [options.isIntInRange] - Object specifying the minimum and/or maximum integer value constraints.
   * @param {number} [options.isIntInRange.min] - Minimum integer value.
   * @param {number} [options.isIntInRange.max] - Maximum integer value.
   * @param {boolean} [options.isDecimal] - Indicates if the field must be a decimal value.
   * @param {object} [options.isDecimalInRange] - Object specifying the minimum and/or maximum decimal value constraints.
   * @param {number} [options.isDecimalInRange.min] - Minimum decimal value.
   * @param {number} [options.isDecimalInRange.max] - Maximum decimal value.
   * @param {boolean|object} [options.isArray] - Indicates if the field must be an array with a minimum length.
   * @param {number} [options.isArray.min] - Minimum array length.
   * @param {number} [options.isArray.max] - Maximum array length.
   * @param {boolean|object} [options.isIntEachTrue] - Indicates if each item in the array must be an integer with minimum and/or maximum length.
   * @param {number} [options.isIntEachTrue.min] - Minimum array length.
   * @param {number} [options.isIntEachTrue.max] - Maximum array length.
   * @param {boolean} [options.isStringEachTrue] - Indicates if each item in the array must be a string.
   * @param {boolean} [options.isEmailEachTrue] - Indicates if each item in the array must be a valid email.
   * @param {boolean} [options.isObject] - Indicates if the field must be an object.
   * @param {boolean} [options.isObjectString] - Indicates if the field must be a stringified JSON object.
   * @param {object} [options.validObjectValues] - Constants for validating the type.
   * @param {object} [options.validObjectKeys] - Validate the required fields.
   * @param {boolean} [options.notOnlyWhitespaces] - Indicates if the field must not contain only whitespace characters.
   * @param {object} [options.length] - Object specifying the length constraints.
   * @param {number} [options.length.min] - Minimum length of the field.
   * @param {number} [options.length.max] - Maximum length of the field.
   * @param {string} [options.dateFormat] - Date format for date validation.
   * @param {object} [options.compare] - Returns true if currentValue [op] compareFieldValue is true. [Note: options.reqType is required for compare]
   * If we are validating "startDate", compareField is "endDate", operator is "<=", then true is returned if and only if both values are not nil and startDate <= endDate.
   * @param {string} [options.compare.type] - The data type of the field to compare. Can be 'string' or 'number'.
   * @param {string} [options.compare.operator] - one of [==, ===, <, <=, >, >=, !=, !==]. Please put this field BEFORE compareField in your code, so the logic is correct and easy to understand.
   * @param {string} [options.compare.compareField] - The name of the other field in comparison. Please put this field AFTER operator in your code, so the logic is correct and easy to understand.
   * @param {boolean} [options.noDuplicates] - Indicates if the array must not contain duplicate integers.
   * @param {string} [options.reqType] - Indicates the type of request, one of body, param, and query.
   * @param {string} [options.noCommonElement] - Indicates if the array must not contain common elements. [Note: options.reqType is required for noCommonElement]
   * @param {object} [options.regexPattern] - Object Specifying the Regex Constraints
   * @param {string} [options.regexPattern.pattern] - The regex pattern to match.
   * @param {string} [options.regexPattern.message] - The message to display if the pattern does not match.
   * @param {function} [options.customValidation] - The custom validation method.
   * @returns {object} - The configured validator object.
   */
  static genericValidator = (req, fieldName, options = {}) => {
    let validator = req(fieldName);

    if (options.isRequired) {
      validator = validator
        .exists() // Cannot use notEmpty(), null is valid input sometimes.
        .withMessage(`The ${fieldName} field must be provided.`)
        .if((value, { req }) => {
          if (options.isNullableRequired && value === null) {
            return false;
          }
          return true;
        });
    } else if (options.requiredWith) {
      validator = validator
        .custom(() => {
          this._checkReqType(options, 'requiredWith');
          return true;
        })
        .if((value, { req }) => {
          const fieldsToCheck = _.isArray(options.requiredWith)
            ? options.requiredWith
            : [options.requiredWith];
          const checkFunction = options.checkSome ? 'some' : 'every'; // Check if we need to check all or any field presence
          const allFieldsPresent = fieldsToCheck[checkFunction](
            field => !_.isUndefined(req[options.reqType][field]),
          );
          // Here !_.isUndefined(value) is in fact very important.
          // Without it, then if the required field is not present, the validation
          // chain will stop, so no more validations will be performed,
          // EVEN IF current field does present in payload.
          // Therefore, using .if(req(requiredWith).exists()) is also wrong.
          if (allFieldsPresent || !_.isUndefined(value)) {
            return true;
          }
          return false;
        })
        .exists() // Cannot use notEmpty(), null is valid input sometimes.
        .withMessage(
          `The ${fieldName} must present when ${options.requiredWith} present.`,
        )
        .if((value, { req }) => {
          if (options.isNullableRequired && value === null) {
            return false;
          }
          return true;
        });
    } else if (options.isNullableOptional) {
      validator = validator.optional({ nullable: true });
    } else {
      validator = validator.optional();
    }

    if (options.onlyPresentWith) {
      validator = validator.custom((value, { req }) => {
        this._checkReqType(options, 'onlyPresentWith');

        const fieldsToCheck = _.isArray(options.onlyPresentWith)
          ? options.onlyPresentWith
          : [options.onlyPresentWith];
        const checkFunction = options.checkSome ? 'some' : 'every'; // Check if we need to check all or any field presence
        const allFieldsPresent = fieldsToCheck[checkFunction](
          field => !_.isUndefined(req[options.reqType][field]),
        );

        if (!allFieldsPresent && !_.isUndefined(value)) {
          throw new Error(
            `The ${fieldName} shall only present with ${fieldsToCheck.join(
              ', ',
            )}`,
          );
        }
        return true;
      });
    }

    if (options.isString) {
      validator = validator
        .isString()
        .withMessage(`The ${fieldName} field must be a string value.`);
    }

    if (options.isInt) {
      validator = validator
        .isInt()
        .withMessage(`The ${fieldName} field must be an integer.`);
    }

    if (options.isBoolean) {
      validator = validator
        .isBoolean()
        .withMessage(`The ${fieldName} field must be a boolean value.`);
    }

    if (options.isEmail) {
      validator = validator
        .isEmail()
        .withMessage(`The ${fieldName} field must be a valid email.`);
    }

    if (options.isIntInRange) {
      const isIntInRange = options.isIntInRange;
      const { min, max } = isIntInRange;
      let message = `The ${fieldName} field must be an integer`;
      if (!_.isUndefined(min) && !_.isUndefined(max)) {
        message += ` between ${min} and ${max}.`;
      } else if (!_.isUndefined(max)) {
        message += ` with a maximum value of ${max}.`;
      } else if (!_.isUndefined(min)) {
        message += ` with a minimum value of ${min}.`;
      } else {
        message += `.`;
      }
      validator = validator.isInt(isIntInRange).withMessage(message);
    }

    if (options.isDecimal) {
      validator = validator
        .isDecimal()
        .withMessage(`The ${fieldName} field must be decimal value.`);
    }

    if (options.isDecimalInRange) {
      const isDecimalInRange = options.isDecimalInRange;
      const { min, max } = isDecimalInRange;
      let message = `The ${fieldName} field must be a decimal`;
      if (!_.isUndefined(min) && !_.isUndefined(max)) {
        message += ` between ${min} and ${max}.`;
      } else if (!_.isUndefined(max)) {
        message += ` with a maximum value of ${max}.`;
      } else if (!_.isUndefined(min)) {
        message += ` with a minimum value of ${min}.`;
      } else {
        message += `.`;
      }
      validator = validator.isFloat({ min, max }).withMessage(message);
    }

    if (options.isObject) {
      validator = validator
        .isObject()
        .withMessage(`The ${fieldName} must be an object.`);
    }

    if (options.isObjectString) {
      validator = validator
        .customSanitizer(value => JSON.parse(value))
        .isObject()
        .withMessage(`The ${fieldName} must be a JSON object string.`);
    }

    if (options.isArray) {
      const { min, max } = options.isArray;
      let object = { min: 1 };
      let message = `The ${fieldName} must be an array with`;
      if (!_.isUndefined(min) && !_.isUndefined(max)) {
        object = { min: min, max: max };
        message += ` length of between ${min} and ${max}.`;
      } else if (!_.isUndefined(min)) {
        object = { min: min };
        message += ` minimum length of ${min}.`;
      } else if (!_.isUndefined(max)) {
        object = { max: max };
        message += ` maximum length of ${max}.`;
      } else {
        message += ` a minimum length of 1.`;
      }
      validator = validator.isArray(object).withMessage(message);
    }

    if (options.isIntEachTrue) {
      // Interesting... Even if it's true, min and max are still undefined instead of throwing an error.
      const { min, max } = options.isIntEachTrue;
      let object = { each: true };
      let message = `Each item in ${fieldName} must be an integer`;
      if (!_.isUndefined(min) && !_.isUndefined(max)) {
        object = { min, max };
        message += ` with a value between ${min} and ${max}.`;
      } else if (!_.isUndefined(min)) {
        object = { min };
        message += ` with a minimum value of ${min}.`;
      } else if (!_.isUndefined(max)) {
        object = { max };
        message += ` with a maximum value of ${max}.`;
      }
      validator = validator.isInt(object).withMessage(message);
    }

    if (options.isStringEachTrue) {
      validator = validator
        .isString({ each: true })
        .withMessage(`Each item in ${fieldName} must be string.`);
    }

    if (options.isEmailEachTrue) {
      validator = validator.custom(async (value, { req }) => {
        if (value && _.isArray(value)) {
          for (const recipient of value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(recipient)) {
              throw new Error(
                'Invalid email address in "' + fieldName + '" array',
              );
            }
          }
        }
      });
    }

    if (options.validObjectValues) {
      validator = validator.custom(value =>
        this.validateObjectValues(value, options.validObjectValues, fieldName),
      );
    }

    if (options.validObjectKeys) {
      validator = validator.custom(value =>
        this.validateObjectKeys(value, options.validObjectKeys, fieldName),
      );
    }

    if (options.notOnlyWhitespaces) {
      validator = validator
        .custom(val => !helper.containsOnlyWhitespace(val))
        .withMessage(
          `The ${fieldName} field must not contain only whitespace characters.`,
        );
    }

    if (options.length) {
      validator = validator
        .isLength(options.length)
        .withMessage(
          `The ${fieldName} field must have a length between ${options.length.min} and ${options.length.max} characters.`,
        );
    }

    if (options.dateFormat) {
      validator = validator
        .custom(date => isValidDateFormat(date, options.dateFormat))
        .withMessage(
          `The ${fieldName} must meet the date format: ${options.dateFormat}`,
        );
    }

    if (options.compare) {
      const { type, compareField, operator } = options.compare;
      const validOperators = ['==', '===', '!=', '!==', '<', '<=', '>', '>='];

      this._checkReqType(options, 'compare');

      if (!validOperators.includes(operator)) {
        throw new Error(
          `Invalid operator "${operator}". Valid operators are: ${validOperators.join(
            ', ',
          )}.`,
        );
      }

      validator = validator
        .custom((value, { req }) => {
          const comparisonValue = req[options.reqType][compareField];

          if (_.isNil(value) || _.isNil(comparisonValue)) {
            return false;
          }

          const performComparison = (a, b) => {
            const comparisons = {
              '==': a == b,
              '===': a === b,
              '<': a < b,
              '<=': a <= b,
              '>': a > b,
              '>=': a >= b,
              '!=': a != b,
              '!==': a !== b,
            };
            return comparisons[operator];
          };

          if (type === 'number') {
            return performComparison(Number(value), Number(comparisonValue));
          }

          return performComparison(value, comparisonValue);
        })
        .withMessage(`${fieldName} shall ${operator} ${compareField}.`);
    }

    if (options.noDuplicates) {
      validator = validator.custom(async (ids, { req }) => {
        if (helper.containsDuplicates(ids)) {
          throw new Error(`The ${fieldName} must not contain duplicates.`);
        }
      });
    }

    if (options.noCommonElement) {
      validator = validator.custom(async (value, { req }) => {
        this._checkReqType(options, 'noCommonElement');
        return this.validateCommonElements(
          req[options.reqType],
          fieldName,
          options.noCommonElement,
        );
      });
    }

    if (options.regexPattern) {
      validator = validator
        .matches(options.regexPattern.pattern)
        .withMessage(
          `The ${fieldName} must match the pattern: ${options.regexPattern.message}`,
        );
    }

    if (options.customValidation) {
      validator = validator.custom(options.customValidation);
    }

    return validator;
  };

  /**
   * Check reqType is present for certain validator options.
   * @param {Object} options
   * @param {string} name - Option name.
   */
  static _checkReqType = (options, name) => {
    if (!['body', 'param', 'query'].includes(options.reqType)) {
      throw new Error(
        'reqType is required for ' +
          name +
          ' validator and must be body, param, or query.',
      );
    }
  };

  static validateCommonElements = (object, fieldName1, fieldName2) => {
    const array1 = object[fieldName1] || [];
    const array2 = object[fieldName2] || [];
    const commonIds = _.intersection(array1, array2);
    if (commonIds.length > 0) {
      throw new Error(
        `The ${fieldName1} and ${fieldName2} arrays must not contain the same ID(s).`,
      );
    }
    return true;
  };

  /**
   * Middleware to check for unrecognized parameters in a request.
   * @param {Array} allowedParams - The array of allowed parameters.
   * @param {string} reqType - The type of request object to check for parameters (e.g., 'query', 'body').
   * @returns {Function} Middleware function.
   */
  static checkUnrecognizedParams =
    (allowedParams, reqType) => (req, res, next) => {
      const receivedParams = Object.keys(req[reqType]);
      const unrecognizedParams = receivedParams.filter(
        param => !allowedParams.includes(param),
      );
      if (unrecognizedParams.length > 0) {
        return responseHandle.responseWithError(
          res,
          responseCode.BAD_REQUEST,
          `Unrecognized parameters: ${unrecognizedParams.join(', ')}`,
        );
      } else {
        next();
      }
    };
}

module.exports = ValidationHelper;
