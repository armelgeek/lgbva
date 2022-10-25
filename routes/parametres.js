const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const parametres = crud('/parametres',
    {
        ...crudify(db.parametre,
            [] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.parametre,
            [], // children alias
            []  // field for search
        )
    })
module.exports = {
    parametres
};