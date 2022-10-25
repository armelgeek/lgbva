const CustomError = require("../CustomError");

const getOne =(doGetOne,relations=[])=> async (
  req,
  res,
  next
) => {
  try {

    const record = await doGetOne(req.params.id,relations)
    if (!record) {
      throw new Error('Enregistrement non trouvé.');
    }
    res.json(record)
  } catch (error) {
    next(error)
  }
}

module.exports = {getOne};