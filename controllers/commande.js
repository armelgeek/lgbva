const db = require("../models/index");
const _ = require("lodash");
const { getPagingData } = require("../lib/api/getList");
const moment = require("moment");
const { Op } = require("sequelize");
const { sequelize } = require("../models/index");
const ioModule = require("../ioModule");
function copy(object) {
  var output, value, key;
  output = Array.isArray(object) ? [] : {};
  for (key in object) {
    value = object[key];
    output[key] = typeof value === "object" ? copy(value) : value;
  }
  return output;
}
const deduplicationList = (list) => {
  const ids = new Set();
  return list.filter((s) => {
    if (ids.has(s.id)) return false;
    ids.add(s.id);
    return true;
  });
};
const { buy, modifyBuy, correctionBuy } = require("./buy");
const isSpecialProductHandle = (product) => {
  return !!(
    product.condml != 0 &&
    product.condsize != 0 &&
    product.qttccpvente != 0 &&
    product.prixqttccvente != 0
  );
};
/**
 * debut du fonction de retour de produit
 */
const correctionProduct = (
  initialCommande,
  correction,
  correctionml,
  correctionl,
  correctiontype,
  correctiontml,
  correctiontl,
  commande,
  whendelete,
  product
) => {
  initialCommande.correction = correction;
  initialCommande.correctionml = correctionml;
  initialCommande.correctionl = correctionl;
  initialCommande.correctiontml = correctiontml;
  initialCommande.correctiontl = correctiontl;
  initialCommande.datedecorrection = moment(new Date());
  initialCommande.correctiontype = correctiontype;
  initialCommande.quantityParProduct = product.quantityParProduct;
  initialCommande.qttbylitre = product.qttbylitre;
  initialCommande.qttByCC = product.qttByCC;

  whendelete.quantityBruteCVA = Number(commande.quantityBruteCVA);
  whendelete.quantityCCCVA = Number(commande.quantityCCCVA);
  whendelete.condval = Number(commande.condval);
  whendelete.quantityParProduct = commande.quantityParProduct;
  whendelete.qttByCC = commande.qttByCC;
  whendelete.qttbylitre = commande.qttbylitre;
};
const mlSoldIncrement = (
  product,
  initialCommande,
  realproduct,
  whendelete,
  commande
) => {
  let etat = "none";
  let diff = 0;
  let diffcc = 0;
  let diffl = 0;
  if (Number(product.qttByCC) >= 0) {
    if (Number(product.quantityParProduct) >= 0) {
      if (
        Number(product.quantityParProduct) ==
        Number(initialCommande.quantityParProduct)
      ) {
        // test 1 :
        if (Number(product.qttByCC) > Number(initialCommande.qttByCC)) {
          // 19 < 20
          diffcc = Number(product.qttByCC) - Number(initialCommande.qttByCC);
          // 20 - 10 = 10
          EgalSup(initialCommande, diffcc, realproduct);
          correctionProduct(
            initialCommande,
            diff,
            diffcc,
            diffl,
            0,
            1,
            0,
            commande,
            whendelete,
            product
          );
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              decrementCond(realproduct, diffcc);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                2,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl =
                Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
              initialCommande.correctionl = diffl;
              initialCommande.qttbylitre =
                Number(initialCommande.qttbylitre) + diffl;
              if (realproduct.quantityBruteCVA - diffl > 0) {
                realproduct.quantityBruteCVA -= diffl;
              } else {
                realproduct.quantityBruteCVA = 0;
              }
              console.log(
                "same-cc-big-qtt: product.qttbylitre > initialCommande.qttbylitre"
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl = initialCommande.qttbylitre - product.qttbylitre;

              // 90 - 20 = 70
              initialCommande.correctionl = diffl;
              initialCommande.qttbylitre -= diffl;
              realproduct.quantityBruteCVA += diffl;
              console.log(
                "same-cc-big-qtt: product.qttbylitre < initialCommande.qttbylitre"
              );
            }

            /** Seul la cc qui a change le reste est toujour la meme
            SeulLeCCAChangeLeLitreEtLaQttParCommandeSupEgal(
              realproduct,
              diffcc
            ); */
          } else {
            // 10 +10 = 20
            EgalSupNotP(realproduct, diffcc, product);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              0,
              1,
              0,
              commande,
              whendelete,
              product
            );
          }
          etat = "same-cc-big-qtt";
        }
        if (product.qttByCC < initialCommande.qttByCC) {
          diffcc = initialCommande.qttByCC - product.qttByCC;
          /** EgalInf(realproduct, diffcc);
          correctionProduct(
            initialCommande,
            diff,
            diffcc,
            diffl,
            0,
            2,
            0,
            commande,
            whendelete,
            product
          ); */
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              incrementCond(realproduct, diffcc);

              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                2,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl = SupEgalSup(diffl, product, initialCommande, realproduct);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                2,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl = InfEgalEgal(diffl, initialCommande, product, realproduct);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                0,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            EgalInfoMin(realproduct, diffcc);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              0,
              1,
              0,
              commande,
              whendelete,
              product
            );
          }
          etat = "samme-cc-min-qtt";
        }

        if (product.qttByCC == initialCommande.qttByCC) {
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                0,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl = SupEgalEgalPhyto(
                initialCommande,
                diffl,
                product,
                realproduct
              );
              EgalInfoMin(initialCommande, diff, realproduct, diffcc);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                0,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl = InfEgalEgalPhyto(
                diffl,
                initialCommande,
                product,
                realproduct
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                0,
                0,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              0,
              0,
              0,
              commande,
              whendelete,
              product
            );
          }
        }
      } else if (
        initialCommande.quantityParProduct > product.quantityParProduct
      ) {
        diff = initialCommande.quantityParProduct - product.quantityParProduct;
        if (product.qttByCC > initialCommande.qttByCC) {
          diffcc = product.qttByCC - initialCommande.qttByCC;
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              EgalInfSupPhyto(realproduct, diffcc);

              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                1,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl =
                Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
              SupInfSupPhyto(
                initialCommande,
                diffl,
                product,
                realproduct,
                diffcc
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                2,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl =
                Number(initialCommande.qttbylitre) - Number(product.qttbylitre);
              InfInfSupPhyto(
                diffl,
                initialCommande,
                product,
                realproduct,
                diffcc,
                diff
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                2,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            SupSup(realproduct, diffcc, diff);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              2,
              2,
              0,
              commande,
              whendelete,
              product
            );
          }
        }
        if (product.qttByCC < initialCommande.qttByCC) {
          diffcc = initialCommande.qttByCC - product.qttByCC;
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              EgalInfInfPhyto(realproduct, product, diffcc, diff);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                1,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl = SupInfInfPhyto(
                initialCommande,
                diffl,
                product,
                realproduct,
                diffcc,
                diff
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                1,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              SupSupSupSupPhyto(
                diffl,
                initialCommande,
                product,
                realproduct,
                diffcc,
                diff
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                1,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            // 20

            InfInf(realproduct, diffcc, diff);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              1,
              1,
              0,
              commande,
              whendelete,
              product
            );
          }
        }

        if (initialCommande.qttByCC == product.qttByCC) {
          if (isSpecialProductHandle(product)) {
            EgalInfEgalPhyto(realproduct, diff);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              0,
              1,
              0,
              commande,
              whendelete,
              product
            );
          }
        }
        etat = "minus-qtt-with-cc";
      } else if (
        initialCommande.quantityParProduct < product.quantityParProduct
      ) {
        diff = product.quantityParProduct - initialCommande.quantityParProduct;
        if (initialCommande.qttByCC > product.qttByCC) {
          // 90 20

          diffcc = initialCommande.qttByCC - product.qttByCC;
          // 90 - 20 = 70
          // 20
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              EgalSupInfPhyto(realproduct, product, diffcc, diff);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                1,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl = SupSupInfPhyto(
                initialCommande,
                diffl,
                product,
                realproduct,
                diffcc
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                2,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              InfSupInfPhyto(
                diffl,
                initialCommande,
                product,
                realproduct,
                diffcc,
                diff
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                1,
                2,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            decrement(realproduct, diffcc, diff, "incdec");
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              2,
              1,
              0,
              commande,
              whendelete,
              product
            );
          }
          // 21 > 20
        } else if (initialCommande.qttByCC < product.qttByCC) {
          // 19 < 20

          diffcc = product.qttByCC - initialCommande.qttByCC;

          // 20 - 10 = 10

          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              EgalSupSupPhyto(realproduct, product, diffcc, diff);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                2,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl = SupSupSupPhyto(
                initialCommande,
                realproduct,
                product,
                diffl,
                diffcc
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                2,
                2,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl = InfSupSupPhyto(
                diffl,
                initialCommande,
                product,
                realproduct,
                diffcc,
                diff
              );
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                2,
                1,
                commande,
                whendelete,
                product
              );
            }
          } else {
            // 10 +10 = 20
            InfSup(realproduct, diffcc, diff);
            correctionProduct(
              initialCommande,
              diff,
              diffcc,
              diffl,
              2,
              2,
              0,
              commande,
              whendelete,
              product
            );
          }
          ///
        } else if (diff > 0 && initialCommande.qttByCC == product.qttByCC) {
          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
              EgaleSupEgalPhyto(realproduct, diff);
              correctionProduct(
                initialCommande,
                diff,
                diffcc,
                diffl,
                2,
                0,
                0,
                commande,
                whendelete,
                product
              );
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              //  a verifier
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              //a verifier
            }
          }
        }
      }
      /**
      
      else {

        /// ici est le farany
        if (product.quantityCCCVA >= 0) {
          if (product.qttByCC == initialCommande.qttByCC) {
            etat = "same-qtt-cc";
          }

          if (initialCommande.qttByCC > product.qttByCC) {
            etat = "minus-qtt-cc";
            // 90 20
            diffcc = initialCommande.qttByCC - product.qttByCC;
            initialCommande.qttByCC -= diffcc;
            initialCommande.datedecorrection = moment(new Date());

            initialCommande.correctionml = diffcc;
            initialCommande.correction = diff;

            if (isSpecialProductHandle(product)) {
              if (
                Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
              ) {
              } else if (
                Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
              ) {
                diffl =
                  Number(product.qttbylitre) -
                  Number(initialCommande.qttbylitre);
                initialCommande.qttbylitre =
                  Number(initialCommande.qttbylitre) + diffl;
                if (realproduct.quantityBruteCVA - diffl > 0) {
                  realproduct.quantityBruteCVA -= diffl;
                } else {
                  realproduct.quantityBruteCVA = 0;
                }
                console.log(
                  "minus-qtt-cc: product.qttbylitre > initialCommande.qttbylitre"
                );
              } else if (
                Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
              ) {
                diffl = initialCommande.qttbylitre - product.qttbylitre;
                initialCommande.correctionl = diffl;
                // 90 - 20 = 70
                initialCommande.qttbylitre -= diffl;
                realproduct.quantityBruteCVA += diffl;
                console.log(
                  "minus-qtt-cc: product.qttbylitre < initialCommande.qttbylitre"
                );
              }
            }
            if (realproduct.quantityCCCVA + diffcc > realproduct.condml) {
              realproduct.quantityBruteCVA += 1;
              realproduct.quantityCCCVA =
                realproduct.quantityCCCVA + diffcc - realproduct.condml;
            } else if (
              realproduct.quantityCCCVA + diffcc ==
              realproduct.condml
            ) {
              realproduct.quantityBruteCVA = realproduct.quantityBruteCVA + 1;
              realproduct.quantityCCCVA = 0;
            } else {
              realproduct.quantityCCCVA += diffcc;
            }
          } else {
            if (realproduct.quantityCCCVA + diffcc > realproduct.doseDefault) {
              realproduct.quantityBruteCVA += 1;
              realproduct.quantityCCCVA =
                realproduct.quantityCCCVA + diffcc - realproduct.doseDefault;
            }
            if (realproduct.quantityCCCVA + diffcc == realproduct.doseDefault) {
              realproduct.quantityBruteCVA += 1;
              realproduct.quantityCCCVA = 0;
            } else {
              realproduct.quantityCCCVA += diffcc;
            }
          }

          //initialCommande.qttByCC -= diffcc;
          //initialCommande.quantityCCCVA += diffcc;
          // 21 > 20
        }
        if (initialCommande.qttByCC < product.qttByCC) {
          // 19 < 20
          etat = "add-qtt-cc";
          diffcc = product.qttByCC - initialCommande.qttByCC;

          // 20 - 10 = 10
          initialCommande.qttByCC += diffcc;
          initialCommande.correctionml = diffcc;
          initialCommande.correction = diff;
          // 10 +10 = 20

          if (isSpecialProductHandle(product)) {
            if (
              Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
            ) {
            } else if (
              Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
            ) {
              diffl =
                Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
              initialCommande.qttbylitre =
                Number(initialCommande.qttbylitre) + diffl;
              if (realproduct.quantityBruteCVA - diffl > 0) {
                realproduct.quantityBruteCVA -= diffl;
              } else {
                realproduct.quantityBruteCVA = 0;
              }
              console.log(
                "add-qtt-cc: product.qttbylitre > initialCommande.qttbylitre"
              );
            } else if (
              Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
            ) {
              diffl = initialCommande.qttbylitre - product.qttbylitre;
              initialCommande.correctionl = diffl;
              // 90 - 20 = 70
              initialCommande.qttbylitre -= diffl;
              realproduct.quantityBruteCVA += diffl;
              console.log(
                "add-qtt-cc: product.qttbylitre < initialCommande.qttbylitre"
              );
            }

            /** if (realproduct.quantityCCCVA + diffcc > realproduct.condml) {
              // 200 + 32 > 50
              // 200 + 100 = 300 > 250
              // 50
              // + 1
              if (realproduct.condval + 1 < realproduct.condsize) {
                // 3 + 1 =
                realproduct.condval += 1;
              } else if (realproduct.condval + 1 > realproduct.condsize) {
                realproduct.quantityBruteCVA += 1;
                realproduct.condval =
                  realproduct.condsize - realproduct.condval + 1;
              } else if (realproduct.condval + 1 == realproduct.condsize) {
                realproduct.condval = realproduct.condsize;
              }   if(product.phytoqq > 0){
                  
                } 

              if (
                realproduct.quantityCCCVA + diffcc - realproduct.condml ==
                0
              ) {
                realproduct.quantityCCCVA = 0;
              } else {
                realproduct.quantityCCCVA =
                  realproduct.quantityCCCVA + diffcc - realproduct.condml;
              }
            } else {
              // 20 + 20 < 100
              realproduct.quantityCCCVA += diffcc;
            } 
          } else {
            if (realproduct.quantityCCCVA - diffcc > 0) {
              // 40 - 10 = 30
              if (realproduct.quantityCCCVA - diffcc > 0) {
                realproduct.quantityCCCVA -= diffcc;
              } else {
                realproduct.quantityCCCVA = 0;
              }
            } else {
              if (realproduct.quantityBruteCVA > 0) {
                if (diffcc - realproduct.quantityCCCVA == 0) {
                  realproduct.quantityCCCVA = 0;
                } else {
                  realproduct.quantityBruteCVA -= 1;
                  //100 + (60-59)
                  realproduct.quantityCCCVA =
                    realproduct.doseDefault -
                    (diffcc - realproduct.quantityCCCVA);
                }
              } else {
                // 40 - 40 = 0
                realproduct.quantityBruteCVA = 0;
                realproduct.quantityCCCVA = 0;
              }
            }
          }

          ///
        }
        /* if (product.quantityCCCVA + product.qttByCC > product.doseDefault) {
        //20 + reste ML > dosedefault  qttbrute +1, qttcc = quantityCCCVA + qttByCC - doseDefault
        // 90 + 20 > 100
        product.quantityBruteCVA += 1;
        product.quantityCCCVA =
          product.quantityCCCVA + product.qttByCC - product.doseDefault;
      } else {
        // 20 + 20 < 100
        product.quantityCCCVA += product.qttByCC;
      }
      }*/
    }
  }

  /**
else {
if (product.quantityParProduct >= 0) {
  if (product.quantityBruteCVA > 0) {
    if (product.quantityParProduct == initialCommande.quantityParProduct) {
      //  product.quantityBruteCVA += product.quantityParProduct;

      if (isSpecialProductHandle(product)) {
        if (
          Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
        ) {
        } else if (
          Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
        ) {
          diffl =
            Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
          initialCommande.qttbylitre =
            Number(initialCommande.qttbylitre) + diffl;
          if (realproduct.quantityBruteCVA - diffl > 0) {
            realproduct.quantityBruteCVA -= diffl;
          } else {
            realproduct.quantityBruteCVA = 0;
          }
          console.log(
            "add-qtt-cc: product.qttbylitre > initialCommande.qttbylitre"
          );
        } else if (
          Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
        ) {
          diffl = initialCommande.qttbylitre - product.qttbylitre;
          initialCommande.correctionl = diffl;
          // 90 - 20 = 70
          initialCommande.qttbylitre -= diffl;
          realproduct.quantityBruteCVA += diffl;
          console.log(
            "add-qtt-cc: product.qttbylitre < initialCommande.qttbylitre"
          );
        }
      }
      diff = 0;
      etat = "same-qtt";
    }
    if (initialCommande.quantityParProduct > product.quantityParProduct) {
      if (isSpecialProductHandle(product)) {
        if (
          Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
        ) {
        } else if (
          Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
        ) {
          diffl =
            Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
          initialCommande.qttbylitre =
            Number(initialCommande.qttbylitre) + diffl;
          if (realproduct.quantityBruteCVA - diffl > 0) {
            realproduct.quantityBruteCVA -= diffl;
          } else {
            realproduct.quantityBruteCVA = 0;
          }
          console.log(
            "add-qtt-cc: product.qttbylitre > initialCommande.qttbylitre"
          );
        } else if (
          Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
        ) {
          diffl = initialCommande.qttbylitre - product.qttbylitre;
          initialCommande.correctionl = diffl;
          // 90 - 20 = 70
          initialCommande.qttbylitre -= diffl;
          realproduct.quantityBruteCVA += diffl;
          console.log(
            "add-qtt-cc: product.qttbylitre < initialCommande.qttbylitre"
          );
        }
      }
      diff =
        initialCommande.quantityParProduct - product.quantityParProduct;
      initialCommande.quantityParProduct -= diff;
      initialCommande.correctionml = 0;
      initialCommande.correction = diff;
      realproduct.quantityBruteCVA += diff;

      etat = "minus-qtt";
    }
    if (initialCommande.quantityParProduct < product.quantityParProduct) {
      if (isSpecialProductHandle(product)) {
        if (
          Number(product.qttbylitre) == Number(initialCommande.qttbylitre)
        ) {
        } else if (
          Number(product.qttbylitre) > Number(initialCommande.qttbylitre)
        ) {
          diffl =
            Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
          initialCommande.qttbylitre =
            Number(initialCommande.qttbylitre) + diffl;
          if (realproduct.quantityBruteCVA - diffl > 0) {
            realproduct.quantityBruteCVA -= diffl;
          } else {
            realproduct.quantityBruteCVA = 0;
          }
          console.log(
            "add-qtt-cc: product.qttbylitre > initialCommande.qttbylitre"
          );
        } else if (
          Number(product.qttbylitre) < Number(initialCommande.qttbylitre)
        ) {
          diffl = initialCommande.qttbylitre - product.qttbylitre;
          initialCommande.correctionl = diffl;
          // 90 - 20 = 70
          initialCommande.qttbylitre -= diffl;
          realproduct.quantityBruteCVA += diffl;
          console.log(
            "add-qtt-cc: product.qttbylitre < initialCommande.qttbylitre"
          );
        }
      }
      diff =
        product.quantityParProduct - initialCommande.quantityParProduct;
      initialCommande.quantityParProduct += diff;
      initialCommande.correctionml = 0;
      initialCommande.correction = diff;
      if (realproduct.quantityBruteCVA - diff > 0) {
        realproduct.quantityBruteCVA -= diff;
      }
      realproduct.quantityParProduct = 0;
      // product.quantityBruteCVA -= differ;
      etat = "add-qtt";
    }
  }
}

  }
   */

  console.log("etat:", etat);
  /**console.log("--------- whendelete actuel -------------");
  console.log("cbv:", whendelete.quantityBruteCVA);
  console.log("cc :", whendelete.quantityCCCVA);
  console.log("qqtl:", whendelete.qttbylitre);
  console.log("qpp:", whendelete.quantityParProduct);

  console.log("qbcc :", whendelete.qttByCC);
**/
  console.log("--------- stock produit-------------");
  console.log("---------" + product.name + "-------------");
  if (!isSpecialProductHandle(product)) {
    console.log(
      "correction:",
      initialCommande.correction,
      "correctiontype:",
      initialCommande.correctiontype,
      "qttbrute",
      "from:",
      product.quantityBruteCVA,
      "to:",
      realproduct.quantityBruteCVA,
      "with diff:",
      diff
    );
    console.log(
      "correctionml:",
      initialCommande.correctionml,
      "correctiontml:",
      initialCommande.correctiontml,
      "qttcc",
      "from:",
      product.quantityCCCVA,
      "to:",
      realproduct.quantityCCCVA,
      "with diffcc:",
      diffcc
    );
  } else {
    console.log(
      "correctionl:",
      initialCommande.correctionl,
      "correctiontl:",
      initialCommande.correctiontl,
      "qttlitre",
      "from:",
      product.quantityBruteCVA,
      "to:",
      realproduct.quantityBruteCVA,
      "with diffl:",
      diffl
    );
    console.log(
      "correction:",
      initialCommande.correction,
      "correctiontype:",
      initialCommande.correctiontype,
      "qttbrute",
      "from:",
      product.condval,
      "to:",
      realproduct.condval,
      "with diff:",
      diff
    );
    console.log(
      "correctionml:",
      initialCommande.correctionml,
      "correctiontype:",
      initialCommande.correctiontml,
      "qttcc",
      "from:",
      product.quantityCCCVA,
      "to:",
      realproduct.quantityCCCVA,
      "with diffcc:",
      diffcc
    );
  }

  console.log("--------- commande finale stock -------------");
  if (isSpecialProductHandle(product)) {
    console.log("from:", product.qttbylitre, "to:", initialCommande.qttbylitre);
  }
  console.log(
    "from:",
    initialCommande.quantityParProduct,
    "to:",
    realproduct.quantityParProduct
  );
  console.log("from:", product.qttByCC, "to:", initialCommande.qttByCC, "cc");

  return {
    product,
    realproduct,
    whendelete,
    diff,
    diffcc,
    initialCommande,
    etat,
  };
};

