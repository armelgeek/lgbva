const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const sortiedepots = crud('/sortiedepots',
    {
        ...crudify(db.sortiedepot,
            [] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.sortiedepot,
            [], // children alias
            []  // field for search
        )
    })
module.exports = {
    sortiedepots
};