const helper = require('think-helper');
/**
 * abstract schema
 */
module.exports = class AbstractSchema {
  /**
   * constructor
   * @param {Object} config 
   * @param {Object} schema 
   * @param {String} table 
   */
  constructor(config, schema = {}, table) {
    this.config = config;
    this.schema = schema;
    this.table = table;
  }
  /**
   * get reverse fields
   * @param {String} fields 
   */
  getReverseFields(fields) {
    if (helper.isString(fields)) fields = fields.split(',');
    return this.getSchema().then(schema => {
      return Object.keys(schema).filter(field => {
        return fields.indexOf(field) === -1;
      });
    });
  }
  /**
   * validate data
   * @param {Object} data 
   * @param {Object} schema 
   */
  validateData(data, schema) {
    return data;
  }
  /**
   * parse data
   * @param {Object} data 
   * @param {Boolean} isUpdate 
   */
  parseData(data, isUpdate = false, table) {
    return this.getSchema(table).then(schema => {
      const result = {};
      for (const key in schema) {
        if (isUpdate && schema[key].readonly) continue;
        if (data[key] === undefined) {
          const flag = !isUpdate || (isUpdate && schema[key].update);
          if (flag && schema.default !== '') {
            result[key] = schema.default;
          }
          continue;
        }
        if (helper.isNumber(data[key]) || helper.isNumberString(data[key]) || helper.isBoolean(data[key])) {
          result[key] = this.parseType(schema[key].tinyType, data[key]);
        } else {
          result[key] = data[key];
        }
      }
      return this.validateData(result, schema);
    });
  }
};