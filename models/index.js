'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.product=require("./product")(sequelize,Sequelize.DataTypes);
db.sortiedepot = require("./sortiedepot")(sequelize,Sequelize.DataTypes);
db.fournisseur=require("./fournisseur")(sequelize,Sequelize.DataTypes)
db.category=require("./category")(sequelize,Sequelize.DataTypes)
db.user = require("./user")(sequelize,Sequelize.DataTypes)
db.category.hasMany(db.product, { as: "products" });
db.product.belongsTo(db.category, {
  foreignKey: "categoryId",
  as: "category",
});
db.fournisseur.hasMany(db.product, { as: "products" });

db.product.hasMany(db.sortiedepot, { as: "sortiedepots" });
db.sortiedepot.belongsTo(db.product, {
  foreignKey: "productId",
  as: "product",
})



db.product.belongsTo(db.fournisseur, {
  foreignKey: "fournisseurId",
  as: "fournisseur",
});
db.commande=require("./commande")(sequelize,Sequelize.DataTypes)

db.vaccinateur=require("./vaccinateur")(sequelize,Sequelize.DataTypes)
db.emprunteur=require("./emprunteur")(sequelize,Sequelize.DataTypes)

db.vaccinateur.hasMany(db.commande, { as: "commandes" });
db.emprunteur.hasMany(db.commande, { as: "commandes" });

db.commande.belongsTo(db.vaccinateur, {
  foreignKey: {
    key:"vaccinateurId",
    allowNull:true
  },
  as: "vaccinateur",
});

db.commande.belongsTo(db.emprunteur, {
  foreignKey: {
    key:"emprunterId",
    allowNull:true
  },
  as: "emprunter",
});
db.parametre=require("./parametre")(sequelize,Sequelize.DataTypes)
db.approvisionnement=require("./approvisionnement")(sequelize,Sequelize.DataTypes);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
