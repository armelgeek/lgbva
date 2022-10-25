const {
    default: crud,
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");

const products = crud('/products',
    {
        ...crudify(db.product,
            ["fournisseur","category","sortiedepots"] // children alias
        ),
        restrict: [],
        search: crudifySearchFields(db.product,
            ["fournisseur","category","sortiedepots"], // children alias
            ["name"]  // field for search
        )
    })
module.exports = {
    products
};