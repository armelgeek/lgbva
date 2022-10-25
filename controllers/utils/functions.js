// tester l'existance d'une quantité suffisante pour en cc d'un produit dans le cva
exports.canBuyCCFromCva = (product) => {
  if (product.quantityBruteCVA > 0) {
    return true;
  } else {
    if (product.quantityCCCVA > 0) {
      return true;
    } else {
      return false;
    }
  }
};
exports.cantBuyCCFromCva = (product) => {
  if (product.quantityBruteCVA <= 0) {
    if (product.quantityCCCVA > 0) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

exports.canBuyBruteFromCva = (product) => {
  if (product.quantityBruteCVA > 0) {
    return true;
  } else {
    return false;
  }
};
exports.cantBuyBruteFromCva = (product) => {
  if (product.quantityBruteCVA == 0 || product.quantityBruteCVA < 0) {
    return true;
  } else {
    return false;
  }
};
exports.cantBuyBrute = (product) => {
  return !!product.quantityBrute <= 0;
};
exports.canBuyBrute = (product) => {
  return !!product.quantityBrute > 0;
};

exports.getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC = (product) => {
  if (isBiggerThanLastQuantityCC(product))
    return product.qttByCC - product.quantityCCCVA;
  else return product.quantityCCCVA - product.qttByCC;
};
exports.minusQuantityBruteCvaWhenQttCcIsEmpty = (product) => {
  if (canBuyCCFromCva(product)) {
    product.quantityBruteCVA -= 1;
    reinitQuantityCCCva(
      product,
      product.doseDefault -
        getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product)
    );
  }
  return product;
};

exports.isBiggerThanLastQuantityCC = (product) => {
  if (product.qttByCC > product.quantityCCCVA) {
    return true;
  } else {
    return false;
  }
};
exports.isLowerThanLastQuantityCC = (product) => {
  if (product.qttByCC < product.quantityCCCVA) {
    return true;
  } else {
    return false;
  }
};
exports.isSameOfLastQuantityCC = (product) => {
  if (product.qttByCC == product.quantityCCCVA) {
    return true;
  } else {
    return false;
  }
};
const notSatisfaisanteProductCommande = (product) => {
  return (
    product.quantityCCCVA - product.qttByCC < 0 &&
    product.quantityBruteCVA - 1 - product.quantityParProduct * 1 < 0
  );
};
exports.minusQuantityCc = (product) => {
  if (product.quantityParProduct > 0) {
    if (product.qttByCC > 0) {
      if (!notSatisfaisanteProductCommande(product)) {
        if (product.quantityBruteCVA - product.quantityParProduct < 0) {
          product.quantityParProduct = product.quantityBruteCVA;
          product.quantityBruteCVA = 0;
        } else {
          product.quantityBruteCVA -= product.quantityParProduct;
        }
      }
      if (product.qttByCC >= product.doseDefault) {
        product.qttByCC = product.doseDefault;
      }
    } else {
      if (product.quantityBruteCVA - product.quantityParProduct < 0) {
        product.quantityParProduct = product.quantityBruteCVA;
        product.quantityBruteCVA = 0;
      } else {
        product.quantityBruteCVA -= product.quantityParProduct;
      }
    }
  }
  if (canBuyCCFromCva(product)) {
    if (isBiggerThanLastQuantityCC(product)) {
      if (product.quantityBruteCVA - 1 >= 0) {
        minusQuantityBruteCvaWhenQttCcIsEmpty(product);
      } else {
        product.quantityBruteCVA = 0;
        reinitQuantityCCCva(product, product.quantityCCCVA);
      }
    } else if (isSameOfLastQuantityCC(product)) {
      reinitQuantityCCCva(product, 0);
    } else if (isLowerThanLastQuantityCC(product)) {
      reinitQuantityCCCva(product, product.quantityCCCVA - product.qttByCC);
    }
  } else {
    reinitQuantityCCCva(product, 0);
  }

  return product;
};
exports.reinitQuantityCCCva = (product, value) => {
  product.quantityCCCVA = value;
  return product;
};

exports.soldAllStockCCCva = (product) => {
  product.quantityCCCVA = 0;
};
exports.resetQuantityBruteCva = (product) => {
  product.quantityBruteCVA = 0;
};

exports.handleSoldQuantityCC = (product) => {
  minusQuantityCc(product);
  return product;
};
exports.isSpecialProductHandle = (product) => {
  return !!(
    product.condml != 0 &&
    product.condsize != 0 &&
    product.qttccpvente != 0 &&
    product.prixqttccvente != 0
  );
};
exports.isBiggerThanLastCondML = (product) => {
  return !!(product.qttByCC > product.condml);
};
exports.hasCondVal = (product) => {
  return !!product.condval > 0;
};
exports.minusCondValWhenQttCcIsEmpty = (product) => {
  product.condval -= 1;
  return product;
};

exports.reinitConditionnement = (product) => {
  product.quantityCCCVA =
    product.condml -
    getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product);
  product.condval = product.condval - 1;
  return product;
};
exports.minusQuantityBruteCvaWhenQttCcCondIsEmpty = (product) => {
  if (canBuyBruteFromCva(product)) {
    product.quantityBruteCVA -= 1;
    reinitConditionnement(product);
  } else product.quantityBruteCVA = 0;
  return product;
};
const notSatifyCommande = (product) => {
  return (
    product.quantityCCCVA - product.qttByCC < 0 &&
    product.condval - 1 - product.quantityParProduct * 1 < 0
  );
};
exports.minusCondML = (product) => {
  if (hasCondVal(product)) {
    if (product.quantityParProduct > 0) {
      if (product.qttByCC > 0) {
        if (!notSatifyCommande(product)) {
          if (product.condval < product.quantityParProduct) {
            if (product.condval - product.quantityParProduct < 0) {
              if (canBuyBruteFromCva(product)) {
                product.quantityBruteCVA -= 1;
                product.condval = product.condsize - 1;
              } else {
                product.condval = 0;
              }
            } else {
              product.quantityParProduct = product.condval;
              product.condval = 0;
            }
          } else {
            product.condval -= product.quantityParProduct;
            product.quantityCCCVA -= product.qttByCC;
          }
        }
        if (product.qttByCC >= product.condml) {
          product.qttByCC = product.condml;
        }
      } else {
        product.condval -= product.quantityParProduct;
        if (product.condval < 0) {
          if (canBuyBruteFromCva(product)) {
            product.quantityBruteCVA -= 1;
            product.condval = product.condsize - 1;
          } else {
            product.condval = 0;
          }
        }
      }
    } else {
      if (isBiggerThanLastQuantityCC(product)) {
        minusCondValWhenQttCcIsEmpty(product);
        if (product.condval == 0) {
          if (canBuyBruteFromCva(product)) {
            if (
              getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product) > 0
            ) {
              product.quantityBruteCVA -= 1;
              reinitQuantityCCCva(
                product,
                product.condml -
                  getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product)
              );
              product.condval = product.condsize - 1;
            }
          }
        } else {
          reinitQuantityCCCva(
            product,
            product.condml -
              getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product)
          );
        }
      } else {
        if (isSameOfLastQuantityCC(product)) {
          return false;
        } else if (isLowerThanLastQuantityCC(product)) {
          if (canBuyCCFromCva(product))
            product.quantityCCCVA -= product.qttByCC;
          else product.quantityCCCVA = 0;
        } else {
        }
      }
    }
  } else {
    if (canBuyBruteFromCva(product)) {
      product.quantityBruteCVA -= 1;
      reinitQuantityCCCva(
        product,
        product.condml -
          getRestQuantityCCWhenOrderIsBiggerThanLastQuantityCC(product)
      );
      if (product.condval == 0) product.condval = product.condsize - 1;
    } else {
      if (canBuyCCFromCva(product)) {
        if (isBiggerThanLastQuantityCC(product)) {
          if (canBuyBruteFromCva(product)) {
            product.quantityBruteCVA -= 1;
          } else {
            reinitQuantityCCCva(product, 0);
          }
        } else if (isSameOfLastQuantityCC(product)) {
          reinitQuantityCCCva(product, 0);
        } else if (isLowerThanLastQuantityCC(product)) {
          reinitQuantityCCCva(product, product.quantityCCCVA - product.qttByCC);
        }
      } else {
        reinitQuantityCCCva(product, 0);
      }
    }
  }
  return product;
};

