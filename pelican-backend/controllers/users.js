const userService = require("../services/usersService");

// Création d'un compte utilisateur
exports.signup = async (req, res) => {
  try {
    const result = await userService.signupService(
      req.body,
      req.file,
      req.protocol,
      req.get("host")
    );
    res.status(201).send(result);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Connexion à un compte utilisateur existant
exports.login = async (req, res) => {
  try {
    const result = await userService.loginService(req.body);
    res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Fournit un compte en fonction de son user id
exports.getAccount = async (req, res) => {
  try {
    const user = await userService.getAccountService(req.params.id);
    res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Fournit la liste des comptes
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsersService();
    res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Modifie un compte (profil)
exports.updateAccount = async (req, res) => {
  try {
    const result = await userService.updateAccountService(req.params.id, req);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Supprime un compte
exports.deleteAccount = async (req, res) => {
  try {
    const result = await userService.deleteAccountService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};
