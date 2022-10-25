const { getPagingData } = require("../lib/api/getList");
const moment = require("moment");

const { Op } = require("sequelize");
const db = require("../models");
const { sequelize } = require("../models");
exports.createFacture = async (req, res, next) => {
  const contenu = req.body.contenu;
  const totalht = req.body.totalht;
  const remise = req.body.remise;
  const total = req.body.total;
  const dateApprov = req.body.dateApprov;
  const dateEcheance = req.body.dateEcheance;
  const remarque = req.body.remarque;
  const typePaye = req.body.typePaye;
  const approvisionnements = req.body.approvisionnements;
  await sequelize
    .transaction(async (t) => {
      for (const approvis of approvisionnements) {
        await db.product.update(
          {
            quantityBrute:
              Number(approvis.quantityBrute) +
              Number(approvis.quantityParProduct),
            quantityParProduct: 0,
          },
          { transaction: t, where: { id: approvis.id } }
        );
      }
      await db.approvisionnement.create(
        {
          contenu: contenu,
          totalht: totalht,
          remise: remise,
          total: total,
          dateApprov: dateApprov,
          dateEcheance: dateEcheance,
          remarque: remarque,
          typePaye: typePaye,
        },
        { transaction: t }
      );
    })
    .then(function (result) {
      res.send({
        message: "Approvisionnement reussie",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
};

exports.updateFacture = async (req, res, next) => {
  const id = req.body.id;
  const contenu = req.body.contenu;
  const totalht = req.body.totalht;
  const remise = req.body.remise;
  const total = req.body.total;
  const dateApprov = req.body.dateApprov;
  const dateEcheance = req.body.dateEcheance;
  const remarque = req.body.remarque;
  const typePaye = req.body.typePaye;
  const exist = req.body.exist;
  const missing = req.body.missing;
  const added = req.body.added;
  await sequelize
    .transaction(async (t) => {
      if (exist.length > 0) {
        for (const ex of exist) {
          await db.product.update(ex, {
            transaction: t,
            where: { id: ex.id },
          });
        }
      }
      if (missing.length > 0) {
        for (const m of missing) {
          let product = await db.product.findByPk(m.id, { transaction: t });
          await product.decrement(
            {
              quantity_brute: m.quantityParProduct,
            },
            { transaction: t }
          );
        }
      }
      if (added.length > 0) {
        for (const ad of added) {
          let product = await db.product.findByPk(ad.id, { transaction: t });
          await product.increment(
            {
              quantity_brute: ad.quantityParProduct,
            },
            { transaction: t }
          );
        }
      }
      await db.approvisionnement.update(
        {
          contenu: contenu,
          totalht: totalht,
          remise: remise,
          total: total,
          dateApprov: dateApprov,
          dateEcheance: dateEcheance,
          remarque: remarque,
          typePaye: typePaye,
        },
        { transaction: t, where: { id: id } }
      );
    })
    .then(function (result) {
      res.send({
        message: "Approvisionnement mis a jour",
      });
    })
    .catch(function (err) {
      console.log("NO!!!");
      return next(err);
    });
  //console.log(req);
};

exports.deleteFacture = async (req, res, next) => {
  const contenu = req.body.contenu;
  await sequelize
    .transaction(async (t) => {
      if (contenu.length > 0) {
        for (const c of contenu) {
          let product = await db.product.findByPk(c.id, { transaction: t });
          await product.decrement(
            {
              quantity_brute: c.quantityParProduct,
            },
            { transaction: t }
          );
        }
      }
      await db.approvisionnement.destroy({
        transaction: t,
        where: {
          id: req.body.id,
        },
      });
    })
    .then(function (result) {
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

exports.approvByDate = async (req, res) => {
  let total = 0;
  var whereStatement = {};
  if (req.query.deb && req.query.fin) {
    whereStatement.dateApprov = {
      [Op.gte]: moment(req.query.deb),
      [Op.lte]: moment(req.query.fin),
    };
  }

  if (req.query.pid) whereStatement.pid = req.query.pid;

  res.send(
    getPagingData(
      await res.respond(
        db.approvisionnement.findAndCountAll({
          where: whereStatement,
          order: [["id", "DESC"]],
        }),
        0,
        10000
      )
    )
  );
};
