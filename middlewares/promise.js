const { validationResult } = require("express-validator");

const handleResponse = (res, data) => res.status(200).send(data);
const handleError = (res, err = {}) =>
  res
    .status(err.status || 500)
    .send({ error: { message: err.message, status: err.status } });
const handlePromise = (p) => {
  let promiseToResolve;
  if (p.then && p.catch) {
    promiseToResolve = p;
  } else if (typeof p === "function") {
    promiseToResolve = Promise.resolve().then(() => p());
  } else {
    promiseToResolve = Promise.resolve(p);
  }
  return promiseToResolve;
};
module.exports = function promiseMiddleware() {
  return (req, res, next) => {
    res.sendError = (msg, code) => {
      res.status(code).send({ error: { message: msg, status: code } });
    };
    res.respond = (p) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleError(res, errors);
      }
      return handlePromise(p)
        .then((data) => data)
        .catch((e) => handleError(res, e));
    };
    res.promise = (p) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleError(res, errors);
      }
      return handlePromise(p)
        .then((data) => handleResponse(res, data))
        .catch((e) => handleError(res, e));
    };

    return next();
  };
};
