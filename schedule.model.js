const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // This is a reference to another model
      key: 'id',     // This is the column name of the referenced model
    },
    onDelete: 'CASCADE'
  },
  name: { type: DataTypes.STRING, allowNull: false },
  days: { type: DataTypes.INTEGER, allowNull: false },  // Stored as an integer (bitmask)
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false }
}, {
  tableName: 'schedules'
});

module.exports = Schedule;
