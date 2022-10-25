const destroy = (doDetroy) => async (
  req,
  res,
  next
) => {
  try {
    await doDetroy(req.params.id)
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
module.exports = {destroy};