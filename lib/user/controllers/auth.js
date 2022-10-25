
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const config = require("../config/auth.config");
const transport = require("../emails/transport");
const db = require("../../../models");
const user = db.user;
const { validationResult } = require("express-validator");

const refreshTokens = [];
const {
  resetPasswordTemplate,
  emailConfirmationTemplate,
} = require("../emails/templates");
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const exitUser = await user
    .findOne({ where: { email: req.body.email } })
    .then((response) => response)
    .catch((err) => {
      res.status(500).json({
        message: JSON.stringify(err),
        statusCode: 500,
      });
    });
  if (exitUser) {
    res.status(422).json({
      message: "L'adresse e-mail est déjà utilisé",
      statusCode: 422,
    });
  } else {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    let saved = await user
      .create({
        email: req.body.email,
        password: hashedPassword,
        role: "ROLE_USER",
      })
      .then((response) => response)
      .catch((err) => {
        res.status(500).json({
          message: JSON.stringify(err),
          statusCode: 500,
        });
      });
    res.status(201).json({
      saved: saved.id,
      message: "OK",
      statusCode: 200,
    });
  }
};

exports.signin = async (req, res) => {
  // find the user based on email

  const existingUserLogin = await user
    .findOne({ where: { email: req.body.email } })
    .then((response) => response)
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
  if (!existingUserLogin) {
    return res.status(400).json({
      error: "User with that email does not exist. Please signup",
    });
    return;
  }
  const salt = await bcrypt.genSaltSync(10);
  const isEqual = await bcrypt.compareSync(
    req.body.password,
    existingUserLogin.password
  );
  if (!isEqual) {
    res.send({
      message: "Mauvais mot de passe.",
      statusCode: 401,
    });
    return;
  }

  const token = jwt.sign({ id: existingUserLogin.id }, config.secret, {
    expiresIn: config.jwtExpiration,
  });
  let refreshToken = await db.refreshToken.createToken(existingUserLogin);

  const { id, email, role } = existingUserLogin;
  return res.json({
    token,
    refreshToken: refreshToken,
    user: { id, email, role },
  });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await db.refreshToken.findOne({
      where: { token: requestToken },
    });

    console.log(refreshToken);

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (db.refreshToken.verifyExpiration(refreshToken)) {
      db.refreshToken.destroy({ where: { id: refreshToken.id } });

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.query.userId;

  try {
    const dataUser = await user
      .findOne({ where: { id: userId } })
      .then((response) => response)
      .catch((err) => {
        throw err;
      });
    if (!userId || !dataUser) {
      const err = new Error("L'utilisateur n'est pas authentifié.");
      err.statusCode = 401;
      throw err;
    }

    res.status(200).json({
      message: "Utilisateur récupéré avec succès.",
      user: dataUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getResetToken = async (req, res, next) => {
  const email = req.body.email;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("La validation de l'entrée a échoué.");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
    const userData = await user
      .findOne({ where: { email: email } })
      .then((response) => response)
      .catch((err) => {
        throw err;
      });
    if (!userData) {
      const err = new Error(
        "Un utilisateur avec cet e-mail n'a pas pu être trouvé."
      );
      err.statusCode = 404;
      throw err;
    }

    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60;

    const savedUser = await user
      .update(
        { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry },
        {
          where: {
            id: userData.id,
          },
        }
      )
      .then((response) => response)
      .catch((err) => {
        throw err;
      });

    await transport.sendMail({
      from: process.env.MAIL_SENDER,
      to: email,
      subject: "Votre jeton de réinitialisation de mot de passe.",
      html: resetPasswordTemplate(resetToken),
    });
    res.status(200).json({
      message:
        "Réinitialisation du mot de passe demandée avec succès ! Vérifiez votre boîte de réception.",
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const password = req.body.password;
  const resetToken = req.body.resetToken;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("La validation de l'entrée a échoué.");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
    const userData = await user
      .findOne({
        where: {
          resetToken: resetToken,
          resetTokenExpiry: { [Op.gt]: Date.now() - 1000 * 60 * 60 },
        },
      })
      .then((response) => response)
      .catch((err) => {
        throw err;
      });
    if (!userData) {
      const err = new Error("Le jeton est soit invalide, soit expiré.");
      err.statusCode = 422;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    userData.password = hashedPassword;
    userData.resetToken = null;
    userData.resetTokenExpiry = null;
    const savedUser = await user
      .update(
        {
          password: userData.password,
          resetToken: userData.resetToken,
          resetTokenExpiry: userData.resetTokenExpiry,
        },
        {
          where: {
            id: userData.id,
          },
        }
      )
      .then((response) => response)
      .catch((err) => {
        throw err;
      });
    // Connexion automatique de l'utilisateur après la réinitialisation du mot de passe
    const token = jwt.sign({ userId: savedUser },config.secret, {
      expiresIn: config.jwtExpiration,
    });
    let refreshToken = await db.refreshToken.createToken(userData);
  
    res.status(201).json({
      message: "Mot de passe changé avec succès. ",
      token: token,
      refreshToken:refreshToken,
      user: savedUser,
    });
  } catch (err) {
    next(err);
  }
};
