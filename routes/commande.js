const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const commandes = crud('/commandes',
    {
        ...crudify(db.commande,
            ["vaccinateur","emprunter"] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.commande,
            [], // children alias
            []  // field for search
        )
    })
module.exports = {
    commandes
};