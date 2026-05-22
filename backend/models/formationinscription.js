'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FormationInscription extends Model {
    static associate(models) {
      // définir les associations ici si nécessaire
    }
  }
  FormationInscription.init({
    nom: DataTypes.STRING,
    email: DataTypes.STRING,
    telephone: DataTypes.STRING,
    formation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FormationInscription',
  });
  return FormationInscription;
};