const returnFromMagasin = (product, initialCommande) => {
  let diff = 0;
  if (Number(product.quantityParProduct) >= 0) {
    if (product.quantityBruteCVA > 0) {
      if (
        Number(product.quantityParProduct) ==
        Number(initialCommande.quantityParProduct)
      ) {
        //  product.quantityBruteCVA += product.quantityParProduct;
        diff = 0;
        etat = "same-qtt";
      }
      if (
        Number(initialCommande.quantityParProduct) >
        Number(product.quantityParProduct)
      ) {
        diff =
          Number(initialCommande.quantityParProduct) -
          Number(product.quantityParProduct);

        if (Number(initialCommande.quantityParProduct) - diff > 0) {
          initialCommande.quantityParProduct =
            Number(initialCommande.quantityParProduct) - diff;
        } else {
          initialCommande.quantityParProduct = 0;
        }
        initialCommande.datedecorrection = moment(new Date());
        initialCommande.correction = diff;
        etat = "minus-qtt";
      }
      if (
        Number(initialCommande.quantityParProduct) <
        Number(product.quantityParProduct)
      ) {
        diff =
          Number(product.quantityParProduct) -
          Number(initialCommande.quantityParProduct);
        initialCommande.quantityParProduct =
          Number(initialCommande.quantityParProduct) + diff;
        initialCommande.datedecorrection = moment(new Date());
        initialCommande.correction = diff;

        etat = "add-qtt";
      }
    }
  }
  return { diff, initialCommande, etat };
};

