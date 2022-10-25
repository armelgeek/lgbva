const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define(
    "categories",
    {
      name: {
        type: Sequelize.STRING,
      },

      createdAt: {
        type: Sequelize.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue("createdAt"))
            .format("YYYY-MM-DD");
        },
        field: "created_at",
      },

      updatedAt: {
        type: Sequelize.DATEONLY,
        field: "updated_at",
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return Category;
};
