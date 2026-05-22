const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Testimonial = sequelize.define('Testimonial', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quote: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // 'pending', 'approved'
    },
  }, { timestamps: true });

  return Testimonial;
};