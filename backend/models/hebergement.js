const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hebergement = sequelize.define('Hebergement', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    prix: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
  }, { timestamps: false });
  return Hebergement;
};