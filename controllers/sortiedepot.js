const db = require("../models/index.js");
const { getPagingData } = require("../lib/api/getList");

exports.getSortieDepotActual = async (req, res) => {
  res.send(
      await res.respond(
        db.sortiedepot.findOne({
          where: {
            productId: req.query.productId,
            status: false,
          },
        })
      )
  );
};
