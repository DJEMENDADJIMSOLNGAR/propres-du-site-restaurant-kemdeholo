const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Formation = sequelize.define('Formation', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    duree: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
  }, { timestamps: false });
  return Formation;
};