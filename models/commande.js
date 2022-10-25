"use strict";

const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Commande = sequelize.define(
    "commandes",
    {
      contenu: {
        type: Sequelize.JSON,
      },
      type: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      sorte: {
        type: Sequelize.STRING,
      },
      qtteBrute: {
        type: Sequelize.INTEGER,
      },
      qtteCC: {
        type: Sequelize.INTEGER,
      },
      refSortie: {
        type: Sequelize.STRING,
      },
      isdeleted: {
        type: Sequelize.BOOLEAN,
      },
      deletedat: {
        type: Sequelize.DATE,
      },
      dateCom: {
        type: Sequelize.DATE,
        get: function () {
          return moment
            .utc(this.getDataValue("dateCom"))
            .format("YYYY-MM-DD");
        },
        field: "dateCom",
      },
      createdAt: {
        type: Sequelize.DATE,
        get: function () {
          return moment
            .utc(this.getDataValue("createdAt"))
            .format("YYYY-MM-DD");
        },
        field: "created_at",
      },

      updatedAt: {
        type: Sequelize.DATE,
        field: "updated_at",
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return Commande;
};
