const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Contact = sequelize.define('Contact', {
    prenom: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sujet: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { timestamps: false });
  return Contact;
};
