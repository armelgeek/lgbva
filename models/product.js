const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define(
    "products",
    {
      name: {
        type: Sequelize.STRING,
      },
      prixlitre: {
        type: Sequelize.FLOAT,
      },
      prixVente: {
        type: Sequelize.FLOAT,
      },
      prixFournisseur: {
        type: Sequelize.FLOAT,
      },
      prixVaccinateur: {
        type: Sequelize.FLOAT,
      },
      type: {
        type: Sequelize.STRING,
      },
      uniteMesure: {
        type: Sequelize.STRING,
      },
      doseDefault: {
        type: Sequelize.FLOAT,
      },
      doseRestantEnMg: {
        type: Sequelize.FLOAT,
      },
      qttByCC: {
        type: Sequelize.FLOAT,
      },
      quantityBrute: {
        type: Sequelize.FLOAT,
      },
      quantityBruteCVA: {
        type: Sequelize.FLOAT,
      },
      quantityCCCVA: {
        type: Sequelize.FLOAT,
      },
      quantityParProduct: {
        type: Sequelize.FLOAT,
      },
      qttbylitre: {
        type: Sequelize.INTEGER,
      },
      qttbybrute: {
        type: Sequelize.INTEGER,
      },
     
      prixParCC: {
        type: Sequelize.FLOAT,
      },
      quantityCC: {
        type: Sequelize.FLOAT,
      },
      conditionnement: {
        type: Sequelize.FLOAT,
      },
      remise: {
        type: Sequelize.FLOAT,
      },
      qttyspecificmirror: {
        type: Sequelize.FLOAT,
      },
      condml: {
        type: Sequelize.FLOAT,
      },
      condsize: {
        type: Sequelize.FLOAT,
      },
      condval: {
        type: Sequelize.FLOAT,
      },
      qttccpvente: {
        type: Sequelize.FLOAT,
      },
      prixqttccvente: {
        type: Sequelize.FLOAT,
      },
      refSortie: {
        type: Sequelize.STRING,
      },
      refQtSortie: {
        type: Sequelize.INTEGER,
      },
      remise: {
        type: Sequelize.INTEGER,
      },
      remisePerProduct:{
        type: Sequelize.FLOAT,
      },
      qttByCCDepot: {
        type: Sequelize.FLOAT,
      },
      condmldepot: {
        type: Sequelize.FLOAT,
      },
      condvaldepot: {
        type: Sequelize.FLOAT,
      },
      qttccpventedepot: {
        type: Sequelize.FLOAT,
      },
      prixqttccventedepot: {
        type: Sequelize.FLOAT,
      },
      quantityParProductDepot: {
        type: Sequelize.FLOAT,
      },
      condsizedepot: {
        type: Sequelize.INTEGER,
      },
      correction: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      correctionml: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      correctionl: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      correctiontml: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      correctiontl: {
        type: Sequelize.INTEGER,
        default: 0,
      },
 /**    isValid: {
        type: Sequelize.BOOLEAN,
        default: 0,
      }, */ 
      datedecorrection: {
        type: Sequelize.DATEONLY,
      },
      correctiontype: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      datePer: {
        type: Sequelize.DATEONLY,
        get: function () {
          return moment.utc(this.getDataValue("datePer")).format("YYYY-MM-DD");
        },
        field: "datePer",
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
  return Product;
};
