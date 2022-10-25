module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
      email: {
          type: Sequelize.STRING
      },
      password : {
          type :Sequelize.STRING
      },
      role:{
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.INTEGER,
      },
      activationToken: {
        type:  Sequelize.STRING,
        required:false
      },
      resetToken: {
        type:  Sequelize.STRING,
        required:false
      },
      resetTokenExpiry: {
        type: Sequelize.BIGINT,
        required:false
      },
  });

  return User;
};
