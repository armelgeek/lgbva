const moment = require("moment");
const _ = require("lodash");
const isSpecialProductHandle = (product) => {
  return !!(
    product.condml != 0 &&
    product.condsize != 0 &&
    product.qttccpvente != 0 &&
    product.prixqttccvente != 0
  );
};

const incrementIncrement = (realproduct, qttcc, qtt = 0) => {
  let moins = 0;
  let reste = 0;
  let dose = realproduct.doseDefault;
  let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
  if (Number(add) >= Number(dose)) {
    moins = Math.floor(add / Number(dose));
    reste = Number(qttcc) - Number(dose) * moins;
    if (realproduct.quantityCCCVA + reste >= Number(dose)) {
      let diff = realproduct.quantityCCCVA + reste - Number(dose);
      realproduct.quantityCCCVA += Number(diff);
      moins += 1;
    } else {
      realproduct.quantityCCCVA = realproduct.quantityCCCVA + reste;
    }
  } else {
    if (realproduct.quantityCCCVA + reste >= Number(dose)) {
      let diff = realproduct.quantityCCCVA + reste - Number(dose);
      realproduct.quantityCCCVA += Number(diff);
      moins += 1;
    } else {
      realproduct.quantityCCCVA = realproduct.quantityCCCVA + Number(qttcc);
    }
  }
  let x = moins + Number(qtt);
  realproduct.quantityBruteCVA += x;
};
const correctionValue = (product, diff, diffcc, diffl) => {
  product.quantityParProduct = diff;
  product.qttByCC = diffcc;
  product.qttbylitre = diffl;
};
const decrementDecrement = (realproduct, qttcc, qtt = 0) => {
  let moins = 0;
  let reste = 0;
  let dose = realproduct.doseDefault;
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
  let x = moins + Number(qtt);
  console.log(x);
  realproduct.quantityBruteCVA -= x;
};
const increment = (realproduct, qttcc=0, qtt = 0, type = "inc") => {
  var moins = 0;
  let reste = 0;
  let dose = realproduct.doseDefault;
  if (type != "decinc") {
  
    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);

    if (Number(add) >= Number(dose)) {
      moins = Math.floor(add / Number(dose));
      
      reste = Number(qttcc) - Number(dose) * moins;
      
      if (realproduct.quantityCCCVA + reste >= Number(dose)) {
        moins += 1;
        realproduct.quantityCCCVA =
          Number(realproduct.quantityCCCVA) + reste - Number(dose);
      } else {
        realproduct.quantityCCCVA = Number(realproduct.quantityCCCVA);
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
        if(!_.isNaN(realproduct.quantityCCCVA - Number(qttcc))){
          realproduct.quantityCCCVA -= Number(qttcc);
        }else{

        }
      
      }
    }
  }
  let tt = 0;
  if(_.isNaN(moins)){
    tt = qtt;
  }else{
    tt = moins + qtt;
  }
   
  if (type != "decinc") {
    realproduct.quantityBruteCVA += tt;
  } else {
    realproduct.quantityBruteCVA -= moins;
    realproduct.quantityBruteCVA += qtt;
  }
};