exports.handlePhtyoSpecific = (product) => {
  minusCondML(product);
  return product;
};
exports.handleMinusProduct = (product) => {
  if (canBuyBruteFromCva(product)) {
    product.quantityBruteCVA -= product.quantityParProduct;
  } else if (cantBuyBruteFromCva(product)) {
    product.quantityBruteCVA = 0;
  }
  return product;
};
exports.handleMinusCondML = (product) => {
  minusCondML(product);
  return product;
};
exports.resetProductData = (product, cloneProduct) => {
  Object.keys(cloneProduct).forEach(function (key) {
    if (cloneProduct[key] == 0 || cloneProduct[key] == 0) {
      cloneProduct[key] = product[key];
    }
  });
};

exports.handleSoldProduct = (product) => {
  if (canBuyBrute(product)) {
    product.quantityBrute -= product.quantityParProduct;
  } else if (cantBuyBrute(product)) {
    product.quantityBrute = 0;
  }
  return product;
};

exports.canBuy = (product) => {
  if (isSpecialProductHandle(product)) {
  }
  return true;
};

// cas normal

// 20 + reste ML > dosedefault  qttbrute +1, qttcc = dose - reste
// 1 flacon + 20 ML , 20 + reste ML > dosedefault  qttbrute +1, qttcc = dose - reste , +1
//1 flacon + 20 ML , 20 + reste ML < dosedefault  qttbrute +1, qttcc -= qttCC

// cas modification

// qttParcommande > qttactuel =  (qttParcommande - qttactuel), commande quantité - (qttParcommande - qttactuel), +(qttParcommande - qttactuel) stock
// 3 > 2 = 3 - 2 = 1, qttcommande -= 1,quantiteProduit (qttParcommande - qttactuel)
// qttParcommande < qttactuel =  (qttactuel - qttParcommande), commande quantité + (qttactuel - qttParcommande), -(qttParcommande - qttactuel) stock
// 4 < 5 = 5 - 4 = 1,qttcommande +=1 , stock + (qttParcommande - qttactuel)

// cas tikaz
// 1 vendu , 1 retour
// 100 ml, reste ML + 100 < dosedefault, reste ML + 100
//100 ml, reste ML + 100 > dosedefault, on calcue la difference qttcc, + 1 condval ( + 1 condval > 4 donc ,)
// 1 cond , 100ML ,  reste ML + 100 > dosedefault, on calcue la difference qttcc, + 1 condval +1 cond,
//  1 cond , 100ML , +1 cond,  reste ML + 100 < dosedefault,+1 cond, qttc = reste ML + 100
//

//date : 11 12 13 14 15
//qtt  : 10  9  8  7  6
//       +1
//       11   +1 + 1 +1
//       -1 -1  - 1