const returnToDepot = (product, initialCommande) => {
  let diff = 0;
  if (Number(product.quantityParProductDepot) >= 0) {
    if (product.quantityBrute > 0) {
      if (
        Number(product.quantityParProductDepot) ==
        Number(initialCommande.quantityParProductDepot)
      ) {
        //  product.quantityBruteCVA += product.quantityParProduct;
        diff = 0;
        etat = "same-qtt";
      }
      if (
        Number(initialCommande.quantityParProductDepot) >
        Number(product.quantityParProductDepot)
      ) {
        diff =
          Number(initialCommande.quantityParProductDepot) -
          Number(product.quantityParProductDepot);

        if (Number(initialCommande.quantityParProductDepot) - diff > 0) {
          initialCommande.quantityParProductDepot =
            Number(initialCommande.quantityParProductDepot) - diff;
        } else {
          initialCommande.quantityParProductDepot = 0;
        }
        initialCommande.datedecorrection = moment(new Date());
        initialCommande.correction = diff;
        etat = "minus-qtt";
      }
      if (
        Number(initialCommande.quantityParProductDepot) <
        Number(product.quantityParProductDepot)
      ) {
        diff =
          Number(product.quantityParProductDepot) -
          Number(initialCommande.quantityParProductDepot);
        initialCommande.quantityParProductDepot =
          Number(initialCommande.quantityParProduct) + diff;
        initialCommande.datedecorrection = moment(new Date());
        initialCommande.correction = diff;

        etat = "add-qtt";
      }
    }
  }
  return { diff, initialCommande, etat };
};

/**
 * fin de la fonction de retour de produit
 *
 */

exports.addFromMagasin = async (req, res, next) => {
  const id = Number(req.body.id);
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const emprunterId = req.body.emprunterId;
  const vaccinateurId = req.body.vaccinateurId;
  const status = req.body.status;
  const dateCom = req.body.dateCom;
  console.log(contenu);
  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(Number(c.id), {
            transaction: t,
          });
          await db.product.update(
            {
              quantityBruteCVA: c.quantityBruteCVA,
              quantityCCCVA: c.quantityCCCVA,
              condval: c.condval,
              quantityParProduct: 0,
              qttByCC: 0,
              qttyspecificmirror: 0,
              qttbylitre: 0,
            },
            { transaction: t, where: { id: Number(c.id) } }
          );
        }
      }
      await db.commande.create(
        {
          contenu: contenu,
          sorte: sorte,
          type: type,
          status: status,
          vaccinateurId: vaccinateurId,
          emprunterId: emprunterId,
          dateCom: dateCom,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Ok!!!",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
exports.updateObjectValue = (state, index, key, value) => {
  let temp_state = [...state];
  temp_state[index] = { ...temp_state[index], [key]: value };
  return temp_state;
};

exports.updateFromMagasin = async (req, res, next) => {
  const id = Number(req.body.id);
  const contenu = req.body.contenu;
  const commander = req.body.commande;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const emprunterId = req.body.emprunterId;
  const vaccinateurId = req.body.vaccinateurId;
  const exist = req.body.exist;
  const missing = req.body.missing;
  const added = req.body.added;

  await sequelize
    .transaction(async (t) => {
      let commande = await db.commande.findByPk(id, { transaction: t });
      let cmdmodif,
        addmod = [];
      if (exist.length > 0) {
        for (const ex of exist) {
          let initial = commande.contenu.find((p) => p.id == ex.id);
          let index = commande.contenu.findIndex((p) => p.id == ex.id);
          let realproduct = await db.product.findByPk(ex.id, {
            transaction: t,
          });
          let realproductx = await db.product.findByPk(ex.id, {
            transaction: t,
          });
          let realcommande = commander.find((p) => p.id == ex.id);

          let val = modifyBuy(
            ex,
            initial,
            realproduct,
            realproductx,
            commander,
            false,
            realcommande
          );
          console.log(realproduct.quantityBruteCVA);
          console.log(ex.quantityParProduct);
          console.log(realcommande.correction, realcommande.correctiontype);
          let modif = this.updateObjectValue(
            commande.contenu,
            index,
            "quantityParProduct",
            ex.quantityParProduct
          );
          let modif0 = this.updateObjectValue(
            modif,
            index,
            "qttbylitre",
            ex.qttbylitre
          );
          let modif1 = this.updateObjectValue(
            modif0,
            index,
            "qttByCC",
            ex.qttByCC
          );

          let modif2 = this.updateObjectValue(
            modif1,
            index,
            "correction",
            realcommande.correction
          );
          let modif3 = this.updateObjectValue(
            modif2,
            index,
            "correctionml",
            realcommande.correctionml
          );

          let modif4 = this.updateObjectValue(
            modif3,
            index,
            "correctiontype",
            realcommande.correctiontype
          );
          let modif5 = this.updateObjectValue(
            modif4,
            index,
            "condval",
            realcommande.condval
          );
          let modif6 = this.updateObjectValue(
            modif5,
            index,
            "correctiontml",
            realcommande.correctiontml
          );
          let modif7 = this.updateObjectValue(
            modif6,
            index,
            "correctiontl",
            realcommande.correctiontl
          );
          let modif8 = this.updateObjectValue(
            modif7,
            index,
            "correctionl",
            realcommande.correctionl
          );
          cmdmodif = this.updateObjectValue(
            modif8,
            index,
            "datedecorrection",
            realcommande.datedecorrection
          );
          await db.product.update(
            {
              quantityBruteCVA: realproduct.quantityBruteCVA,
              quantityCCCVA: realproduct.quantityCCCVA,
              condval: realproduct.condval,
            },
            {
              transaction: t,
              where: { id: Number(ex.id) },
            }
          );
        }
      }

      if (added.length > 0) {
        for (const ad of added) {
          ad.correction = ad.quantityParProduct;
          ad.correctionml = ad.qttByCC;
          ad.correctionl = ad.qttbylitre;
          ad.correctiontype = 3;
          ad.correctiontl = 3;
          ad.correctiontml = 3;
          ad.datedecorrection = moment(new Date());
          let modifval = [];
          addmod.push(ad);
          let product = await db.product.findByPk(Number(ad.id), {
            transaction: t,
          });
          modifval = buy(ad);
          await db.product.update(
            {
              quantityBruteCVA: modifval.quantityBruteCVA,
              quantityCCCVA: modifval.quantityCCCVA,
              condval: val.condval,
            },
            { transaction: t, where: { id: Number(product.id) } }
          );
        }
      }
      if (missing.length > 0) {
        for (const m of missing) {
          let product = await db.product.findByPk(Number(m.id), {
            transaction: t,
          });
          let index = commande.contenu.findIndex((p) => p.id == m.id);
          let initial = commande.contenu.find((p) => p.id == m.id);
          let realproduct = await db.product.findByPk(Number(m.id), {
            transaction: t,
          });
          let val = mlSoldIncrement(
            m,
            initial,
            realproduct,
            copy(realproduct),
            commander
          );

          let modificc = this.updateObjectValue(
            commande.contenu,
            index,
            "correction",
            m.quantityParProduct
          );

          let modificcc = this.updateObjectValue(
            modificc,
            index,
            "correctiontype",
            4
          );
          let modificccx = this.updateObjectValue(
            modificcc,
            index,
            "correctionml",
            m.qttByCC
          );
          let modiff = this.updateObjectValue(
            modificccx,
            index,
            "correctionl",
            c.qttbylitre
          );

          cmdmodif = this.updateObjectValue(
            modiff,
            index,
            "datedecorrection",
            moment(new Date())
          );
          /**await db.product.update(
            {
              quantityBruteCVA: val.whendelete.quantityBruteCVA,
              quantityCCCVA: val.whendelete.quantityCCCVA,
              condval: val.whendelete.condval,
            },
            { transaction: t, where: { id: product.id } }
          );**/
        }
      }
      await db.commande.update(
        {
          contenu: [...addmod, ...cmdmodif],
          sorte: sorte,
          type: type,
          status: status,
        },
        { transaction: t, where: { id: Number(id) } }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Modification avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
exports.updatePriceFromMagasin = async (req, res, next) => {
  const id = Number(req.body.id);
  const contenu = req.body.contenu;
  await sequelize
    .transaction(async (t) => {
      await db.commande.update(
        {
          contenu: contenu,
        },
        { transaction: t, where: { id: Number(id) } }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Modification du prix avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
exports.changeFromMagasin = async (req, res, next) => {
  const commandea = req.body.commande;
  await sequelize
    .transaction(async (t) => {
      await db.commande.update(
        {
          isdeleted: true,
          deletedat: moment(new Date("2021-01-01")),
        },
        {
          transaction: t,
          where: {
            id: commandea.id,
          },
        }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "changer avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
  //console.log(req);*/
};
exports.deleteFromMagasin = async (req, res, next) => {
  const commandea = req.body.commande;
  const commander = req.body.original;
  await sequelize
    .transaction(async (t) => {
      if (commandea.contenu.length > 0) {
        for (const c of commandea.contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });
          let index = commandea.contenu.findIndex((p) => p.id == c.id);
          let initial = commandea.contenu.find((p) => p.id == c.id);
          let realcommande = commandea.contenu.find((p) => p.id == c.id);
          let realproduct = await db.product.findByPk(c.id, {
            transaction: t,
          });
          let realproductx = await db.product.findByPk(c.id, {
            transaction: t,
          });
          let realproductxx = await db.product.findByPk(c.id, {
            transaction: t,
          });
          const val = modifyBuy(
            c,
            initial,
            realproduct,
            realproductx,
            commander.contenu,
            false,
            realproductxx,
            true
          );
          console.log("quantityParProduct", realproduct.quantityBruteCVA);
          console.log("quantityCCCVA", realproduct.quantityCCCVA);
          console.log("condval", realproduct.condval);

          await db.product.update(
            {
              quantityBruteCVA: realproduct.quantityBruteCVA,
              quantityCCCVA: realproduct.quantityCCCVA,
              condval: realproduct.condval,
            },
            { transaction: t, where: { id: c.id } }
          );
          console.log("qttb:", realproduct.quantityBruteCVA);
          console.log("qttcc:", realproduct.quantityCCCVA);
          console.log("val:", realproduct.condval);
        }
        console.log("hello");
      }
      await db.commande.update(
        {
          isdeleted: true,
          deletedat: moment(new Date()),
        },
        {
          transaction: t,
          where: {
            id: commandea.id,
          },
        }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Suppresion avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
  //console.log(req);*/
};
exports.addFromDepot = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const emprunterId = req.body.emprunterId;
  const vaccinateurId = req.body.vaccinateurId;
  const status = req.body.status;
  const dateCom = req.body.dateCom;

  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });
          await db.product.update(
            {
              quantityParProductDepot: 0,
              qttByCCDepot: 0,
              qttyspecificmirrordepot: 0,
            },
            { transaction: t, where: { id: c.id } }
          );
          await product.decrement(
            {
              quantity_brute: c.quantityParProductDepot,
            },
            { transaction: t }
          );
        }
      }
      await db.commande.create(
        {
          contenu: contenu,
          sorte: sorte,
          type: type,
          status: status,
          vaccinateurId: vaccinateurId,
          emprunterId: emprunterId,
          dateCom: dateCom,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Ok!!!",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
exports.updateFromDepot = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const dateCom = req.body.dateCom;
  const emprunterId = req.body.emprunterId;
  const vaccinateurId = req.body.vaccinateurId;
  const exist = req.body.exist;
  const missing = req.body.missing;
  const added = req.body.added;
  await sequelize
    .transaction(async (t) => {
      let commande = await db.commande.findByPk(id, { transaction: t });
      let cmdmodif,
        addmod = [];
      if (exist.length > 0) {
        for (const ex of exist) {
          let initial = commande.contenu.find((p) => p.id == ex.id);
          let index = commande.contenu.findIndex((p) => p.id == ex.id);
          let val = returnToDepot(ex, initial);

          let modific = this.updateObjectValue(
            commande.contenu,
            index,
            "quantityParProductDepot",
            val.initialCommande.quantityParProductDepot
          );
          let modificc = this.updateObjectValue(
            modific,
            index,
            "correction",
            val.initialCommande.correction
          );
          let modificcc = this.updateObjectValue(
            modificc,
            index,
            "correctiontype",
            val.initialCommande.correctiontype
          );
          cmdmodif = this.updateObjectValue(
            modificcc,
            index,
            "datedecorrection",
            val.initialCommande.datedecorrection
          );
          let product = await db.product.findByPk(ex.id, { transaction: t });
          await db.product.update(
            {
              quantityBrute: productValueDepot(
                val.etat,
                product.quantityBrute,
                val.diff
              ),
            },
            {
              transaction: t,
              where: { id: ex.id },
            }
          );
        }
      }
      if (added.length > 0) {
        for (const ad of added) {
          ad.correction = ad.quantityParProductDepot;
          ad.correctiontype = 3;
          ad.datedecorrection = moment(new Date());
          addmod.push(ad);
          let product = await db.product.findByPk(ad.id, { transaction: t });

          await db.product.update(
            {
              quantityBrute:
                Number(product.quantityBrute) -
                  Number(ad.quantityParProductDepot) >=
                0
                  ? Number(product.quantityBrute) -
                    Number(ad.quantityParProductDepot)
                  : 0,
              quantityParProduct: 0,
            },
            { transaction: t, where: { id: product.id } }
          );
        }
      }
      if (missing.length > 0) {
        for (const m of missing) {
          let product = await db.product.findByPk(m.id, { transaction: t });
          let index = commande.contenu.findIndex((p) => p.id == m.id);
          let modificc = this.updateObjectValue(
            commande.contenu,
            index,
            "correction",
            m.quantityParProductDepot
          );
          let modificcc = this.updateObjectValue(
            modificc,
            index,
            "correctiontype",
            4
          );
          cmdmodif = this.updateObjectValue(
            modificcc,
            index,
            "datedecorrection",
            moment(new Date())
          );
          await db.product.update(
            {
              quantityBrute:
                Number(product.quantityBrute) +
                Number(m.quantityParProductDepot),
              quantityParProductDepot: 0,
            },
            { transaction: t, where: { id: m.id } }
          );
        }
      }
      await db.commande.update(
        {
          contenu: [...addmod, ...cmdmodif],
          sorte: sorte,
          type: type,
          status: status,
          vaccinateurId: vaccinateurId,
          emprunterId: emprunterId,
          dateCom: dateCom,
        },
        { transaction: t, where: { id: id } }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "commande mis a jour",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};

exports.deleteFromDepot = async (req, res, next) => {
  const contenu = req.body.contenu;
  await sequelize
    .transaction(async (t) => {
      let commande = await db.commande.findByPk(Number(req.body.id), {
        transaction: t,
      });
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(Number(c.id), {
            transaction: t,
          });
          await product.increment(
            {
              quantity_brute: c.quantityParProductDepot,
            },
            { transaction: t }
          );
        }
      }
      await db.commande.update(
        {
          isdeleted: true,
          deletedat: moment(new Date()),
        },
        {
          transaction: t,
          where: {
            id: req.body.id,
          },
        }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Suppresion avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
  //console.log(req);*/
};
exports.addToMagasin = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const dateCom = req.body.dateCom;
  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });
          console.log(c.name, c.quantityParProduct);
          if (
            Number(product.quantityBrute) - Number(c.quantityParProduct) >=
            0
          ) {
            await db.product.update(
              {
                quantityBrute:
                  Number(product.quantityBrute) - Number(c.quantityParProduct),
                quantityBruteCVA:
                  Number(product.quantityBruteCVA) +
                  Number(c.quantityParProduct),
                quantityParProduct: 0,
              },
              { transaction: t, where: { id: c.id } }
            );
          } else {
            await db.product.update(
              {
                quantityBrute: 0,
                quantityParProduct: 0,
              },
              { transaction: t, where: { id: c.id } }
            );
          }
        }
      }

      await db.commande.create(
        {
          contenu: contenu,
          sorte: sorte,
          type: type,
          status: status,
          dateCom: dateCom,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Commande reussie",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
const productValue = (etat, value, diff) => {
  if (etat == "add-qtt") {
    return value + diff;
  } else if (etat == "minus-qtt") {
    return value - diff < 0 ? 0 : value - diff;
  } else {
    return value;
  }
};

const productValueDepot = (etat, value, diff) => {
  if (etat == "minus-qtt") {
    return value + diff;
  } else if (etat == "add-qtt") {
    return value - diff < 0 ? 0 : value - diff;
  } else {
    return value;
  }
};

exports.updateToMagasin = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const exist = req.body.exist;
  const missing = req.body.missing;
  const added = req.body.added;
  await sequelize
    .transaction(async (t) => {
      let commande = await db.commande.findByPk(id, { transaction: t });
      let cmdmodif,
        addmod = [];
      if (exist.length > 0) {
        for (const ex of exist) {
          let initial = commande.contenu.find((p) => p.id == ex.id);
          let index = commande.contenu.findIndex((p) => p.id == ex.id);
          let val = returnFromMagasin(ex, initial);

          let modific = this.updateObjectValue(
            commande.contenu,
            index,
            "quantityParProduct",
            val.initialCommande.quantityParProduct
          );
          let modificc = this.updateObjectValue(
            modific,
            index,
            "correction",
            val.initialCommande.correction
          );
          let modificcc = this.updateObjectValue(
            modificc,
            index,
            "correctiontype",
            val.initialCommande.correctiontype
          );
          cmdmodif = this.updateObjectValue(
            modificcc,
            index,
            "datedecorrection",
            val.initialCommande.datedecorrection
          );
          let product = await db.product.findByPk(ex.id, { transaction: t });
          await db.product.update(
            {
              quantityBruteCVA: productValue(
                val.etat,
                product.quantityBruteCVA,
                val.diff
              ),
              quantityBrute: productValueDepot(
                val.etat,
                product.quantityBrute,
                val.diff
              ),
            },
            {
              transaction: t,
              where: { id: ex.id },
            }
          );
        }
      }
      if (added.length > 0) {
        for (const ad of added) {
          ad.correction = ad.quantityParProduct;
          ad.correctiontype = 3;
          ad.datedecorrection = moment(new Date());
          addmod.push(ad);
          let product = await db.product.findByPk(ad.id, { transaction: t });

          await db.product.update(
            {
              quantityBrute:
                Number(product.quantityBrute) - Number(ad.quantityParProduct) >=
                0
                  ? Number(product.quantityBrute) -
                    Number(ad.quantityParProduct)
                  : 0,
              quantityBruteCVA:
                Number(product.quantityBruteCVA) +
                Number(ad.quantityParProduct),
              quantityParProduct: 0,
            },
            { transaction: t, where: { id: product.id } }
          );
        }
      }
      if (missing.length > 0) {
        for (const m of missing) {
          let product = await db.product.findByPk(m.id, { transaction: t });
          let index = commande.contenu.findIndex((p) => p.id == m.id);
          let modificc = this.updateObjectValue(
            commande.contenu,
            index,
            "correction",
            m.quantityParProduct
          );
          let modificcc = this.updateObjectValue(
            modificc,
            index,
            "correctiontype",
            4
          );
          cmdmodif = this.updateObjectValue(
            modificcc,
            index,
            "datedecorrection",
            moment(new Date())
          );
          await db.product.update(
            {
              quantityBrute:
                Number(product.quantityBrute) + Number(m.quantityParProduct),
              quantityBruteCVA:
                Number(product.quantityBruteCVA) -
                  Number(m.quantityParProduct) >=
                0
                  ? Number(product.quantityBruteCVA) -
                    Number(m.quantityParProduct)
                  : 0,
              quantityParProduct: 0,
            },
            { transaction: t, where: { id: m.id } }
          );
        }
      }
      await db.commande.update(
        {
          contenu: [...addmod, ...cmdmodif],
          sorte: sorte,
          type: type,
          status: status,
        },
        { transaction: t, where: { id: id } }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "commande mis a jour",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
/***
 *
 * tester le 4 janvier a 12h 40
 * ca marche a merveille,le seul hic c'est de bloquer la suppression si la quantité dans le cva
 * a deja changer depuis la deriere depot vers magasin
 */
exports.deleteToMagasin = async (req, res, next) => {
  const contenu = req.body.contenu;
  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });

          await db.product.update(
            {
              quantityBrute:
                Number(product.quantityBrute) + Number(c.quantityParProduct),
              quantityBruteCVA:
                Number(product.quantityBruteCVA) -
                  Number(c.quantityParProduct) >
                0
                  ? Number(product.quantityBruteCVA) -
                    Number(c.quantityParProduct)
                  : 0,
              quantityParProduct: 0,
            },
            { transaction: t, where: { id: c.id } }
          );
        }
      }
      await db.commande.update(
        {
          isdeleted: true,
          deletedat: moment(new Date()),
        },
        {
          transaction: t,
          where: {
            id: req.body.id,
          },
        }
      );
    })
    .then(function (result) {
      const io = ioModule.getIO();
      io.emit("refresh-data");
      res.send({
        message: "Suppresion avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
  //console.log(req);*/
};
exports.getCredit = async (req, res) => {
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: {
            status: false,
            type: ["vente-depot-credit", "credit-cva"],
          },
          include: ["emprunter"],
        })
      ),
      0,
      10000
    )
  );
};
exports.getCreditVaccinateur = async (req, res) => {
  console.log(req.query.type);
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: {
            type: "vente-depot-vaccinateur",
          },
          include: ["vaccinateur"],
        })
      ),
      0,
      10
    )
  );
};
exports.getCommandeDirect = async (req, res) => {
  console.log(req.query.type);
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: {
            type: "direct",
            //status:1
          },
          include: [],
        })
      ),
      0,
      10
    )
  );
};
exports.setPayerCommande = async (req, res) => {
  const { cId } = req.query;
  await res.respond(
    db.commande.update(
      {
        status: true,
      },
      {
        where: {
          id: cId,
        },
      }
    )
  );
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: {
            type: "credit",
            status: false,
          },
          include: ["vaccinateur", "emprunter"],
        })
      ),
      0,
      10
    )
  );
};
const calculateTotal = (arr) => {
  if (!arr || arr?.length === 0) return 0;
  let total = 0;
  arr.forEach((el) => {
    total +=
      (Number(el.prixVente) - Number(el.prixFournisseur)) *
      Number(el.quantityParProduct);
  });
  return total;
};
exports.beneficeEntre2Dates = async (req, res) => {
  let total = 0;
  var whereStatement = {};
  whereStatement.status = true;
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  if (req.query.pid) whereStatement.pid = req.query.pid;
  // eslint-disable-next-line no-undef
  const { rows, count } = (products = await res.respond(
    db.commande.findAndCountAll({
      where: whereStatement,
    })
  ));
  rows.forEach((el) => {
    total += calculateTotal(el.contenu);
  });
  res.send(
    // eslint-disable-next-line no-undef
    getPagingData(products, 0, 10, total)
  );
};

