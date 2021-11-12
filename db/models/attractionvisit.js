'use strict';
module.exports = (sequelize, DataTypes) => {
  const AttractionVisit = sequelize.define('AttractionVisit', {
    visitedOn: DataTypes.DATE,
    rating: DataTypes.INTEGER,
    comments: DataTypes.TEXT
  }, {});
  AttractionVisit.associate = function(models) {
    // associations can be defined here
    AttractionVisit.belongsTo(models.Attraction, {
      as: 'attraction', foreignKey: 'attractionId'
    });
    AttractionVisit.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
    });
  };
  return AttractionVisit;
};
