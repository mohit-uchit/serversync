'use strict';

const fs = require('fs');
const path = require('path');
const sequelizeLib = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];
const db = {};

let sequelize = new sequelizeLib(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

function loadModels(directory) {
  fs.readdirSync(directory)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      const model = require(path.join(directory, file))(
        sequelize,
        sequelizeLib.DataTypes,
      );
      db[model.name] = model;
    });
}
loadModels(__dirname);
loadModels(__dirname + '/auth');
loadModels(__dirname + '/iprecords');

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.sequelizeLib = sequelizeLib;

module.exports = db;