exports.resteApayerEntre2Dates = async (req, res) => {
  let total = 0;
  var whereStatement = {};
  whereStatement.status = false;
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  const { rows, count } = await res.respond(
    db.commande.findAndCountAll({
      where: whereStatement,
    })
  );
  rows.forEach((el) => {
    total += calculateTotal(el.contenu);
  });
  res.send(
    getPagingData({
      rows: [
        {
          total: total,
          count: 0,
        },
      ],
    }),
    0,
    10
  );
};

exports.getEntreeProduit = async (req, res) => {
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  whereStatement.sorte = "entree";
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: [],
        })
      ),
      0,
      1000
    )
  );
};

exports.getSortieProduit = async (req, res) => {
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  whereStatement.sorte = "sortie";
  whereStatement.type = "vente-depot";
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: [],
        })
      ),
      0,
      1000
    )
  );
};
exports.getVenteCorrection = async (req, res) => {
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  whereStatement.sorte = "sortie";
  whereStatement.type = "correction-cva";
  whereStatement.status = true;
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: ["emprunter", "vaccinateur"],
        })
      ),
      0,
      10000
    )
  );
};

exports.getCommandeCVa = async (req, res) => {
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  whereStatement.sorte = "sortie";
  whereStatement.type = req.query.type;
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: ["emprunter", "vaccinateur"],
        })
      ),
      0,
      10000
    )
  );
};

exports.getCVa = async (req, res) => {
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  whereStatement.sorte = "sortie";
  whereStatement.type = "cva";
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: ["emprunter", "vaccinateur"],
        })
      ),
      0,
      10000
    )
  );
};

