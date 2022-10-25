const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const SortieDepot = sequelize.define(
    "sortiedepots",
    {
      refSortie: {
        type: Sequelize.STRING,
      },
      quantiteSortie: {
        type: Sequelize.INTEGER,
      },
      status:{
        type:Sequelize.BOOLEAN
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
  return SortieDepot;
};
