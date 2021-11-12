'use strict';


module.exports = (sequelize, DataTypes) => {
  const Attraction = sequelize.define('Attraction', {
    attractionName: DataTypes.STRING(255),
    theme: DataTypes.STRING(100),
    opened: DataTypes.DATEONLY,
    ridersPerVehicle: DataTypes.INTEGER
  }, {});
  Attraction.associate = function(models) {
    Attraction.belongsTo(models.Park, {
      as: 'park',
      foreignKey: 'parkId'
    });
    Attraction.hasMany(models.AttractionVisit, {
      as: 'visits',
      foreignKey: 'attractionId'
    });
  };
  return Attraction;
};
