'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IpRecord extends Model {}
  IpRecord.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT.UNSIGNED, //1 =>  active , 2 => inactive
        allowNull: false,
      },
      deleted_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'IpRecord',
      tableName: 'ip_records',
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  );

  IpRecord.associate = models => {
    IpRecord.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return IpRecord;
};