exports.getCommande = async (req, res) => {
  var whereStatement = {};
  whereStatement.type = ["vente-cva", "credit-cva"];
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
        })
      ),
      0,
      10000
    )
  );
};

exports.getCommandetdb = async (req, res) => {
  var whereStatement = {};

  if (req.query.type == "vente-cva") {
    whereStatement.type = [req.query.type, "credit-cva"];
  } else {
    whereStatement.type = req.query.type;
  }
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
        })
      ),
      0,
      10000
    )
  );
};

exports.getCommandeToDay = async (req, res) => {
  var whereStatement = {};
  whereStatement.dateCom = moment(new Date());
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
          include: ["emprunter", "vaccinateur"],
        })
      ),
      0,
      10000
    )
  );
};

exports.addToMagasin = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const dateCom = req.body.dateCom;
  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });
          console.log(c.name, c.quantityParProduct);
          if (
            Number(product.quantityBrute) - Number(c.quantityParProduct) >=
            0
          ) {
            await db.product.update(
              {
                quantityBrute:
                  Number(product.quantityBrute) - Number(c.quantityParProduct),
                quantityBruteCVA:
                  Number(product.quantityBruteCVA) +
                  Number(c.quantityParProduct),
                quantityParProduct: 0,
              },
              { transaction: t, where: { id: c.id } }
            );
          } else {
            await db.product.update(
              {
                quantityBrute: 0,
                quantityParProduct: 0,
              },
              { transaction: t, where: { id: c.id } }
            );
          }
        }
      }

      await db.commande.create(
        {
          contenu: contenu,
          sorte: sorte,
          type: type,
          status: status,
          dateCom: dateCom,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      res.send({
        message: "Commande reussie",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
const handleCorrection = (c) => {
  let diff = 0,
    diffcc = 0,
    diffl = 0;
  correctiontl = 0;
  correctiontml = 0;
  correctiont = 0;
  if (isSpecialProductHandle(c)) {
    if (Number(product.qttbylitre) >= 0) {
      if (c.qttbylitre == c.quantityBruteCVA) {
        diffl = 0;
        correctiontl = 0;
      }
      if (c.qttbylitre > c.quantityBruteCVA) {
        correctiontl = 1;
        diffl = c.qttbylitre - c.quantityBruteCVA;
      }
      if (c.qttbylitre < c.quantityBruteCVA) {
        correctiontl = 2;
        diffl = c.quantityBruteCVA - c.qttbylitre;
      }
    }
  }
  if (Number(c.qttByCC) >= 0) {
    if (c.qttByCC == c.quantityCCCVA) {
      correctiontml = 0;
      diffcc = 0;
    }
    if (c.qttByCC > c.quantityCCCVA) {
      correctiontml = 1;
      diffcc = c.qttByCC - c.quantityCCCVA;
    }
    if (c.qttByCC < c.quantityCCCVA) {
      correctiontml = 2;
      diffcc = c.quantityCCCVA - c.qttByCC;
    }
  }

  if (Number(c.quantityParProduct) >= 0) {
    if (c.quantityParProduct == c.quantityBruteCVA) {
      diff = 0;
      correctiont = 0;
    }
    if (c.quantityParProduct > c.quantityBruteCVA) {
      diff = c.quantityParProduct - c.quantityBruteCVA;
      correctiont = 1;
    }
    if (c.quantityParProduct < c.quantityBruteCVA) {
      diff = c.quantityBruteCVA - c.quantityParProduct;
      correctiont = 2;
    }
  }
  return {
    content: c,
    diff: diff,
    diffcc: diffcc,
    diffl: diffl,
    correctiontl: correctiontl,
    correctiontml: correctiontml,
    correctiont: correctiont,
  };
};
exports.addToCorrection = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const commande = req.body.commande;
  const sorte = req.body.sorte;
  const type = req.body.type;
  const status = req.body.status;
  const dateCom = req.body.dateCom;

  //  console.log(contenu);

  await sequelize
    .transaction(async (t) => {
      // let commande = await db.commande.findByPk(id, { transaction: t });
      let realcom = [];
      if (contenu.length > 0) {
        for (const c of contenu) {
          let realproduct = await db.product.findByPk(c.id, {
            transaction: t,
          });
          let realproduct2 = await db.product.findByPk(c.id, {
            transaction: t,
          });
          let index = commande.findIndex((p) => p.id == c.id);
          let afterCorrection2 = await db.product.findByPk(c.id, {
            transaction: t,
          });
          let afterCorrection = await db.product.findByPk(c.id, {
            transaction: t,
          });

          const val = modifyBuy(
            c,
            realproduct2,
            realproduct,
            afterCorrection,
            commande,
            true,
            afterCorrection2
          );
          console.log(afterCorrection2);
          let modif1 = this.updateObjectValue(
            commande,
            index,
            "quantityParProduct",
            afterCorrection2.correction
          );

          let modif2 = this.updateObjectValue(
            modif1,
            index,
            "qttByCC",
            afterCorrection2.correctionml
          );
          let modif3 = this.updateObjectValue(
            modif2,
            index,
            "correctiontype",
            afterCorrection2.correctiontype
          );

          modif4 = this.updateObjectValue(
            modif3,
            index,
            "qttbylitre",
            afterCorrection2.correctionl
          );

          let modif5 = this.updateObjectValue(
            modif4,
            index,
            "condval",
            afterCorrection.condval
          );
          let modif6 = this.updateObjectValue(
            modif5,
            index,
            "correctiontml",
            afterCorrection2.correctiontml
          );
          let modif7 = this.updateObjectValue(
            modif6,
            index,
            "correctiontl",
            afterCorrection2.correctiontl
          );
          let modif8 = this.updateObjectValue(
            modif7,
            index,
            "correctionl",
            afterCorrection2.correctionl
          );
          modif9 = this.updateObjectValue(
            modif8,
            index,
            "datedecorrection",
            afterCorrection2.datedecorrection
          );
          realcom = this.updateObjectValue(
            modif9,
            index,
            "qttbybrute",
            afterCorrection2.qttbybrute
          );

          await db.product.update(
            {
              quantityBrute: c.qttbybrute == 0 ? c.quantityBrute : c.qttbybrute,
              quantityBruteCVA: isSpecialProductHandle(c)
                ? c.qttbylitre == 0
                  ? c.quantityBruteCVA
                  : c.qttbylitre
                : c.quantityParProduct == 0
                ? c.quantityBruteCVA
                : c.quantityParProduct,
              quantityCCCVA: c.qttByCC == 0 ? c.quantityCCCVA : c.qttByCC,
              condval: isSpecialProductHandle(c)
                ? c.quantityParProduct == 0
                  ? c.condval
                  : c.quantityParProduct
                : 0,
            },
            { transaction: t, where: { id: c.id } }
          );
        }
      }
      await db.commande.create(
        {
          contenu: realcom,
          sorte: sorte,
          type: type,
          status: status,
          dateCom: dateCom,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      res.send({
        message: "Commande reussie",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};
const incrementCond = (realproduct, qttcc, qtt = 0, type = "inc") => {
  let plus = 0;
  let reste = 0;
  let dose = realproduct.condml;
  let moinslitre = 0;
  let restelitre = 0;
  let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
  if (Number(add) > Number(dose)) {
    plus = Math.floor(add / Number(dose));
    reste = Number(qttcc) - Number(dose) * plus;
    if (realproduct.quantityCCCVA + reste >= Number(dose)) {
      plus += 1;
      realproduct.quantityCCCVA =
        Number(realproduct.quantityCCCVA) + reste - Number(dose);
    } else {
      realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) + reste;
    }
  } else {
    if (realproduct.quantityCCCVA + Number(qttcc) >= Number(dose)) {
      plus += 1;
      realproduct.quantityCCCVA =
        Number(realproduct.quantityCCCVA) + Number(qttcc) - Number(dose);
    } else {
      realproduct.quantityCCCVA =
        Number(realproduct.quantityCCCVA) + Number(qttcc);
    }
  }
  if (Number(plus) >= Number(condsize)) {
    moinslitre = Math.floor(Number(plus) / Number(condsize));
    restelitre = Number(plus) - Number(condsize) * restelitre;
    if (product.condval - restelitre < 0) {
      let diff = Number(restelitre) - Number(product.condval);
      product.condval = Number(condsize) - Number(diff);
      moinslitre += 1;
    } else {
      product.condval = product.condval - restelitre;
    }
  } else {
    if (product.condval - Number(moins) < 0) {
      let diff = Number(moins) - Number(product.condval);
      let mireste = Number(condsize) - Number(diff);
      product.condval = mireste;
      moinslitre += 1;
    } else {
      product.condval -= Number(moins);
    }
  }
  product.quantityBruteCVA -= moinslitre;
};
const decrementCond = (realproduct, qttcc) => {
  let moins = 0,
    reste = 0;
  let dose = realproduct.condml;
  let condsize = realproduct.condsize;
  if (Number(qttcc) >= Number(dose)) {
    moins = Math.floor(Number(qttcc) / Number(dose));
    reste = Number(qttcc) - Number(dose) * moins;
    if (realproduct.quantityCCCVA - reste < 0) {
      let diff = Number(reste) - Number(realproduct.quantityCCCVA);
      realproduct.quantityCCCVA = Number(dose) - Number(diff);
      moins += 1;
    } else {
      realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) - reste;
    }
  } else {
    if (realproduct.quantityCCCVA - Number(qttcc) < 0) {
      let diff = Number(qttcc) - Number(realproduct.quantityCCCVA);
      realproduct.quantityCCCVA = Number(dose) - Number(diff);
      moins += 1;
    } else {
      realproduct.quantityCCCVA -= Number(qttcc);
    }
  }
  if (realproduct.quantityCCCVA < 0) {
    realproduct.quantityCCCVA = 0;
  }
};
/**
 if (Number(realproduct.quantityCCCVA) + diffcc > Number(realproduct.condml)) {
  if (Number(realproduct.condval) + 1 > realproduct.condsize) {
    if (realproduct.quantityBruteCVA - 1 > 0) {
      realproduct.quantityBruteCVA -= 1;
      realproduct.condval = realproduct.condsize - 1;
    }
  } else {
    realproduct.condval = Number(realproduct.condval) + 1;
  }
  realproduct.qttbylitre = Number(product.qttbylitre);
  realproduct.quantityCCCVA =
    Number(realproduct.quantityCCCVA) + diffcc - Number(realproduct.condml);
} else {
  realproduct.qttbylitre = Number(product.qttbylitre);
  realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) + diffcc;
} 



 */
const increment = (realproduct, qttcc, qtt = 0, type = "inc") => {
  let plus = 0;
  let reste = 0;
  let dose = realproduct.doseDefault;
  let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
  if (type != "decinc") {
    if (Number(add) > Number(dose)) {
      plus = Math.floor(add / Number(dose));
      reste = Number(qttcc) - Number(dose) * plus;
      if (realproduct.quantityCCCVA + reste >= Number(dose)) {
        plus += 1;
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + reste - Number(dose);
      } else {
        realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) + reste;
      }
    } else {
      if (realproduct.quantityCCCVA + Number(qttcc) >= Number(dose)) {
        plus += 1;
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + Number(qttcc) - Number(dose);
      } else {
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + Number(qttcc);
      }
    }
  } else {
    if (Number(qttcc) >= Number(dose)) {
      moins = Math.floor(Number(qttcc) / Number(dose));
      reste = Number(qttcc) - Number(dose) * moins;
      if (realproduct.quantityCCCVA - reste < 0) {
        let diff = Number(reste) - Number(realproduct.quantityCCCVA);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) - reste;
      }
    } else {
      if (realproduct.quantityCCCVA - Number(qttcc) < 0) {
        let diff = Number(qttcc) - Number(realproduct.quantityCCCVA);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }
  }

  let tt = plus + qtt;
  if (type != "decinc") {
    realproduct.quantityBruteCVA += tt;
  } else {
    realproduct.quantityBruteCVA -= plus;
    realproduct.quantityBruteCVA += qtt;
  }
};

const decrement = (realproduct, qttcc, qtt = 0, type = "dec") => {
  let moins = 0,
    reste = 0;
  let dose = realproduct.doseDefault;

  if (type != "incdec") {
    if (Number(qttcc) >= Number(dose)) {
      moins = Math.floor(Number(qttcc) / Number(dose));
      reste = Number(qttcc) - Number(dose) * moins;
      if (realproduct.quantityCCCVA - reste < 0) {
        let diff = Number(reste) - Number(realproduct.quantityCCCVA);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) - reste;
      }
    } else {
      if (realproduct.quantityCCCVA - Number(qttcc) < 0) {
        let diff = Number(qttcc) - Number(realproduct.quantityCCCVA);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }
  } else {
    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
    if (Number(add) > Number(dose)) {
      moins = Math.floor(add / Number(dose));
      reste = Number(qttcc) - Number(dose) * moins;
      if (realproduct.quantityCCCVA + reste >= Number(dose)) {
        moins += 1;
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + reste - Number(dose);
      } else {
        realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) + reste;
      }
    } else {
      if (realproduct.quantityCCCVA + Number(qttcc) >= Number(dose)) {
        moins += 1;
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + Number(qttcc) - Number(dose);
      } else {
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + Number(qttcc);
      }
    }
  }

  if (type != "incdec") {
    let mn = moins + qtt;
    realproduct.quantityBruteCVA -= mn;
  } else {
    realproduct.quantityBruteCVA += moins;
    realproduct.quantityBruteCVA -= qtt;
  }

  if (realproduct.quantityCCCVA < 0) {
    realproduct.quantityCCCVA = 0;
  }
};

function EgalSupNotP(realproduct, qttcc) {
  decrement(realproduct, qttcc);
}

function InfSup(realproduct, diffcc, diff) {
  decrement(realproduct, diffcc, diff);
}

function InfInf(realproduct, diffcc, diff) {
  increment(realproduct, diffcc, diff);
}

function EgalInfoMin(realproduct, diffcc) {
  increment(realproduct, diffcc);
}

function InfEgalEgal(diffl, initialCommande, product, realproduct) {
  diffl = initialCommande.qttbylitre - product.qttbylitre;
  // 90 - 20 = 70
  realproduct.quantityBruteCVA += diffl;
  return diffl;
}

function SupEgalSup(diffl, product, initialCommande, realproduct) {
  diffl = Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
  initialCommande.correctionl = diffl;
  initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;
  if (realproduct.quantityBruteCVA - diffl >= 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }
  return diffl;
}

function SupSupSupSupPhyto(
  diffl,
  initialCommande,
  product,
  realproduct,
  diffcc,
  diff
) {
  InferLitre(diffl, initialCommande, product, realproduct, diffcc, diff);
  EgalInfInfPhyto(realproduct, product, diffcc, diff);
}

function SupSup(realproduct, diffcc, diff) {
  increment(realproduct, diffcc, diff, "decinc");
}

function EgalInf(realproduct, diffcc) {
  if (realproduct.quantityCCCVA - diffcc >= 0) {
    realproduct.quantityCCCVA -= diffcc;
  } else {
    if (realproduct.quantityBruteCVA - 1 > 0) {
      let difference = diffcc + realproduct.quantityCCCVA;
      realproduct.quantityBruteCVA -= 1;
      if (realproduct.doseDefault - difference >= 0) {
        realproduct.quantityCCCVA = realproduct.doseDefault - difference;
      } else {
        realproduct.quantityCCCVA = 0; // ou toute autre logique appropriée en cas de dépassement de la dose
      }
    }
  }
}

function EgalSup(initialCommande, diffcc, realproduct) {
  if (realproduct.quantityCCVA - diffcc < 0) {
    if (realproduct.quantityBruteCVA - 1 > 0) {
      realproduct.quantityBruteCVA -= 1;
      let difference = diffcc - realproduct.quantityCCVA;
      if (realproduct.doseDefault - difference >= 0) {
        realproduct.quantityCCVA = realproduct.doseDefault - difference;
      } else {
        realproduct.quantityCCVA = 0; // ou toute autre logique appropriée en cas de dépassement de la dose
      }
    }
  } else {
    realproduct.quantityCCVA -= diffcc;
  }
}

function InfInfSupPhyto(
  diffl,
  initialCommande,
  product,
  realproduct,
  diffcc,
  diff
) {
  InferLitre(diffl, initialCommande, product, realproduct, diffcc, diff);
  EgalInfSupPhyto(realproduct, diffcc);
}

function InfSupInfPhyto(
  diffl,
  initialCommande,
  product,
  realproduct,
  diffcc,
  diff
) {
  InferLitre(diffl, initialCommande, product, realproduct, diffcc, diff);
  EgalSupInfPhyto(realproduct, product, diffcc, diff);
}

function InferLitre(
  diffl,
  initialCommande,
  product,
  realproduct,
  diffcc,
  diff
) {
  diffl = initialCommande.qttbylitre - product.qttbylitre;
  if (diffl >= 0) {
    realproduct.quantityBruteCVA += diffl;
  } else {
    // Gérer le cas où diffl est négatif (à votre convenance)
    // Par exemple, réinitialiser la quantité brute à zéro ou prendre une autre action appropriée.
    realproduct.quantityBruteCVA = 0;
  }
  //etoo
}
function InfSupSupPhyto(
  diffl,
  initialCommande,
  product,
  realproduct,
  diffcc,
  diff
) {
  InferLitre(diffl, initialCommande, product, realproduct, diffcc, diff);
  EgalSupSupPhyto(realproduct, product, diffcc, diff);
  console.log(
    "add-qtt-with-cc: product.qttbylitre < initialCommande.qttbylitre 223"
  );
  return diffl;
}

function SupInfInfPhyto(
  initialCommande,
  diffl,
  product,
  realproduct,
  diffcc,
  diff
) {
  diffl = Number(product.qttbylitre) - Number(initialCommande.qttbylitre);

  if (diffl >= 0) {
    initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;
    if (realproduct.quantityBruteCVA - diffl > 0) {
      realproduct.quantityBruteCVA -= diffl;
    } else {
      realproduct.quantityBruteCVA = 0;
    }
  } else {
    initialCommande.qttbylitre = 0;
    realproduct.quantityBruteCVA = 0;
  }

  initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;
  if (realproduct.quantityBruteCVA - diffl > 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }
  let diffoc = 0;

  realproduct.qttbylitre = Number(product.qttbylitre);
  if (realproduct.quantityCCCVA + diffcc > product.condml) {
    if (realproduct.condval + 1 > realproduct.condsize) {
      diffoc += 1;
    }
  } else {
    diffoc = 0;
    realproduct.quantityCCCVA += diffcc;
  }

  if (realproduct.condval + diff + diffoc > realproduct.condsize) {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval =
        realproduct.condval + diff + diffoc - realproduct.condsize;
      if (
        realproduct.condval + diff + diffoc - realproduct.condsize >
        realproduct.condsize
      ) {
        let diffo = realproduct.condval + diff + diffoc - realproduct.condsize;
        realproduct.condval = realproduct.condsize - diffo;
      }
      realproduct.quantityBruteCVA -= 1;
      realproduct.quantityCCCVA =
        Number(realproduct.condml) -
        (diffcc - Number(realproduct.quantityCCCVA));
    } else {
      realproduct.condval = 0;
    }
  } else {
    let difdif = diff + diffoc;
    console.log(diff);
    realproduct.condval += difdif;
  }
  return diffl;
}

function SupInfSupPhyto(initialCommande, diffl, product, realproduct, diffcc) {
  initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;
  if (realproduct.quantityBruteCVA - diffl > 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }

  if (realproduct.condval + 1 > realproduct.condsize) {
    realproduct.condval = realproduct.condsize - 1;
    realproduct.quantityBruteCVA += 1;
  } else {
    realproduct.condval += 1;
  }

  if (realproduct.quantityCCCVA - diffcc > 0) {
    realproduct.quantityCCCVA -= diffcc;
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
      }
    }
  } else {
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
      realproduct.quantityCCCVA =
        Number(realproduct.condml) -
        (diffcc - Number(realproduct.quantityCCCVA));
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      }
    }
  }
  console.log(
    "minus-qtt-with-cc: product.qttbylitre > initialCommande.qttbylitre 1"
  );
  return diffl;
}

