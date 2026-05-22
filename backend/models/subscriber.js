
// Modèle Sequelize pour Subscriber (abonné)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscriber = sequelize.define('Subscriber', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { timestamps: false });
  return Subscriber;
};
