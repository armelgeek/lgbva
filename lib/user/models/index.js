module.exports = (db,sequelize,Sequelize) => {
    db.refreshToken = require("./refreshToken.model.js")(sequelize, Sequelize);

db.user = require("./user")(sequelize, Sequelize);
db.refreshToken.belongsTo(db.user, {
    foreignKey: 'userId', targetKey: 'id'
  });
  db.user.hasOne(db.refreshToken, {
    foreignKey: 'userId', targetKey: 'id'
  });
}