function SupSupInfPhyto(initialCommande, diffl, product, realproduct, diffcc) {
  diffl = Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
  initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;

  if (realproduct.quantityBruteCVA - diffl > 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }
  if (realproduct.quantityCCCVA + diffcc > realproduct.condml) {
    realproduct.condval += 1;
    realproduct.quantityCCCVA =
      realproduct.quantityCCCVA + diffcc - realproduct.condml;
  } else {
    realproduct.quantityCCCVA += diffcc;
  }
  if (realproduct.condval - 1 >= 0) {
    realproduct.condval -= 1;
  } else {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval = realproduct.condsize;
      realproduct.quantityBruteCVA -= 1;
    }
  }

  console.log(
    "add-qtt-with-cc: product.qttbylitre > initialCommande.qttbylitre 1"
  );
  return diffl;
}

function SupSupSupPhyto(initialCommande, realproduct, product, diffl, diffcc) {
  diffl = Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
  initialCommande.qttbylitre = Number(initialCommande.qttbylitre) + diffl;

  if (realproduct.quantityBruteCVA - diffl > 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }
  if (realproduct.quantityCCCVA - diffcc > 0) {
    realproduct.quantityCCCVA -= diffcc;
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
      }
    }
  } else {
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
      realproduct.quantityCCCVA =
        Number(realproduct.condml) -
        (diffcc - Number(realproduct.quantityCCCVA));
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      }
    }
  }
  if (realproduct.condval - 1 >= 0) {
    realproduct.condval -= 1;
  } else {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval = realproduct.condsize;
      realproduct.quantityBruteCVA -= 1;
    }
  }
  console.log(
    "add-qtt-with-cc: product.qttbylitre > initialCommande.qttbylitre 2"
  );
  return diffl;
}

function EgalInfSupPhyto(realproduct, diffcc) {
  if (realproduct.condval + 1 > realproduct.condsize) {
    realproduct.condval = realproduct.condsize - 1;
    realproduct.quantityBruteCVA += 1;
  } else {
    realproduct.condval += 1;
  }

  if (realproduct.quantityCCCVA - diffcc > 0) {
    realproduct.quantityCCCVA -= diffcc;
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
      }
    }
  } else {
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
      console.log(diffcc);
      realproduct.quantityCCCVA =
        Number(realproduct.condml) -
        (diffcc - Number(realproduct.quantityCCCVA));
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      }
    }
  }
}

function EgalSupInfPhyto(realproduct, product, diffcc, diff) {
  if (realproduct.quantityCCCVA + diffcc > realproduct.condml) {
    realproduct.condval += 1;
    realproduct.quantityCCCVA =
      realproduct.quantityCCCVA + diffcc - realproduct.condml;
  } else {
    realproduct.quantityCCCVA += diffcc;
  }
  if (realproduct.condval - 1 >= 0) {
    realproduct.condval -= 1;
  } else {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval = realproduct.condsize;
      realproduct.quantityBruteCVA -= 1;
    }
  }
}

function EgalSupSupPhyto(realproduct, product, diffcc, diff) {
  // let diffoc = 0;
  if (realproduct.condval - 1 >= 0) {
    realproduct.condval -= 1;
  } else {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval = realproduct.condsize - 1;
      realproduct.quantityBruteCVA -= 1;
    }
  }
  if (realproduct.quantityCCCVA - diffcc > 0) {
    realproduct.quantityCCCVA -= diffcc;
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
      }
    }
  } else {
    if (realproduct.condval - 1 >= 0) {
      realproduct.condval -= 1;
      realproduct.quantityCCCVA =
        Number(realproduct.condml) -
        (diffcc - Number(realproduct.quantityCCCVA));
    } else {
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      }
    }
  }
}

