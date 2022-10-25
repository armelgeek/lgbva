const jwt = require("jsonwebtoken");
const db = require("../models");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const signup = async (req, res) => {
  if (
    !!(await res.respond(
      db.user.count({ where: { username: req.body.username } })
    ))
  ) {
    res.sendError("Le nom d'utilisateur est déjà utilisé", 422);
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const userData = await res.respond(
      db.user.create({
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role,
      })
    );
    const token = jwt.sign({ id: userData.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    const { id, username, role, createdAt } = userData;
    res.json({
      token,
      user: { id, username, role, createdAt },
    });
  }
};
const signin = async (req, res) => {
  const existingUserLogin = await res.respond(
    db.user.findOne({ where: { username: req.body.username } })
  );
  if (!existingUserLogin) {
    res.sendError("User with that username does not exist. Please signup", 404);
    return;
  } else {
    const isEqual = await bcrypt.compareSync(
      req.body.password,
      existingUserLogin.password
    );
    if (!isEqual) {
      res.sendError("Mauvais mot de passe", 401);
      return;
    }

    const token = jwt.sign({ id: existingUserLogin.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    const { id, username, role } = existingUserLogin;
    return res.json({
      token,
      user: { id, username, role },
    });
  }
};

module.exports = {
  signup,
  signin,
};
