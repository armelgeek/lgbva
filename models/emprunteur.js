'use strict';
'use strict';
const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Emprunteur = sequelize.define(
    "emprunters",
    {
      name: {
        type: Sequelize.STRING,
      },
      contact: {
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
  return Emprunteur;
};