function EgalInfInfPhyto(realproduct, product, diffcc, diff) {
  let diffoc = 0;

  realproduct.qttbylitre = Number(product.qttbylitre);

  if (realproduct.quantityCCCVA + diffcc > product.condml) {
    if (realproduct.condval + 1 > realproduct.condsize) {
      diffoc += 1;
    }
  } else {
    diffoc = 0;
    realproduct.quantityCCCVA += diffcc;
  }

  if (realproduct.condval + diff + diffoc > realproduct.condsize) {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      let excess = realproduct.condval + diff + diffoc - realproduct.condsize;
      realproduct.condval = realproduct.condsize - excess;
      realproduct.quantityBruteCVA -= 1;
      realproduct.quantityCCCVA =
        Number(realproduct.condml) - diffcc + Number(realproduct.quantityCCCVA);
    } else {
      realproduct.condval = 0;
    }
  } else {
    realproduct.condval += diff + diffoc;
  }
}

function InfEgalEgalPhyto(diffl, initialCommande, product, realproduct) {
  diffl = initialCommande.qttbylitre - product.qttbylitre;
  initialCommande.correctionl = diffl;
  realproduct.qttbylitre = Number(product.qttbylitre);
  // 90 - 20 = 70
  if (initialCommande.qttbylitre - diffl <= 0) {
    initialCommande.qttbylitre = 0;
  } else {
    initialCommande.qttbylitre -= diffl;
  }
  realproduct.quantityBruteCVA += diffl;
  console.log(
    "product.qttByCC == initialCommande.qttByCC: product.qttbylitre < initialCommande.qttbylitre 3"
  );
  return diffl;
}

function SupEgalEgalPhyto(initialCommande, diffl, product, realproduct) {
  diffl = Number(product.qttbylitre) - Number(initialCommande.qttbylitre);
  initialCommande.correctionl = diffl;
  realproduct.qttbylitre = Number(product.qttbylitre);
  if (realproduct.quantityBruteCVA - diffl > 0) {
    realproduct.quantityBruteCVA -= diffl;
  } else {
    realproduct.quantityBruteCVA = 0;
  }
  console.log(
    "product.qttByCC == initialCommande.qttByCC: product.qttbylitre > initialCommande.qttbylitre"
  );
  return diffl;
}

function EgalInfEgalPhyto(realproduct, diff) {
  if (realproduct.condval + diff > realproduct.condsize) {
    if (realproduct.quantityBruteCVA - 1 >= 0) {
      realproduct.condval = realproduct.condsize - 1;
      realproduct.quantityBruteCVA -= 1;
    } else {
      // Gérer le cas où realproduct.quantityBruteCVA - 1 < 0
      // Ajoutez ici le code approprié pour traiter cette situation
      realproduct.quantityBruteCVA = 0;
    }
  } else {
    realproduct.condval = Number(realproduct.condval) + diff;
  }
}

function EgaleSupEgalPhyto(realproduct, diff) {
  if (realproduct.quantityBruteCVA > 0) {
    if (realproduct.condval + diff > realproduct.condsize) {
      let difference = realproduct.condval + diff;
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize;
        realproduct.quantityBruteCVA -= 1;
      } else {
        // Gérer le cas où realproduct.quantityBruteCVA - 1 < 0
        // Ajoutez ici le code approprié pour traiter cette situation
        realproduct.quantityBruteCVA = 0;
      }
    } else {
      realproduct.condval = Number(realproduct.condval) + diff;
    }
  } else {
    realproduct.quantityBruteCVA += diff;
  }
}

function SeulLaQuantiteCCDiminueEtLeLitreEtLeQttParProductEstLaMeme(
  realproduct,
  diffcc,
  product
) {
  if (Number(realproduct.quantityCCCVA) + diffcc > Number(realproduct.condml)) {
    if (Number(realproduct.condval) + 1 > realproduct.condsize) {
      if (realproduct.quantityBruteCVA - 1 > 0) {
        realproduct.quantityBruteCVA -= 1;
        realproduct.condval = realproduct.condsize - 1;
      } else {
        // Gérer le cas où realproduct.quantityBruteCVA - 1 < 0
        // Ajoutez ici le code approprié pour traiter cette situation
      }
    } else {
      realproduct.condval = Number(realproduct.condval) + 1;
    }
    realproduct.qttbylitre = Number(product.qttbylitre);
    realproduct.quantityCCCVA =
      Number(realproduct.quantityCCCVA) + diffcc - Number(realproduct.condml);
  } else {
    realproduct.qttbylitre = Number(product.qttbylitre);
    realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) + diffcc;
  }
}

function SeulLeCCAChangeLeLitreEtLaQttParCommandeSupEgal(realproduct, diffcc) {
  if (Number(realproduct.quantityCCCVA) - diffcc > 0) {
    realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA) - diffcc;
  } else {
    if (Number(realproduct.condval) > 0) {
      if (diffcc - Number(realproduct.quantityCCCVA) == 0) {
        realproduct.quantityCCCVA = 0;
        // realproduct.condval = Number(realproduct.condval) - 1;
      } else {
        if (Number(realproduct.condval) - 1 >= 0) {
          realproduct.condval = Number(realproduct.condval) - 1;
        } else {
          if (realproduct.quantityBruteCVA - 1 >= 0) {
            realproduct.condval = realproduct.condsize - 1;
            realproduct.quantityBruteCVA -= 1;
          } else {
            realproduct.quantityBruteCVA = 0;
            // Gérer le cas où realproduct.quantityBruteCVA - 1 < 0
            // Ajoutez ici le code approprié pour traiter cette situation
          }
        }
        // 100 + (60-59)
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      }
    } else {
      // 40 - 40 = 0
      if (realproduct.quantityBruteCVA - 1 >= 0) {
        realproduct.condval = realproduct.condsize - 1;
        realproduct.quantityBruteCVA -= 1;
        realproduct.quantityCCCVA =
          Number(realproduct.condml) -
          (diffcc - Number(realproduct.quantityCCCVA));
      } else {
        realproduct.condval = 0;
      }
    }
  }
}
const calculateTotalX = (arr) => {
  if (!arr || arr?.length === 0) return 0;

  const total = arr.reduce((acc, val) => acc + val, 0);

  return total;
};

const calculeTotalAvecRemise = (arr, remise) => {
  return calculateTotalX(arr) - remise;
};
function whenDeleteHandle(whendelete, realproduct, initialCommande) {
  whendelete.quantityBruteCVA = Number(realproduct.quantityBruteCVA);
  whendelete.quantityCCCVA = Number(initialCommande.quantityCCCVA);
  whendelete.condval = Number(initialCommande.condsize);
  whendelete.quantityParProduct = initialCommande.quantityParProduct;
  whendelete.qttByCC = initialCommande.qttByCC;
  whendelete.qttbylitre = initialCommande.qttbylitre;
}
exports.getCommandeBetween2Dates = async (req, res) => {
  const { id, prices, type } = req.body;
  console.log("inona", type);
  const recap = [];
  if (type != "vente-magasin") {
    console.log("mety ato");
    await sequelize.transaction(async (t) => {
      if (prices.length > 0) {
        for (const price of prices) {
          let approvs = [];
          await db.approvisionnement
            .findAndCountAll({
              where: {
                dateCom: {
                  [Op.gte]: moment(price.deb),
                  [Op.lte]: moment(price.fin),
                },
              },
            })
            .then(async ({ rows, count }) => {
              console.log("count", count);
              if (rows.length > 0) {
                for (const r of rows) {
                  let contenu = r.contenu.slice();
                  contenu.forEach((con, index) => {
                    if (con.id == id) {
                      let lp = contenu[index].prixFournisseur;
                      contenu[index].prixFournisseur =
                        price.montant == undefined ||
                        price.montant * 1 == 0 ||
                        price.montant == ""
                          ? contenu[index].prixFournisseur
                          : price.montant * 1;

                      approvs.push({
                        id: r.id,
                        lastPrice: lp,
                        newPrice:
                          price.montant == undefined ||
                          price.montant * 1 == 0 ||
                          price.montant == ""
                            ? contenu[index].prixFournisseur
                            : price.montant * 1,
                        lastPriceCC: "no",
                        lastPriceLitre: "no",
                        newPriceCC: "no",
                        newPriceLitre: "no",
                        contenu: contenu,
                        remise: r.remise,
                        createdAt: r.createdAt,
                      });
                    }
                  });
                }
              }
              if (approvs.length > 0) {
                console.log("has approvs", deduplicationList(approvs));
                let notDupl = deduplicationList(approvs);
                recap.push({
                  deb: price.deb,
                  fin: price.fin,
                  data: notDupl,
                });

                for (const com of notDupl) {
                  await db.approvisionnement.update(
                    {
                      contenu: com.contenu,
                      totalht: calculateTotalX(
                        com.contenu.map(
                          (product) =>
                            product.prixFournisseur *
                              product.quantityParProduct -
                            product.remise
                        )
                      ),
                      total: calculeTotalAvecRemise(
                        com.contenu.map(
                          (product) =>
                            product.prixFournisseur *
                              product.quantityParProduct -
                            product.remise
                        ),
                        com.remise
                      ),
                    },
                    {
                      transaction: t,
                      where: { id: com.id },
                    }
                  );
                }
              }
            })
            .catch(function (err) {
              console.log("NO!!!");
              console.log(err);
            });
        }
      }
    });
  } else {
    await sequelize.transaction(async (t) => {
      if (prices.length > 0) {
        for (const price of prices) {
          let commandes = [];
          console.log(price.deb, price.fin);
          await db.commande
            .findAndCountAll({
              where: {
                type: ["vente-cva", "credit-cva"],
                dateCom: {
                  [Op.gte]: moment(price.deb),
                  [Op.lte]: moment(price.fin),
                },
              },
            })
            .then(async ({ rows, count }) => {
              if (rows.length > 0) {
                for (const r of rows) {
                  /**  console.log('-----------debut commande--------------',r.dateCom,r.id,r.type)
                    let contenu = [...r.contenu];
                    let x = contenu.map(e => e.id);
                    let index = x.indexOf(Number(id));
                    if(index != -1){
                      console.log('x',x)
                      console.log('content',contenu[index])
  
                      commandes.push({
                        id: Number(r.id),
                        contenu: contenu[index],
                        date: r.dateCom
                      })
                    }
                    console.log('-----------fin commande--------------') */
                  let contenu = [...r.contenu];
                  contenu.forEach((con, index) => {
                    if (con.id == Number(id)) {
                      console.log("con", index, id, con.id, con);
                      let lp = contenu[index].prixVente;
                      let lpcc = contenu[index].prixParCC;
                      let lpl = contenu[index].prixlitre;
                      console.log("price", price.prixparcc);
                      contenu[index].prixVente =
                        price.montant == undefined ||
                        price.montant * 1 == 0 ||
                        price.montant == ""
                          ? contenu[index].prixVente
                          : price.montant * 1;
                      contenu[index].prixParCC =
                        price.prixparcc == undefined ||
                        price.prixparcc * 1 == 0 ||
                        price.prixparcc == ""
                          ? contenu[index].prixParCC
                          : price.prixparcc * 1;

                      contenu[index].prixlitre =
                        price.prixlitre == undefined ||
                        price.prixlitre * 1 == 0 ||
                        price.prixlitre == ""
                          ? contenu[index].prixlitre
                          : price.prixlitre * 1;
                      commandes.push({
                        id: Number(r.id),
                        lastPrice: lp,
                        lastPriceCC: lpcc,
                        lastPriceLitre: lpl,
                        newPrice:
                          price.montant == undefined ||
                          price.montant * 1 == 0 ||
                          price.montant == ""
                            ? contenu[index].prixVente
                            : price.montant * 1,
                        newPriceCC:
                          price.prixparcc == undefined ||
                          price.prixparcc * 1 == 0 ||
                          price.prixparcc == ""
                            ? contenu[index].prixParCC
                            : price.prixparcc * 1,
                        newPriceLitre:
                          price.prixlitre == undefined ||
                          price.prixlitre * 1 == 0 ||
                          price.prixlitre == ""
                            ? contenu[index].prixlitre
                            : price.prixlitre * 1,
                        contenu: contenu,
                        createdAt: r.dateCom,
                      });
                    }
                  });
                }
              }
              if (commandes.length > 0) {
                console.log("has commandes", commandes);
                let notDupl = deduplicationList(commandes);
                recap.push({
                  deb: price.deb,
                  fin: price.fin,
                  data: notDupl,
                });
                for (const com of notDupl) {
                  await db.commande.update(
                    {
                      contenu: com.contenu,
                    },
                    {
                      transaction: t,
                      where: { id: Number(com.id) },
                    }
                  );
                }
              }
            })
            .catch(function (err) {
              console.log("NO!!!");
              console.log(err);
            });
        }
      }
    });
  }

  // try {
  console.log(type);
  console.log("recap", recap);
  res.send({
    message: "Ok!!!",
    recap: recap,
  });
  /**} catch (error) {
    res.send({
      message: "Error!!!",
      commandes: [],
    });
  }**/
};
exports.getOperationCommandeCVA = async (req, res) => {
  var whereStatement = {};
  whereStatement.type = ["vente-cva", "credit-cva"];
  whereStatement.isDeleted = true;
  whereStatement.deletedat = {
    [Op.notLike]: moment("2021-01-01"),
  };
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: whereStatement,
        })
      ),
      0,
      10000
    )
  );
};

