const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Blanchisserie = sequelize.define('Blanchisserie', {
    article: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prix: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, { timestamps: false });
  return Blanchisserie;
};