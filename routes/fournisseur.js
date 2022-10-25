const { default: crud, crudify, crudifySearchFields } = require("../lib/api");
const db = require("../models");

const fournisseurs = crud("/fournisseurs", {
  ...crudify(
    db.fournisseur,
    [] // children alias
  ),
  restrict: [],
  search: crudifySearchFields(
    db.fournisseur,
    [], // children alias
    [] // field for search
  ),
});
module.exports = {
  fournisseurs,
};
