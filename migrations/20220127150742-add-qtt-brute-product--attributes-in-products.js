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
      queryInterface.removeColumn(
        "products",
        "quantityParProductDepot",
        Sequelize.FLOAT
      ),
      queryInterface.addColumn(
        "products",
        "quantity_par_product_depot",
        Sequelize.FLOAT
      ),
      queryInterface.removeColumn("products", "qttByCCDepot", Sequelize.FLOAT),
      queryInterface.addColumn("products", "qtt_by_c_c_depot", Sequelize.FLOAT),

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
