const moment = require("moment");
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "users",
    {
      
      username:{
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.STRING,
      },
      active:{
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        type: Sequelize.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue("createdAt"))
            .format("YYYY-MM-DD");
        },
        field: "createdAt",
      },

      updatedAt: {
        type: Sequelize.DATEONLY,
        field: "updatedAt",
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return User;
};