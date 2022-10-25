const db = require("../models/index.js");
const Product = require("../models/product.js");
const convertisseur = require("./utils/Convertisseur");
const moment = require("moment");
const { Op } = require("sequelize");
const { getPagingData } = require("../lib/api/getList/index.js");
const setDoseRestant = (q, cc = 0, uniteMesure, dose) => {
  let doseRestant,
    ccRestant = 0;
  switch (uniteMesure) {
    case "u":
      doseRestant = q;
      break;
    case "l":
      doseRestant = convertisseur.lToMg(dose) * q;
      break;
    case "ml":
      doseRestant = convertisseur.MlToMg(dose) * q;
      break;
    case "kg":
      doseRestant = convertisseur.kgToMg(dose) * q;
      break;
    case "g":
      doseRestant = convertisseur.gToMg(dose) * q;
      break;
    default:
      doseRestant = dose * q;
      break;
  }
  if (ccRestant != 0) ccRestant = convertisseur.CCToMg(cc) * 1;
  return {
    doseRestant: doseRestant,
    ccRestant: ccRestant,
  };
};
const getQuantityByUniteMesure = (
  uniteMesure,
  doseRestant,
  ccRestant,
  doseDefault
) => {
  let doseNormal;
  const doseTotal = Number(doseRestant) + Number(ccRestant);
  switch (uniteMesure) {
    case "u":
      doseNormal = doseRestant;
      break;
    case "l":
      doseNormal = convertisseur.lToMg(doseDefault);
      break;
    case "ml":
      doseNormal = convertisseur.MlToMg(doseDefault);
      break;
    case "kg":
      doseNormal = convertisseur.kgToMg(doseDefault);
      break;
    case "g":
      doseNormal = convertisseur.gToMg(doseDefault);
      break;
    default:
      doseNormal = doseDefault;
      break;
  }
  const qttCC = Number(doseTotal) % Number(doseNormal);
  const quantityBrute = Math.floor(doseTotal / doseNormal, 1);
  return {
    qttCC,
    quantityBrute,
  };
};

exports.createProduct = async (req, res) => {
  const {
    name,
    type,
    doseDefault,
    prixVente,
    prixFournisseur,
    prixVaccinateur,
    categoryId,
    quantityParProduct,
    fournisseurId,
    prixParCC,
    datePer,
    uniteMesure,
    qttByCC,
    newStockBrute,
    newStockCC,
  } = req.body;
  const productName = (
    name
  ).toUpperCase();
  const { doseRestant, ccRestant } = setDoseRestant(
    newStockBrute,
    newStockCC,
    uniteMesure,
    doseDefault
  );
  console.log(doseRestant);
  const { qttCC, quantityBrute } = getQuantityByUniteMesure(
    uniteMesure,
    doseRestant,
    ccRestant,
    doseDefault
  );
  
  const newProduct= await res.respond(
      db.product.create({
      name: productName,
      prixVente: prixVente,
      prixFournisseur: prixFournisseur,
      prixVaccinateur: prixVaccinateur,
      categoryId: categoryId,
      fournisseurId: fournisseurId,
      type: type,
      uniteMesure: uniteMesure,
      quantityParProduct: quantityParProduct,
      doseDefault: doseDefault,
      doseRestantEnMg: Number(doseRestant) + Number(ccRestant),
      qttByCC: qttByCC,
      datePer: datePer,
      quantityBrute: quantityBrute,
      prixParCC: prixParCC,
      quantityCC: qttCC,
    })
  );
};

exports.updateProduct = async (req, res) => {
  const { productId, newStockBrute, newStockCC } = req.body;
  const product = await res.respond(
    db.product.findOne({
      where: {
        id: productId,
      },
    })
  );
  const { doseRestant, ccRestant } = setDoseRestant(
    newStockBrute,
    newStockCC,
    product.uniteMesure,
    product.doseDefault
  );
  const { qttCC, quantityBrute } = getQuantityByUniteMesure(
    product.uniteMesure,
    doseRestant,
    ccRestant,
    product.doseDefault
  );

  res.promise(
    await db.product.update(
      {
        doseRestantEnMg:
          Number(product.doseRestantEnMg) +
          Number(Number(doseRestant) + Number(ccRestant)),
        quantityBrute: Number(product.quantityBrute) + Number(quantityBrute),
        quantityCC: Number(product.quantityCC) + Number(qttCC),
      },
      {
        where: {
          id: productId,
        },
      }
    )
  );
};



exports.getProductPerime = async (req, res) => {
  const data = await res.respond(db.parametre.findOne({
    where:{
      id:1
    }
  }));
  res.send(
    getPagingData(
      await res.respond(
        db.product.findAndCountAll({
          where: {
            datePer: {
              [Op.lte]: moment().add(data.nb_mois || 3, "M"),
            },
          },
        })
      ),
      0,
      10
    )
  );
};
exports.getProductRuptureStock = async (req, res) => {
  const data = await res.respond(db.parametre.findOne({
    where:{
      id:1
    }
  }));
  res.send(
    getPagingData(
      await res.respond(
        db.product.findAndCountAll({
          where: {
            quantityBrute: {
              [Op.lte]: data.nb_produits || 10,
            },
          },
        })
      ),
      0,
      10
    )
  );
};

exports.getProductByFournisseur = async (req, res) => {
  res.send(
    getPagingData(
      await res.respond(
        db.product.findAndCountAll({
          where: {
            fournisseurId: req.query.id,
          },
          include: ["fournisseur"],
        })
      ),
      0,
      10
    )
  );
};
exports.getProductByCategory = async (req, res) => {
  res.send(
    getPagingData(
      await res.respond(
        db.product.findAndCountAll({
          where: {
            categoryId: req.query.id,
          },
          include: ["category"],
        })
      ),
      0,
      10
    )
  );
};
exports.updateDataProduct = async (req, res) => {
  const {
    id,
    name,
    type,
    doseDefault,
    prixVente,
    prixFournisseur,
    prixVaccinateur,
    categoryId,
    fournisseurId,
    prixParCC,
    datePer,
    uniteMesure,
    qttByCC,
  } = req.body;

  const product = await res.respond(
    db.product.findOne({
      where: {
        id: id,
      },
    })
  );

  const productName = (
    name +
    " " +
    doseDefault +
    " " +
    uniteMesure
  ).toUpperCase();
  const { doseRestant, ccRestant } = setDoseRestant(
    product.quantityBrute,
    product.quantityCC,
    product.uniteMesure,
    product.doseDefault
  );
  console.log(doseRestant, ccRestant);
  const { qttCC, quantityBrute } = getQuantityByUniteMesure(
    product.uniteMesure,
    doseRestant,
    ccRestant,
    product.doseDefault
  );
  await res.respond(
     db.product.update(
      {
        name: name,
        type: type,
        doseDefault: doseDefault,
        prixVente: prixVente,
        prixFournisseur: prixFournisseur,
        prixVaccinateur: prixVaccinateur,
        categoryId: categoryId,
        fournisseurId: fournisseurId,
        prixParCC: prixParCC,
        datePer: datePer,
        uniteMesure: uniteMesure,
        qttByCC: qttByCC,
        doseRestantEnMg: Number(Number(doseRestant) + Number(ccRestant)),
        quantityBrute: Number(quantityBrute),
        quantityCC: Number(qttCC),
      },
      {
        where: {
          id: id,
        },
      }
    )
  );
  res.send(
    getPagingData(
      await res.respond(
        db.product.findAndCountAll({
          where: {
            id: id,
          },
          include: ["category","fournisseur"],
        })
      ),
      0,
      10
    )
  );
};
