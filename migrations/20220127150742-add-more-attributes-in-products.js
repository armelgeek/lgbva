"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
  Add altering commands here.
 Return a promise to correctly handle asynchronicity.

 Example:
  return queryInterface.createTable('users', { id: 
  Sequelize.INTEGER });
*/
    return Promise.all([
      queryInterface.addColumn("products", "qttByCCDepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "condmldepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "condvaldepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "qttccpventedepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "prixqttccventedepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "quantityParProductDepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "condsizedepot", Sequelize.INTEGER),
      
      /*  queryInterface.removeColumn(
        'Users',
        'email',
         Sequelize.STRING
          )*/
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
 Add reverting commands here.
  Return a promise to correctly handle asynchronicity.

   Example:
    return queryInterface.dropTable('users');
*/
    return queryInterface.dropTable("products");
  },
};
