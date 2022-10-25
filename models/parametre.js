const moment = require("moment");

module.exports = (sequelize, Sequelize) => {
  const Pareametres = sequelize.define(
    "parametres",
    {
      nb_mois: {
        type: Sequelize.INTEGER,
      },
      nb_produits: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return Pareametres;
};
