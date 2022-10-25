const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const approvisionnements = crud('/approvis',
    {
        ...crudify(db.approvisionnement,
            [] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.approvisionnement,
            [], // children alias
            []  // field for search
        )
    })
module.exports = {
    approvisionnements
};