const incrementX = (realproduct, qttcc, qtt = 0, qttlitre, type = "inc") => {
  let moins = 0,
    moinscond = 0,
    moinslitre = 0;
  let reste = 0,
    restelitre = 0,
    restecond = 0;
  let dose = realproduct.condml;
  let condsize = realproduct.condsize;
  if (type == "mcinc") {
    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
    if (Number(add) >= Number(dose)) {
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

    let mm = Number(moins) + Number(qtt);
    if (Number(mm) >= Number(condsize)) {
      moinscond = Math.floor(mm / Number(condsize));
      restecond = Number(mm) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mm) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mm) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mm);
      }
    }
    realproduct.quantityBruteCVA += moinscond;
    realproduct.quantityBruteCVA -= qttlitre;
  } else if (type == "mdecinc") {
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
        console.log(Number(qttcc), realproduct.quantityCCCVA, diff);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }

    let mn = Number(moins);
    if (Number(mn) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mn) / Number(condsize));
      restelitre = Number(mn) - Number(condsize) * moinslitre;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(restelitre) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mn) < 0) {
        let diffcco = Number(mn) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mn);
      }
    }
    let mns = moinslitre;
    realproduct.quantityBruteCVA -= mns;

    // ajouter d'un qtt

    let mma = Number(qtt);
    if (Number(mma) >= Number(condsize)) {
      moinscond = Math.floor(mma / Number(condsize));
      restecond = Number(mma) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mma) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mma) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mma);
      }
    }
    let tt = moinscond;
    realproduct.quantityBruteCVA += tt;
    realproduct.quantityBruteCVA += qttlitre;
  } else if (type == "decinc") {
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
        console.log(Number(qttcc), realproduct.quantityCCCVA, diff);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }

    let mn = Number(moins);
    if (Number(mn) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mn) / Number(condsize));
      restelitre = Number(mn) - Number(condsize) * moinslitre;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(restelitre) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mn) < 0) {
        let diffcco = Number(mn) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mn);
      }
    }
    let mns = moinslitre;
    realproduct.quantityBruteCVA -= mns;

    // ajouter d'un qtt

    let mma = Number(qtt);
    if (Number(mma) >= Number(condsize)) {
      moinscond = Math.floor(mma / Number(condsize));
      restecond = Number(mma) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mma) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mma) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mma);
      }
    }
    let tt = moinscond;
    realproduct.quantityBruteCVA += tt;
    realproduct.quantityBruteCVA -= qttlitre;
  } else {
    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);

    if (Number(add) >= Number(dose)) {
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
        realproduct.quantityCCCVA = add - Number(dose);
      } else {
        realproduct.quantityCCCVA = add;
        console.log("ici cava", realproduct.quantityCCCVA);
      }
    }

    let mm = Number(moins) + Number(qtt);
    if (Number(mm) >= Number(condsize)) {
      moinscond = Math.floor(mm / Number(condsize));
      restecond = Number(mm) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mm) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mm) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mm);
      }
    }
    let tt = moinscond + qttlitre;
    realproduct.quantityBruteCVA += tt;
  }
};
const decrementX = (realproduct, qttcc, qtt = 0, qttlitre, type = "dec") => {
  let moins = 0,
    moinslitre = 0,
    moinscond = 0,
    reste = 0,
    restelitre = 0,
    restecond;
  let dose = realproduct.condml;
  let condsize = realproduct.condsize;
  if (type == "pcdec") {
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
        console.log(Number(qttcc), realproduct.quantityCCCVA, diff);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }

    let mn = Number(moins) + Number(qtt);
    if (Number(mn) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mn) / Number(condsize));
      restelitre = Number(mn) - Number(condsize) * moinslitre;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(restelitre) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mn) < 0) {
        let diffcco = Number(mn) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mn);
      }
    }
    realproduct.quantityBruteCVA -= moinslitre;
    realproduct.quantityBruteCVA += qttlitre;
  } else if (type == "mincdec") {
    let moins = 0,
      moinscond = 0;
    let reste = 0,
      restecond = 0;
    let dose = realproduct.condml;
    let condsize = realproduct.condsize;

    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
    if (Number(add) >= Number(dose)) {
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
    let mm = Number(moins);
    if (Number(mm) >= Number(condsize)) {
      moinscond = Math.floor(mm / Number(condsize));
      restecond = Number(mm) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mm) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mm) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mm);
      }
    }
    realproduct.quantityBruteCVA += moinscond;

    let mna = Number(qtt);
    if (Number(mna) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mna) / Number(condsize));
      restelitre = Number(mna) - Number(condsize) * moins;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(reste) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mna) < 0) {
        let diffcco = Number(mna) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mna);
      }
    }
    realproduct.quantityBruteCVA -= moinslitre;
    realproduct.quantityBruteCVA += qttlitre;
  } else if (type == "incdec") {
    // mis erreur ici:
    let moins = 0,
      moinscond = 0;
    let reste = 0,
      restecond = 0;
    let dose = realproduct.condml;
    let condsize = realproduct.condsize;

    let add = Number(realproduct.quantityCCCVA) + Number(qttcc);
    if (Number(add) >= Number(dose)) {
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
    let mm = Number(moins);
    if (Number(mm) >= Number(condsize)) {
      moinscond = Math.floor(mm / Number(condsize));
      restecond = Number(mm) - Number(condsize) * moinscond;
      if (realproduct.condval + restecond >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + restecond - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + restecond;
      }
    } else {
      if (realproduct.condval + Number(mm) >= Number(condsize)) {
        moinscond += 1;
        realproduct.condval =
          Number(realproduct.condval) + Number(mm) - Number(condsize);
      } else {
        realproduct.condval = Number(realproduct.condval) + Number(mm);
      }
    }
    realproduct.quantityBruteCVA += moinscond;

    let mna = Number(qtt);
    if (Number(mna) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mna) / Number(condsize));
      restelitre = Number(mna) - Number(condsize) * moins;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(reste) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mna) < 0) {
        let diffcco = Number(mna) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mna);
      }
    }
    realproduct.quantityBruteCVA -= moinslitre + qttlitre;
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
        console.log(Number(qttcc), realproduct.quantityCCCVA, diff);
        realproduct.quantityCCCVA = Number(dose) - Number(diff);
        moins += 1;
      } else {
        realproduct.quantityCCCVA -= Number(qttcc);
      }
    }

    let mn = Number(moins) + Number(qtt);
    if (Number(mn) >= Number(condsize)) {
      moinslitre = Math.floor(Number(mn) / Number(condsize));
      restelitre = Number(mn) - Number(condsize) * moinslitre;
      if (realproduct.condval - restelitre < 0) {
        let diffo = Number(restelitre) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffo);
        moinslitre += 1;
      } else {
        realproduct.condval = Number(realproduct.condval) - restelitre;
      }
    } else {
      if (realproduct.condval - Number(mn) < 0) {
        let diffcco = Number(mn) - Number(realproduct.condval);
        realproduct.condval = Number(condsize) - Number(diffcco);
        moinslitre += 1;
      } else {
        realproduct.condval = realproduct.condval - Number(mn);
      }
    }
    let mns = moinslitre + qttlitre;
    realproduct.quantityBruteCVA -= mns;
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
    if (Number(add) >= Number(dose)) {
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
};
exports.buy = (product) => {
  let isSpecific = false;
  if (isSpecialProductHandle(product)) {
    isSpecific = true;
    let qtt = product.quantityParProduct;
    let qttcc = product.qttByCC;
    let qttlitre = product.qttbylitre;
    let normalQtt = product.condval;
    let normalQttCC = product.quantityCCCVA;
    let condsize = product.condsize;
    let dose = product.doseDefault;
    let condml = product.condml;
    if (qttlitre > 0 && qtt == 0 && qttcc == 0) {
      product.quantityBruteCVA -= qttlitre;
      //tester le 12 avril 2022 : marche tres bien
    }
    if (qttlitre == 0 && qtt > 0 && qttcc == 0) {
      //tester le 12 avril 2022 : marche tres bien
      let moins = 0,
        reste = 0;
      if (Number(qtt) >= Number(condsize)) {
        moins = Math.floor(Number(qtt) / Number(condsize));
        reste = Number(qtt) - Number(condsize) * moins;

        if (normalQtt - reste < 0) {
          //tester le 12 avril 2022 : marche tres bien
          let diff = Number(reste) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moins += 1;
        } else {
          product.condval = normalQtt - reste;
        }
      } else {
        //tester le 12 avril 2022 : marche tres bien
        if (product.condval - Number(qtt) < 0) {
          let diff = Number(qtt) - Number(product.condval);
          let mireste = Number(condsize) - Number(diff);
          product.condval = mireste;
          moins += 1;
        } else {
          product.condval -= Number(qtt);
        }
      }
      product.quantityBruteCVA -= moins;
    }
    if (qttlitre == 0 && qtt == 0 && qttcc > 0) {
      let moins = 0,
        moinslitre = 0,
        restelitre = 0,
        reste = 0;
      if (Number(qttcc) >= Number(condml)) {
        moins = Math.floor(Number(qttcc) / Number(condml));
        reste = Number(qttcc) - Number(condml) * moins;
        if (normalQttCC - reste < 0) {
          let diff = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(condml) - Number(diff);
          moins += 1;
        } else {
          product.quantityCCCVA = normalQttCC - reste;
        }
      } else {
        //tester le 12 avril 2022 : marche tres bien
        if (Number(qttcc) >= product.quantityCCCVA) {
          moins += 1;
          let diff = Number(qttcc) - product.quantityCCCVA;
          product.quantityCCCVA = Number(condml) - diff;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }
      if (Number(moins) >= Number(condsize)) {
        moinslitre = Math.floor(Number(moins) / Number(condsize));
        restelitre = Number(moins) - Number(condsize) * restelitre;
        if (normalQtt - restelitre < 0) {
          //tester le 12 avril 2022 : marche tres bien
          let diff = Number(restelitre) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moinslitre += 1;
        } else {
          product.condval = normalQtt - restelitre;
        }
      } else {
        //tester le 12 avril 2022 : marche tres bien
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
    }

    if (qttlitre == 0 && qtt > 0 && qttcc > 0) {
      let moins = 0,
        moinslitre = 0,
        restelitre = 0,
        reste = 0;
      if (Number(qttcc) >= Number(condml)) {
        moins = Math.floor(Number(qttcc) / Number(condml));
        reste = Number(qttcc) - Number(condml) * moins;
        if (normalQttCC - reste < 0) {
          let diff = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(condml) - Number(diff);
          moins += 1;
        } else {
          // ok
          product.quantityCCCVA = Number(normalQttCC) - reste;
        }
      } else {
        // ok
        if (Number(qttcc) >= product.quantityCCCVA) {
          moins += 1;
          let diff = Number(qttcc) - product.quantityCCCVA;
          product.quantityCCCVA = Number(condml) - diff;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }
      let mm = Number(qtt) + moins;
      if (mm >= Number(condsize)) {
        moinslitre = Math.floor(mm / Number(condsize));
        restelitre = mm - Number(condsize) * moins;
        if (normalQtt - restelitre < 0) {
          let diff = Number(restelitre) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moinslitre += 1;
        } else {
          product.condval = normalQtt - restelitre;
        }
      } else {
        // a teste avant
        if (product.condval - Number(mm) < 0) {
          let diffic = Number(mm) - Number(product.condval);
          let mireste = Number(condsize) - Number(diffic);
          product.condval = mireste;
          moinslitre += 1;
        } else {
          product.condval -= Number(mm);
        }
      }
      product.quantityBruteCVA -= moinslitre;
    }

    if (qttlitre > 0 && qtt > 0 && qttcc == 0) {
      let moinslitre = 0,
        restelitre = 0;

      if (Number(qtt) >= Number(condsize)) {
        moinslitre = Math.floor(Number(qtt) / Number(condsize));
        restelitre = Number(qtt) - Number(condsize) * moinslitre;
        if (normalQtt - restelitre < 0) {
          let diff = Number(restelitre) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moinslitre += 1;
        } else {
          product.condval = normalQtt - restelitre;
        }
      } else {
        if (product.condval - Number(qtt) < 0) {
          let diffic = Number(qtt) - Number(product.condval);
          let mireste = Number(condsize) - Number(diffic);
          product.condval = mireste;
          moinslitre += 1;
        } else {
          product.condval -= Number(qtt);
        }
      }
      product.quantityBruteCVA -= moinslitre + qttlitre;
    }

    if (qttlitre > 0 && qtt == 0 && qttcc > 0) {
      let moins = 0,
        moinslitre = 0,
        restelitre = 0,
        reste = 0;
      if (Number(qttcc) >= Number(condml)) {
        moins = Math.floor(Number(qttcc) / Number(condml));
        reste = Number(qttcc) - Number(condml) * moins;
        if (normalQttCC - reste < 0) {
          let diffcc = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(condml) - Number(diffcc);
          moins += 1;
        } else {
          product.quantityCCCVA = normalQttCC - reste;
        }
      } else {
        // ok
        if (Number(qttcc) >= product.quantityCCCVA) {
          moins += 1;
          let diff = Number(qttcc) - product.quantityCCCVA;
          product.quantityCCCVA = Number(condml) - diff;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }

      if (Number(moins) >= Number(condsize)) {
        moinslitre = Math.floor(Number(moins) / Number(condsize));
        restelitre = Number(moins) - Number(condsize) * moinslitre;
        if (normalQtt - restelitre < 0) {
          let diff = Number(restelitre) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moinslitre += 1;
        } else {
          product.condval = normalQtt - reste;
        }
      } else {
        //ok
        if (product.condval - Number(moins) < 0) {
          let diff = Number(moins) - Number(product.condval);
          let mireste = Number(condsize) - Number(diff);
          product.condval = mireste;
          moinslitre += 1;
        } else {
          product.condval -= Number(moins);
        }
      }
      product.quantityBruteCVA -= moinslitre + qttlitre;
    }
    if (qttlitre > 0 && qtt > 0 && qttcc > 0) {
      let moins = 0,
        moinslitre = 0,
        restelitre = 0,
        reste = 0;
      if (Number(qttcc) >= Number(condml)) {
        moins = Math.floor(Number(qttcc) / Number(condml));
        reste = Number(qttcc) - Number(condml) * moins;
        if (normalQttCC - reste < 0) {
          let diffcc = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(condml) - Number(diffcc);
          moins += 1;
        } else {
          product.quantityCCCVA = normalQttCC - reste;
        }
      } else {
        if (Number(qttcc) >= product.quantityCCCVA) {
          moins += 1;
          let diff = Number(qttcc) - product.quantityCCCVA;
          product.quantityCCCVA = Number(condml) - diff;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }
      let mns = Number(moins) + Number(qtt);
      if (mns >= Number(condsize)) {
        moinslitre = Math.floor(mns / Number(condsize));
        restelitre = mns - Number(condsize) * moinslitre;
        if (normalQtt - restelitre < 0) {
          let diff = Number(restelitre) - Number(normalQtt);
          product.condval = Number(condsize) - Number(diff);
          moinslitre += 1;
        } else {
          product.condval = normalQtt - reste;
        }
      } else {
        if (product.condval - Number(mns) < 0) {
          let diff = Number(mns) - Number(product.condval);
          let mireste = Number(condsize) - Number(diff);
          product.condval = mireste;
          moinslitre += 1;
        } else {
          product.condval -= Number(mns);
        }
      }
      product.quantityBruteCVA -= moinslitre + qttlitre;
    }
  } else {
    let qtt = product.quantityParProduct;
    let qttcc = product.qttByCC;
    let normalQtt = product.quantityBruteCVA;
    let normalQttCC = product.quantityCCCVA;
    let dose = product.doseDefault;
    isSpecific = false;
    let isValid = true;
    if (qtt == 0 && qttcc > 0) {
      //tester le 12 avril 2022 : marche tres bien
      let moins = 0,
        reste = 0;
      if (Number(qttcc) >= Number(dose)) {
        moins = Math.floor(Number(qttcc) / Number(dose));
        reste = Number(qttcc) - Number(dose) * moins;
        if (normalQttCC - reste < 0) {
          let diff = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(dose) - Number(diff);
          moins += 1;
        } else {
          product.quantityCCCVA = Number(normalQttCC) - reste;
        }
      } else {
        // a tester avant la saisie
        if (product.quantityCCCVA - Number(qttcc) < 0) {
          let diff = Number(qttcc) - Number(product.quantityCCCVA);
          product.quantityCCCVA = Number(dose) - Number(diff);
          moins += 1;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }
      console.log(moins);
      product.quantityBruteCVA -= moins;
    }
    if (qtt > 0 && qttcc == 0) {
      //tester le 12 avril 2022 : marche tres bien
      product.quantityBruteCVA -= qtt;
    }
    if (qtt > 0 && qttcc > 0) {
      //tester le 12 avril 2022 : marche tres bien
      let moins = 0,
        reste = 0;
      if (Number(qttcc) >= Number(dose)) {
        moins = Math.floor(Number(qttcc) / Number(dose));
        reste = Number(qttcc) - Number(dose) * moins;
        if (normalQttCC - reste < 0) {
          let diff = Number(reste) - Number(normalQttCC);
          product.quantityCCCVA = Number(dose) - Number(diff);
          moins += 1;
        } else {
          product.quantityCCCVA = Number(normalQttCC) - reste;
        }
      } else {
        if (product.quantityCCCVA - Number(qttcc) < 0) {
          let diff = Number(qttcc) - Number(product.quantityCCCVA);
          product.quantityCCCVA = Number(dose) - Number(diff);
          moins += 1;
        } else {
          product.quantityCCCVA -= Number(qttcc);
        }
      }
      let x = moins + Number(qtt);
      product.quantityBruteCVA -= x;
    }
  }
  return product;
};

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

exports.modifyBuy = (
  product,
  initial,
  realproduct,
  whendelete,
  commande,
  isCorrection = false,
  correctionCommande,
  isDeleted = false
) => {
  let isSpecific = false;
  let diff = 0,
    diffcc = 0,
    diffl = 0,
    diffb = 0;
  let etat = "none";

  if (isCorrection) {
    let qttbrute =
      product.qttbybrute == 0 ? product.quantityBrute : product.qttbybrute;
    let cmdqttbrute = initial.quantityBruteCVA;
    if (qttbrute == cmdqttbrute) {
    }
    if (qttbrute > cmdqttbrute) {
      diffb = qttbrute - cmdqttbrute;
      realproduct.quantityBrute += diffb;
    }
    if (qttbrute < cmdqttbrute) {
      diffb = cmdqttbrute - qttbrute;
      realproduct.quantityBrute -= diffb;
    }
  }

  if (isSpecialProductHandle(product)) {
    isSpecific = true;

    // commande initial
    let qttpcclitre =
      product.qttbylitre == 0 ? product.quantityBruteCVA : product.qttbylitre;
    let qttp =
      product.quantityParProduct == 0
        ? product.condval
        : product.quantityParProduct;
    let qttpcc = product.qttByCC == 0 ? product.quantityCCCVA : product.qttByCC;

    let qtt = !isCorrection ? product.quantityParProduct : qttp;
    let qttcc = !isCorrection ? product.qttByCC : qttpcc;
    let qttlitre = !isCorrection ? product.qttbylitre : qttpcclitre;
    // commande initial
    let cmdqtt = !isCorrection ? initial.quantityParProduct : initial.condval;

    let cmdqttcc = !isCorrection ? initial.qttByCC : initial.quantityCCCVA;
    let cmdqttlitre = !isCorrection
      ? initial.qttbylitre
      : initial.quantityBruteCVA;

    if (qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc";
     
      if (isDeleted) {
        console.log(realproduct.quantityCCCVA);
        incrementX(
          realproduct,
          product.qttByCC,
          product.quantityParProduct,
          product.qttbylitre
        );
      }
    }
    if (qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc > cmdqttcc";
      diffcc = qttcc - cmdqttcc;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl)
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt == cmdqtt && qttcc < cmdqttcc";
      diffcc = cmdqttcc - qttcc;
      console.log(diffcc);
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl)
        : decrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
      console.log(realproduct.quantityCCCVA);
    }
    if (qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc == cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc == cmdqttcc";
      diff = qtt - cmdqtt;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl)
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        0,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc == cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc == cmdqttcc";
      diff = cmdqtt - qtt;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl)
        : decrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        0,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = qttcc - cmdqttcc;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl)
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = cmdqttcc - qttcc;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl)
        : decrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = cmdqttcc - qttcc;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl, "incdec")
        : incrementX(realproduct, diffcc, diff, diffl, "decinc");
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre == cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = qttcc - cmdqttcc;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl, "decinc")
        : decrementX(realproduct, diffcc, diff, diffl, "incdec");
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre > cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc) {
      etat = "qttlitre > cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc";
      diffl = qttlitre - cmdqttlitre;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl)
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        0,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre < cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc) {
      etat = "qttlitre < cmdqttlitre && qtt == cmdqtt && qttcc == cmdqttcc";
      diffl = cmdqttlitre - qttlitre;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl)
        : decrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        0,
        !isCorrection ? 1 : 2,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre > cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre > cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = qttcc - cmdqttcc;
      diffl = qttlitre - cmdqttlitre;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl)
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre > cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre > cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = cmdqttcc - qttcc;
      diffl = qttlitre - cmdqttlitre;
      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl, "incdec")
        : incrementX(realproduct, diffcc, diff, diffl, "decinc");

      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre > cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre > cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = qttcc - cmdqttcc;
      diffl = qttlitre - cmdqttlitre;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl, "decinc")
        : decrementX(realproduct, diffcc, diff, diffl, "incdec");

      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre > cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre > cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = cmdqttcc - qttcc;
      diffl = qttlitre - cmdqttlitre;

      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl, "mcinc")
        : decrementX(realproduct, diffcc, diff, diffl, "incdec");

      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre < cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre < cmdqttlitre && qtt > cmdqtt && qttcc > cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = qttcc - cmdqttcc;
      diffl = cmdqttlitre - qttlitre;

      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl, "pcdec")
        : incrementX(realproduct, diffcc, diff, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre < cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre < cmdqttlitre && qtt > cmdqtt && qttcc < cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = cmdqttcc - qttcc;
      diffl = cmdqttlitre - qttlitre;

      !isCorrection
        ? decrementX(realproduct, diffcc, diff, diffl, "mincdec")
        : incrementX(realproduct, diffcc, diff, diffl, "mdecinc");
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre < cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc) {
      etat = "qttlitre < cmdqttlitre && qtt < cmdqtt && qttcc > cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = qttcc - cmdqttcc;
      diffl = cmdqttlitre - qttlitre;

      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl, "mdecinc")
        : decrementX(realproduct, diffcc, diff, diffl, "mincdec");

      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        commande,
        whendelete,
        product
      );
    }
    if (qttlitre < cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc) {
      etat = "qttlitre < cmdqttlitre && qtt < cmdqtt && qttcc < cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = cmdqttcc - qttcc;
      diffl = cmdqttlitre - qttlitre;
      !isCorrection
        ? incrementX(realproduct, diffcc, diff, diffl)
        : decrementX(realproduct, diffcc, diff, diffl, "pcdec");
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        commande,
        whendelete,
        product
      );
    }
  } else {
    isSpecific = false;
    // commande actuel
    let qttp =
      product.quantityParProduct == 0
        ? product.quantityBruteCVA
        : product.quantityParProduct;
    let qttpcc = product.qttByCC == 0 ? product.quantityCCCVA : product.qttByCC;

    let qtt = !isCorrection ? product.quantityParProduct : qttp;
    let qttcc = !isCorrection ? product.qttByCC : qttpcc;

    // commande initial
    let cmdqtt = !isCorrection
      ? initial.quantityParProduct
      : initial.quantityBruteCVA;

    let cmdqttcc = !isCorrection ? initial.qttByCC : initial.quantityCCCVA;
    if (qtt > cmdqtt && qttcc == cmdqttcc) {
      etat = "qtt > cmdqtt && qttcc == cmdqttcc";
      diff = qtt - cmdqtt;
      if (!isCorrection) {
        if (realproduct.quantityBruteCVA - diff > 0) {
          realproduct.quantityBruteCVA -= diff;
        } else {
          realproduct.quantityBruteCVA = 0;
        }
      } else {
        realproduct.quantityBruteCVA += diff;
        //correctionValue(initial, diff, diffcc, diffl);
      }
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        0,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt < cmdqtt && qttcc == cmdqttcc) {
      etat = "qtt < cmdqtt && qttcc == cmdqttcc";
      diff = cmdqtt - qtt;
      if (!isCorrection) {
        realproduct.quantityBruteCVA += diff;
      } else {
        if (realproduct.quantityBruteCVA - diff > 0) {
          realproduct.quantityBruteCVA -= diff;
        } else {
          realproduct.quantityBruteCVA = 0;
        }
        //correctionValue(initial, diff, diffcc, diffl);

        correctionProduct(
          correctionCommande,
          diff,
          diffcc,
          diffl,
          !isCorrection ? 1 : 2,
          0,
          0,
          commande,
          whendelete,
          product
        );
      }
    }
    if (qtt == cmdqtt && qttcc == cmdqttcc) {
      etat = "qtt == cmdqtt && qttcc == cmdqttcc";
      if (isDeleted) {
        increment(realproduct, 0, initial.quantityParProduct);

        console.log(realproduct.quantityBruteCVA);
      }
    }

    if (qtt == cmdqtt && qttcc > cmdqttcc) {
      etat = "qtt == cmdqtt && qttcc > cmdqttcc";
      diffcc = qttcc - cmdqttcc;
      // ok
      !isCorrection
        ? decrement(realproduct, diffcc)
        : increment(realproduct, diffcc);
      //isCorrection && correctionValue(initial, diff, diffcc, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt == cmdqtt && qttcc < cmdqttcc) {
      etat = "qtt == cmdqtt && qttcc < cmdqttcc";
      diffcc = cmdqttcc - qttcc;
      // ok
      !isCorrection
        ? increment(realproduct, diffcc)
        : decrement(realproduct, diffcc);
      //   isCorrection && correctionValue(initial, diff, diffcc, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        0,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt > cmdqtt && qttcc < cmdqttcc) {
      // ok
      etat = "qtt > cmdqtt && qttcc < cmdqttcc";
      diff = qtt - cmdqtt;
      diffcc = cmdqttcc - qttcc;
      !isCorrection
        ? decrement(realproduct, diffcc, diff, "incdec")
        : increment(realproduct, diffcc, diff, "decinc");
      //isCorrection && correctionValue(initial, diff, diffcc, diffl);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt < cmdqtt && qttcc > cmdqttcc) {
      // ok - il faut tester derniere fois si le cc restant est insuffisant
      etat = "qtt < cmdqtt && qttcc > cmdqttcc";
      diff = cmdqtt - qtt;
      diffcc = qttcc - cmdqttcc;
      !isCorrection
        ? increment(realproduct, diffcc, diff, "decinc")
        : decrement(realproduct, diffcc, diff, "incdec");
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt < cmdqtt && qttcc < cmdqttcc) {
      // ok
      diff = cmdqtt - qtt;
      diffcc = cmdqttcc - qttcc;
      etat = "qtt < cmdqtt && qttcc < cmdqttcc";
      !isCorrection
        ? incrementIncrement(realproduct, diffcc, diff)
        : decrementDecrement(realproduct, diffcc, diff);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 1 : 2,
        !isCorrection ? 1 : 2,
        0,
        commande,
        whendelete,
        product
      );
    }
    if (qtt > cmdqtt && qttcc > cmdqttcc) {
      diff = qtt - cmdqtt;
      diffcc = qttcc - cmdqttcc;
      etat = "qtt > cmdqtt && qttcc > cmdqttcc";

      // ok
      !isCorrection
        ? decrementDecrement(realproduct, diffcc, diff)
        : incrementIncrement(realproduct, diffcc, diff);
      correctionProduct(
        correctionCommande,
        diff,
        diffcc,
        diffl,
        !isCorrection ? 2 : 1,
        !isCorrection ? 2 : 1,
        0,
        commande,
        whendelete,
        product
      );
    }
  }

  console.log("--------" + etat + "---------");
  console.log("--------- stock produit-------------");
  console.log("---------" + product.name + "-------------");
  if (!isSpecialProductHandle(product)) {
    console.log(
      "correction:",
      correctionCommande.correction,
      "correctiontype:",
      correctionCommande.correctiontype,
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
      correctionCommande.correctionml,
      "correctiontml:",
      correctionCommande.correctiontml,
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
      correctionCommande.correctionl,
      "correctiontl:",
      correctionCommande.correctiontl,
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
      correctionCommande.correction,
      "correctiontype:",
      correctionCommande.correctiontype,
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
      correctionCommande.correctionml,
      "correctiontype:",
      correctionCommande.correctiontml,
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
    console.log("from: litre", product.qttbylitre, "to:", initial.qttbylitre);
  }
  console.log(
    "from: qttp",
    product.quantityParProduct,
    "to:",
    initial.quantityParProduct
  );
  console.log("from: qttcc", product.qttByCC, "to:", initial.qttByCC, "cc");
  return {
    product,
    initial,
    diffb,
    realproduct,
    whendelete,
    commande,
    isCorrection,
    correctionCommande,
    isDeleted,
    isSpecific,
  };
};
