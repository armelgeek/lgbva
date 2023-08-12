const { Router } = require("express");
const router = Router();
  const productController = require("../controllers/product");
  const commandeController = require("../controllers/commande");
  const approvController = require("../controllers/approv");
  const userController = require("../controllers/user");
  const sortieDepotController = require("../controllers/sortiedepot");
  const ioModule = require("../ioModule");
  const bodyParser = require("body-parser");
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  router.get("/", (req, res) => res.send("This is root!"));
  router.get(
    "/get-cmd-by-products",
    commandeController.getCommandeTdbByProducts
  );
  router.get("/get-tdb-commande", commandeController.getCommandetdb);
  router.get("/vente-correction", commandeController.getVenteCorrection);
  router.post(
    "/create-product",
    urlencodedParser,
    productController.createProduct
  );
  router.post(
    "/update-product",
    urlencodedParser,
    productController.updateProduct
  );
  router.put(
    "/update-data-product",
    urlencodedParser,
    productController.updateDataProduct
  );

  router.post(
    "/create-facture",
    urlencodedParser,
    approvController.createFacture
  );
  router.put(
    "/update-facture",
    urlencodedParser,
    approvController.updateFacture
  );
  router.delete("/delete-facture", approvController.deleteFacture);

  router.post(
    "/add-to-magasin",
    urlencodedParser,
    commandeController.addToMagasin
  );
  router.put(
    "/update-to-magasin",
    urlencodedParser,
    commandeController.updateToMagasin
  );
  router.delete("/delete-to-magasin", commandeController.deleteToMagasin);

  router.post(
    "/add-from-depot",
    urlencodedParser,
    commandeController.addFromDepot
  );
  router.put(
    "/update-from-depot",
    urlencodedParser,
    commandeController.updateFromDepot
  );
  router.delete("/delete-from-depot", commandeController.deleteFromDepot);

  router.post(
    "/add-from-magasin",
    urlencodedParser,
    commandeController.addFromMagasin
  );

  router.put(
    "/update-from-magasin",
    urlencodedParser,
    commandeController.updateFromMagasin
  );
  router.post("/delete-from-magasin", commandeController.deleteFromMagasin);

  router.get("/get-approv-by-date", approvController.approvByDate);

  router.get("/product/fournisseur", productController.getProductByFournisseur);
  router.get("/set-payer-commande", commandeController.setPayerCommande);
  router.get("/product/category", productController.getProductByCategory);
  router.get("/perimer", productController.getProductPerime);
  router.get("/entree", commandeController.getEntreeProduit);
  router.get("/sortie", commandeController.getSortieProduit);
  router.get("/rupture/stock", productController.getProductRuptureStock);
  router.get("/credit", commandeController.getCredit);
  router.get("/vente-cva", commandeController.getCommandeCVa);
  router.get("/cva", commandeController.getCVa);

  router.get("/direct", commandeController.getCommandeDirect);

  router.get("/journal", commandeController.getCommande);

  router.get("/credit-vaccinateur", commandeController.getCreditVaccinateur);
  router.get("/benefices", commandeController.beneficeEntre2Dates);
  router.get("/reste-a-payer", commandeController.resteApayerEntre2Dates);

  router.get(
    "/sortie/depot/by/product",
    sortieDepotController.getSortieDepotActual
  );
  router.get("/recette/to/day", commandeController.getCommandeToDay);
  module.exports = router;
  router.post(
    "/add-to-correction",
    urlencodedParser,
    commandeController.addToCorrection
  );
  router.post("/get-commande-bw", commandeController.getCommandeBetween2Dates);
  router.post("/update-many-commandes", commandeController.updateManyCommande);
  router.post("/update-price", commandeController.updatePrice);
  router.get("/get/today", commandeController.getCommandeByCategory);
  router.get("/sock", function (req, res) {
    const io = ioModule.getIO();
    io.emit('refresh-page');
    res.json("okay");
  });
  router.get("/credit-tdb", commandeController.getCreditTdb);
  router.get('/last-product-commande', commandeController.getLastCommandeOfProducts);
