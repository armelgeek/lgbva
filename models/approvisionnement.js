"use strict";

const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Approvisionnement = sequelize.define(
    "approvisionnements",
    {
      contenu: {
        type: Sequelize.JSON,
      },
      dateEcheance: {
        type: Sequelize.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue("dateEcheance"))
            .format("YYYY-MM-DD");
        },
        field: "dateEcheance",
      },
      remarque: {
        type: Sequelize.STRING,
      },
      remise: {
        type: Sequelize.FLOAT,
      },
      totalht: {
        type: Sequelize.FLOAT,
      },
      total:{
        type:Sequelize.FLOAT
      },
      typePaye:{
        type:Sequelize.STRING
      },
      
      dateApprov: {
        type: Sequelize.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue("dateApprov"))
            .format("YYYY-MM-DD");
        },
        field: "dateCom",
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
  return Approvisionnement;
};
