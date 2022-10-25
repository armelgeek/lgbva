const CustomError = require("../CustomError");

const update = (doUpdate, doGetOne) => async (req, res, next) => {
  try {
    const record = await doGetOne(req.params.id);

    if (!record) {
      throw new Error("Enregistrement non trouvé.");
    }

    await doUpdate(req.params.id, req.body);
    res.json(await doGetOne(req.params.id));
  } catch (error) {
    next(error);
  }
};

module.exports = { update };
