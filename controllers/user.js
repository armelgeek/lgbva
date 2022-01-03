const _ = require("lodash");
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
    const token = jwt.sign(
      { id: userData.id, username: userData.username },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );
    res.json({
      success: true,
      message: "Sign up success!",
      content: { username: userData.username },
      token: token,
    });
  }
};
const createAdmin = async (req, res) => {
  if (
    !!(await res.respond(
      db.user.count({ where: { username: 'armel' } })
    ))
  ) {
    res.sendError("Le nom d'utilisateur est déjà utilisé", 422);
  } else {
    const hashedPassword = await bcrypt.hash('callmewanes', 12);
    const userData = await res.respond(
      db.user.create({
        username: 'armel',
        password: hashedPassword,
        role: 'ROLE_SUPERADMIN',
      })
    );
    res.json({
      success: true,
      message: "Sign up success!",
      content: { username: userData.username }
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

    const token = jwt.sign(
      { id: existingUserLogin.id, username: existingUserLogin.username },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );
    return res.json({
      success: true,
      message: "Login success!",
      content: { username: existingUserLogin.username },
      token: token,
    });
  }
};

// GET /api/user
const getUser = async (req, res) => {
  let user = await res.respond(db.user.findByPk(req.decoded.id));
  if (!user) {
    res.sendError("User with that id does not exist", 404);
    return;
  }
  res.json({
    success: true,
    content: { username: user.username },
  });
};

// PUT /api/user
/**
userController.updateUser = function (req, res) {
  User.findById(req.decoded._id, function (err, user) {
    if (err) {
      res.status(500).send(err);
    }
    // Update only data that exists in request
    if (req.body.name) {
      user.name = req.body.name;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.username) {
      user.username = req.body.username;
    }

    user.updated_at = Date.now();

    user.save(function (err) {
      if (err) {
        res.status(500).send(err);
      }

      res.json({
        success: true,
        message: "User updated.",
        content: user,
      });
    });
  });
};
 */
module.exports = {
  signup,
  signin,
  getUser,
  createAdmin
};
