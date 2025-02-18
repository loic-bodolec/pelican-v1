const bcrypt = require("bcrypt");
const db = require("../models");
const fs = require("fs");
const token = require("../middlewares/token");

const signupService = async (data, file, protocol, host) => {
  const user = await db.user.findOne({
    where: { email: data.email },
  });
  const residence = await db.residence.findOne({
    where: { id: 1 },
  });
  const hashCode = await bcrypt.compare(data.code, residence.code);
  if (!hashCode) {
    throw new Error("le code de la résidence est erroné !");
  }
  if (user !== null) {
    if (user.pseudo === data.pseudo) {
      throw new Error("ce pseudo est déjà utilisé !");
    } else if (user.email === data.email) {
      throw new Error("cet email est déjà utilisé !");
    }
  } else {
    const hash = await bcrypt.hash(data.password, 10);
    const newUser = await db.user.create({
      pseudo: data.pseudo,
      building: data.building,
      email: data.email,
      password: hash,
      admin: false,
    });
    const tokenObject = token.issueJWT(newUser);
    return {
      user: newUser,
      token: tokenObject.token,
      expires: tokenObject.expiresIn,
      message: `votre compte est bien créé ${newUser.pseudo} !`,
    };
  }
};

const loginService = async (data) => {
  const user = await db.user.findOne({
    where: { email: data.email },
  });
  if (!user) {
    throw new Error("utilisateur non trouvé !");
  } else {
    const hash = await bcrypt.compare(data.password, user.password);
    if (!hash) {
      throw new Error("mot de passe incorrect !");
    } else {
      const tokenObject = token.issueJWT(user);
      return {
        user: user,
        token: tokenObject.token,
        sub: tokenObject.sub,
        expires: tokenObject.expiresIn,
        message: "Bonjour " + user.pseudo + " !",
      };
    }
  }
};

const getAccountService = async (id) => {
  return await db.user.findOne({
    where: { id: id },
  });
};

const getAllUsersService = async () => {
  return await db.user.findAll({
    attributes: ["pseudo", "id", "photo", "building", "bio", "email"],
  });
};

const updateAccountService = async (id, req) => {
  const userId = token.getUserId(req);
  let user = await db.user.findOne({ where: { id: id } });
  if (userId === user.id) {
    user = await updateUserDetails(req, user);
    const newUser = await user.save({
      fields: ["pseudo", "email", "password", "building", "bio", "photo"],
    });
    return {
      user: newUser,
      messageRetour: `votre profil a bien été modifié ${newUser.pseudo}`,
    };
  } else {
    throw new Error("vous n'avez pas les droits requis");
  }
};

const updateUserDetails = async (req, user) => {
  let newPhoto;
  if (req.file && user.photo) {
    newPhoto = await handlePhotoUpdate(req, user.photo);
  } else if (req.file) {
    newPhoto = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
  }
  if (newPhoto) {
    user.photo = newPhoto;
  }
  if (req.body.building) {
    user.building = req.body.building;
  }
  if (req.body.email) {
    user.email = req.body.email;
  }
  if (req.body.bio) {
    user.bio = req.body.bio;
  }
  if (req.body.pseudo) {
    user.pseudo = req.body.pseudo;
  }
  if (req.body.password) {
    const newHash = await bcrypt.hash(req.body.password, 10);
    user.password = newHash;
  }
  return user;
};

const handlePhotoUpdate = (req, currentPhoto) => {
  return new Promise((resolve, reject) => {
    const newPhoto = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
    const filename = currentPhoto.split("/upload")[1];
    fs.unlink(`upload/${filename}`, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`Deleted file: upload/${filename}`);
        resolve(newPhoto);
      }
    });
  });
};

const deleteAccountService = async (id) => {
  const user = await db.user.findOne({ where: { id: id } });
  if (user.photo !== null) {
    const filename = user.photo.split("/upload")[1];
    fs.unlink(`upload/${filename}`, () => {
      db.user.destroy({ where: { id: id } });
    });
  } else {
    db.user.destroy({ where: { id: id } });
  }
  return { messageRetour: "utilisateur supprimé" };
};

module.exports = {
  signupService,
  loginService,
  getAccountService,
  getAllUsersService,
  updateAccountService,
  deleteAccountService,
};
