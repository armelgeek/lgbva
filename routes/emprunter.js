const { default: crud, crudify, crudifySearchFields } = require("../lib/api");
const db = require("../models");

const emprunters = crud("/emprunters", {
  ...crudify(
    db.emprunteur,
    [] // children alias
  ),
  restrict: [],
  search: crudifySearchFields(
    db.emprunteur,
    [], // children alias
    [] // field for search
  ),
});
module.exports = {
  emprunters,
};
