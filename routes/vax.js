const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const vax = crud('/vaccinateurs',
    {
        ...crudify(db.vaccinateur,
            [] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.vaccinateur,
            [], // children alias
            []  // field for search
        )
    })
module.exports = {
    vax
};