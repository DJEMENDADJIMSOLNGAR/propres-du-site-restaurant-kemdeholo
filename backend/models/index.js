// Connexion Sequelize à PostgreSQL
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'kemdeholo',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || '',
  {
    host: process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importer et initialiser tous les modèles
db.Subscriber = require('./subscriber')(sequelize);
db.Notification = require('./notification')(sequelize);
db.Blog = require('./blog')(sequelize);
db.Contact = require('./contact')(sequelize);
db.Menu = require('./menu')(sequelize);
db.Comment = require('./comment')(sequelize);
db.Hebergement = require('./hebergement')(sequelize);
db.Formation = require('./formation')(sequelize);
db.Blanchisserie = require('./blanchisserie')(sequelize);
db.Order = require('./order')(sequelize);
db.Team = require('./team')(sequelize);
db.Testimonial = require('./testimonial')(sequelize);
db.Reservation = require('./reservation')(sequelize);
db.FormationInscription = require('./formationinscription')(sequelize, Sequelize.DataTypes);

// Définir les associations ici
db.Blog.hasMany(db.Comment, { as: 'Comments', foreignKey: 'blogId', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.Blog, { foreignKey: 'blogId' });

db.Comment.hasMany(db.Comment, { as: 'replies', foreignKey: 'parentId', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.Comment, { as: 'parent', foreignKey: 'parentId' });

module.exports = db;
