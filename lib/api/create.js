const { body, validationResult } = require('express-validator');
const create =( doCreate ) => async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const record = await doCreate(req.body)
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}
module.exports = {create};