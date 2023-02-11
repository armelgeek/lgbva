const { Router } = require("express");
const router = Router();
const productController = require("../controllers/product");
const commandeController = require("../controllers/commande");
const approvController = require("../controllers/approv");
const userController = require("../controllers/user");
const sortieDepotController = require("../controllers/sortiedepot");
const authConfig = require("../config/auth.config")
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.get("/", (req, res) => res.send("This is root!"));
router.get('/status', (req, res, next) => res.sendStatus(200));
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.get("/create-admin", userController.createAdmin);
/**router.use((req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(403).send({
          success: false,
          rows: [],
          error: "Failed to authenticate token.",
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      rows: [],
      error: "No token provided.",
    });
  }
});**/
router.get("/get-tdb-commande", commandeController.getCommandetdb);
router.get("/get-tdb-by-product", commandeController.getCommandeTdbByProduct);

router.get("/get-cmd-by-products", commandeController.getCommandeTdbByProducts);
router.get("/vente-correction", commandeController.getVenteCorrection);
router.post("/create-product",urlencodedParser, productController.createProduct);
router.post("/update-product",urlencodedParser, productController.updateProduct);
router.put("/update-data-product",urlencodedParser, productController.updateDataProduct);

router.post("/create-facture",urlencodedParser, approvController.createFacture);
router.put("/update-facture",urlencodedParser, approvController.updateFacture);
router.delete("/delete-facture", approvController.deleteFacture);

router.post("/add-to-magasin",urlencodedParser, commandeController.addToMagasin);
router.put("/update-to-magasin",urlencodedParser, commandeController.updateToMagasin);
router.delete("/delete-to-magasin", commandeController.deleteToMagasin);

router.post("/add-from-depot",urlencodedParser, commandeController.addFromDepot);
router.put("/update-from-depot", urlencodedParser,commandeController.updateFromDepot);
router.delete("/delete-from-depot", commandeController.deleteFromDepot);

router.post("/add-from-magasin",urlencodedParser, commandeController.addFromMagasin);
router.put("/update-from-magasin",urlencodedParser, commandeController.updateFromMagasin);
router.put("/update-price-from-magasin",urlencodedParser, commandeController.updatePriceFromMagasin);
router.post("/delete-from-magasin", commandeController.deleteFromMagasin);
router.post("/change-from-magasin", commandeController.changeFromMagasin);

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
router.get("/operation-vente-cva", commandeController.getOperationCommandeCVA);
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
router.post("/add-to-correction",urlencodedParser,commandeController.addToCorrection);
router.post("/get-commande-bw",commandeController.getCommandeBetween2Dates);
router.post("/update-many-commandes",commandeController.updateManyCommande);
router.post("/update-price",commandeController.updatePrice);
module.exports = router;
