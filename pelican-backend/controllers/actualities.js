const token = require("../middlewares/token");
const actualitiesService = require("../services/actualitiesService");
const db = require("../models"); // accès aux tables
const fs = require("fs"); // accès à des opérations liées aux systèmes de fichiers

async function getAllActualities(req, res) {
  try {
    const actualities = await actualitiesService.getAllActualitiesService();
    res.status(200).send(actualities);
  } catch (error) {
    return res.status(500).send({
      error: "une erreur est survenue lors de la récupération des actualités ",
    });
  }
}

async function getAllActualitiesWithTitleContaint(req, res) {
  try {
    const title = req.query.title;
    const actualities = await actualitiesService.getAllActualitiesWithTitleContaintService(title);
    res.status(200).send(actualities);
  } catch (error) {
    return res.status(500).send({
      error: "une erreur est survenue lors de la récupération des actualités ",
    });
  }
}

async function getOneActuality(req, res) {
  try {
    const actuality = await actualitiesService.getOneActualityService(req.params.id);
    res.status(200).json(actuality);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
}

async function createActuality(req, res) {
  const userId = token.getUserId(req);
  const checkAdmin = await db.user.findOne({ where: { id: userId } });
  let imageUrl;
  try {
    if (checkAdmin.admin === true) {
      if (req.file) {
        imageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
      } else {
        imageUrl = null;
      }
      const actuality = await actualitiesService.createActualityService(req.body, userId, imageUrl);
      res.status(201).json({ actuality: actuality, messageRetour: "votre actualité est ajoutée" });
    } else {
      res.status(401).send({ error: "erreur" });
    }
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
}

async function updateActuality(req, res) {
  try {
    let newImageUrl;
    const userId = token.getUserId(req);
    const checkAdmin = await db.user.findOne({ where: { id: userId } });
    if (checkAdmin.admin === true) {
      if (req.file) {
        newImageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
        const actuality = await actualitiesService.getOneActuality(req.params.id);
        if (actuality.imageUrl) {
          const filename = actuality.imageUrl.split("/upload")[1];
          fs.unlink(`upload/${filename}`, (err) => {
            if (err) console.log(err);
            else {
              console.log(`Deleted file: upload/${filename}`);
            }
          });
        }
      }
      const newActuality = await actualitiesService.updateActualityService(
        req.params.id,
        req.body,
        newImageUrl
      );
      res.status(200).json({ newActuality: newActuality, messageRetour: "actualité modifiée" });
    } else {
      res.status(401).json({ message: "vous n'avez pas les droits requis" });
    }
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
}

async function deleteActuality(req, res) {
  try {
    const userId = token.getUserId(req);
    const checkAdmin = await db.user.findOne({ where: { id: userId } });
    if (checkAdmin.admin === true) {
      await actualitiesService.deleteActualityService(req.params.id);
      res.status(200).json({ message: "actualité supprimée" });
    } else {
      res.status(401).json({ message: "vous n'avez pas les droits requis" });
    }
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
}

module.exports = {
  getAllActualities,
  getAllActualitiesWithTitleContaint,
  getOneActuality,
  createActuality,
  updateActuality,
  deleteActuality,
};