exports.getCommandeTdbByProduct = async (req, res) => {
  var whereStatement = {};
  if (req.query.type == "vente-cva") {
    whereStatement.type = [req.query.type, "credit-cva"];
  } else {
    whereStatement.type = req.query.type;
  }
  /** if (req.query.deb && req.query.fin) {
     whereStatement.dateCom = {
       [Op.gte]: moment(req.query.deb),
       [Op.lte]: moment(req.query.fin),
     };
   } */
  let { rows } = await res.respond(
    db.commande.findAndCountAll({
      where: whereStatement,
    })
  );

  res.send({
    nextId: 1,
    rows: rows,
    totalItems: 1000,
    totalPages: 100,
    currentPage: 0,
  });
};
exports.getCommandeTdbByProducts = async (req, res) => {
  var whereStatement = {};

  let cmd = [];
  whereStatement.type = ["vente-cva", "credit-cva"];
  if (req.query.deb && req.query.fin) {
    whereStatement.dateCom = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }
  let x = await res
    .respond(
      db.commande.findAndCountAll({
        where: whereStatement,
      })
    )
    .then(async ({ rows, count }) => {
      console.log("rows", rows);
      for (const r of rows) {
        let x = r.contenu.map((e) => e.id);
        let index = x.indexOf(Number(req.query.id));
        if (index != -1) {
          cmd.push({
            id: r.id,
            dateCom: r.dateCom,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            type: r.type,
            status: r.status,
            contenu: [r.contenu[index]],
          });
        }
      }
    })
    .catch(function (err) {
      console.log("NO!!!");
      console.log(err);
    });

  res.send({
    nextId: 1,
    rows: cmd,
    totalItems: 1000,
    totalPages: 100,
    currentPage: 0,
  });
};
exports.updateManyCommande = async (req, res, next) => {
  console.log("commandes", req.body.commandes);
  const { commandes } = req.body;
  if (Array.isArray(commandes)) {
    await sequelize
      .transaction(async (t) => {
        if (commandes.length > 0) {
          for (const c of commandes) {
            await db.commande.update(
              {
                contenu: c.contenu,
              },
              { transaction: t, where: { id: Number(c.id) } }
            );
          }
        }
      })
      .then(function (result) {
        res.send({
          message: "Ok!!!",
        });
      })
      .catch(function (err) {
        console.log("NO!!!");
        return next(err);
      });
  }
  /** const id = Number(req.body.id);
  const contenu = req.body.contenu;
  await sequelize
    .transaction(async (t) => {
      await db.commande.update(
        {
          contenu: contenu
        },
        { transaction: t, where: { id: Number(id) } }
      );
    })
    .then(function (result) {
      res.send({
        message: "Modification du prix avec success",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });**/
};

exports.updatePrice = async (req, res, next) => {
  const id = req.body.id;
  const dateCom = req.body.dateCom;
  console.log(id, dateCom);
  await db.commande
    .update(
      {
        dateCom: dateCom,
      },
      { where: { id: id } }
    )
    .then(function (result) {
      res.send({
        message: "prix  mis à jour",
      });
    })
    .catch(function (err) {
      console.log("une erreur s'est produite !!!");
      return next(err);
    });
};
const totalDevente = (arr) => {
  return (
    calculateTotalX(
      arr?.map((product) => {
        return isSpecialProductHandle(product)
          ? product.prixqttccvente *
              product.quantityParProduct *
              product.qttccpvente +
              product.prixVente * product.qttbylitre
          : product.prixVente * product.quantityParProduct;
      })
    ) +
    calculateTotalX(
      arr?.map((product) => {
        return product.prixParCC * product.qttByCC;
      })
    )
  );
};
exports.getCommandeByCategory = async (req, res) => {
  const { rows: categoriesList } = await db.category.findAndCountAll();
  const categories = categoriesList.map((c) => c.name);
  var whereStatement = {};

  let cmd = [];
  whereStatement.type = ["vente-cva", "credit-cva"];
  var momentDate = moment(req.query.date, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
  if (req.query.date) {
    whereStatement.dateCom = momentDate.format("YYYY-MM-DD");
  } else {
    whereStatement.dateCom = moment().format("YYYY-MM-DD");
  }

  let x = await res
    .respond(
      db.commande.findAndCountAll({
        where: whereStatement,
      })
    )
    .then(async ({ rows, count }) => {
      console.log("rows", rows);
      for (const r of rows) {
        console.log(r);
        if (r.isdeleted == null) {
          r.contenu.map((c) => cmd.push(c));
        }
      }

      const categoryTotals = categories.reduce((totals, category) => {
        const commandes = cmd.filter(
          (product) => product.category.name === category
        );
        totals.push({
          id: Math.random(100000),
          category,
          commandes: commandes,
          total: commandes.length,
          prixTotal: totalDevente(commandes),
        });
        return totals;
      }, []);
      return categoryTotals;
    })
    .catch(function (err) {
      console.log("NO!!!");
      console.log(err);
    });
  res.send({
    nextId: 1,
    rows: x,
    totalItems: 1000,
    totalPages: 100,
    currentPage: 0,
  });
};

exports.getUnPaidCredit = async (req, res) => {
  res.send(
    getPagingData(
      await res.respond(
        db.commande.findAndCountAll({
          where: {
            status: false,
            type: ["vente-depot-credit", "credit-cva"],
            dateCom: {
              [Op.gte]: moment(req.query.deb),
              [Op.lte]: moment(req.query.fin),
            },
          },
          include: ["emprunter"],
        })
      ),
      0,
      10000
    )
  );
};

exports.getCreditTdb = async (req, res) => {
  let x = await res
    .respond(
      db.commande.findAndCountAll({
        where: {
          status: false,
          type: ["vente-depot-credit", "credit-cva"],
        },
        include: ["emprunter"],
      })
    )
    .then(async ({ rows, count }) => {
      // console.log("rows", rows);
      const groupedData = {};
      for (let i = 0; i < rows.length; i++) {
        const commande = rows[i];
        const emprunterName = _.isNull(commande.emprunter)
          ? "Inconnu"
          : commande.emprunter.name.trim();

        if (!groupedData[emprunterName]) {
          groupedData[emprunterName] = {
            id: i + 1,
            emprunter: _.isNull(commande.emprunter)
              ? {
                  id: Math.random(8888),
                  name: "Inconnu",
                }
              : commande.emprunter,
            contenu: commande.contenu.map((produit) => ({
              ...produit,
              dateCom: commande.dateCom,
            })),
          };
        } else {
          groupedData[emprunterName].contenu = groupedData[
            emprunterName
          ].contenu.concat(
            commande.contenu.map((produit) => ({
              ...produit,
              dateCom: commande.dateCom,
            }))
          );
        }
      }
      const mergedData = Object.values(groupedData);
      return mergedData;
    })
    .catch(function (err) {
      console.log("NO!!!");
      console.log(err);
    });
  res.send({
    nextId: 1,
    rows: x,
    totalItems: 1000,
    totalPages: 100,
    currentPage: 0,
  });
};

exports.getLastCommandeOfProducts = async (req, res) => {
  const today = moment();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (moment(req.query.startDate, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").isSame(today)) {
    const { rows: products, count: totalCount } = await db.product.findAndCountAll();
    const totalPages = Math.ceil(totalCount / limit);
    res.send({
      nextId: 1,
      rows: products,
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } else {
    const { rows: products, count: totalCount } = await db.product.findAndCountAll({
      limit: limit,
      offset: offset,
    });
    const totalPages = Math.ceil(totalCount / limit);
    const momentDate = moment(req.query.startDate, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    const results = [];

    const searchCommande = async (startDate, product) => {
      let productFound = false; // Variable de contrôle pour indiquer si le produit a été trouvé

      const commandes = await db.commande.findAndCountAll({
        where: {
          type: ["vente-cva", "credit-cva"],
          dateCom: {
            [Op.lte]: startDate,
          },
        },
        order: [['dateCom', 'DESC']]
      });

      if (commandes.count > 0 && !productFound) {
        for (const r of commandes.rows) {
          const contenu = [...r.contenu];
          const found = contenu.find((con) => con.id === Number(product.id));
          if (found) {
            results.push({
              dateCom: moment(r.dateCom).format('DD MMMM YYYY'), // Formater la dateCom selon le format "jour mois année"
              ...found,
            });
            productFound = true; // Le produit a été trouvé, on met à jour la variable de contrôle
            break; // Sortir de la boucle une fois que le produit est trouvé
          }
        }
      }

      const previousDay = startDate.clone().subtract(1, 'day');
      if (!productFound && previousDay.isSameOrAfter(moment().startOf('day'))) {
        searchCommande(previousDay, product); // Recherche récursive uniquement si le produit n'a pas encore été trouvé et que la date précédente est supérieure ou égale à aujourd'hui
      }

      // Si aucun produit n'a été trouvé, ajouter le produit à `results` avec les valeurs par défaut
      if (!productFound) {
        results.push({
          dateCom: "N/A",
          id: product.id,
          name: product.name,
          type: product.type,
          condml: product.condml,
          remise: product.remise,
          condval: product.condval,
          datePer: product.datePer,
          qttByCC: product.qttByCC,
          category: product.category,
          condsize: product.condsize,
          createdAt: product.createdAt,
          prixParCC: product.prixParCC,
          prixVente: product.prixVente,
          prixlitre: product.prixlitre,
          refSortie: product.refSortie,
          updatedAt: product.updatedAt,
          categoryId: product.categoryId,
          correction: product.correction,
          qttbybrute: product.qttbybrute,
          qttbylitre: product.qttbylitre,
          quantityCC: product.quantityCC,
          condmldepot: product.condmldepot,
          correctionl: product.correctionl,
          doseDefault: product.doseDefault,
          fournisseur: product.fournisseur,
          qttccpvente: product.qttccpvente,
          refQtSortie: product.refQtSortie,
          uniteMesure: product.uniteMesure,
          condvaldepot: product.condvaldepot,
          correctionml: product.correctionml,
          correctiontl: product.correctiontl,
          qttByCCDepot: product.qttByCCDepot,
          sortiedepots: product.sortiedepots,
          condsizedepot: product.condsizedepot,
          correctiontml: product.correctiontml,
          fournisseurId: product.fournisseurId,
          quantityBrute: product.quantityBrute,
          quantityCCCVA: product.quantityCCCVA,
          correctiontype: product.correctiontype,
          prixqttccvente: product.prixqttccvente,
          conditionnement: product.conditionnement,
          doseRestantEnMg: product.doseRestantEnMg,
          prixFournisseur: product.prixFournisseur,
          prixVaccinateur: product.prixVaccinateur,
          datedecorrection: product.datedecorrection,
          qttccpventedepot: product.qttccpventedepot,
          quantityBruteCVA: product.quantityBruteCVA,
          remisePerProduct: product.remisePerProduct,
          qttyspecificmirror: product.qttyspecificmirror,
          quantityParProduct: product.quantityParProduct,
          prixqttccventedepot: product.prixqttccventedepot,
          quantityParProductDepot: product.quantityParProductDepot
        });

      }
    };


    for (const product of products) {
      await searchCommande(momentDate, product);
    }

    const totalItems = totalCount; // Le nombre total d'éléments
    const currentPage = page; // La page actuelle
    res.send({
      nextId: 1,
      rows: results,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: currentPage,
    });
  }
};

