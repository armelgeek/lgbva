'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Parametre', [{
        nb_mois: 3,
        nb_produit: 5
      }], {

      });
  },

  down: async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('Parametre', null, {});

  }
};
