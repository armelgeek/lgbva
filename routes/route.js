const { approvisionnements } = require("./approvisionnements");
const { categories } = require("./category");
const { commandes } = require("./commande");
const { emprunters } = require("./emprunter");
const { fournisseurs } = require("./fournisseur");
const { parametres } = require("./parametres");
const { products } = require("./product");
const { sortiedepots } = require("./sortiedepot");
const { vax } = require("./vax");
module.exports = (app) => {
  app.use("/api", [
    products,
    fournisseurs,
    categories,
    commandes,
    vax,
    approvisionnements,
    emprunters,
    parametres,
    sortiedepots
  ]);
};
