const db = require("../models");
const fs = require("fs");
const { Op } = require("sequelize");

const getAllActualitiesService = async () => {
  return await db.actuality.findAll({
    attributes: ["id", "title", "message", "imageUrl", "link", "createdAt"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.user,
        attributes: ["pseudo", "id"],
      },
    ],
  });
};

const getAllActualitiesWithTitleContaintService = async (title) => {
  const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  return await db.actuality.findAll({
    attributes: ["id", "title", "message", "imageUrl", "link", "createdAt"],
    where: condition,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.user,
        attributes: ["pseudo", "id"],
      },
    ],
  });
};

const getOneActualityService = async (id) => {
  return await db.actuality.findOne({
    where: { id },
    include: [
      {
        model: db.user,
        attributes: ["pseudo", "id"],
      },
    ],
  });
};

const createActualityService = async (data, userId, imageUrl) => {
  return await db.actuality.create({
    include: [
      {
        model: db.user,
        attributes: ["pseudo", "id"],
      },
    ],
    title: data.title,
    message: data.message,
    link: data.link,
    imageUrl: imageUrl,
    userId: userId,
  });
};

const updateActualityService = async (id, data, newImageUrl) => {
  let actuality = await db.actuality.findOne({ where: { id } });
  if (data.title) actuality.title = data.title;
  if (data.message) actuality.message = data.message;
  if (data.link) actuality.link = data.link;
  actuality.imageUrl = newImageUrl;
  return await actuality.save({
    fields: ["title", "message", "link", "imageUrl"],
  });
};

const deleteActualityService = async (id) => {
  const actuality = await db.actuality.findOne({ where: { id } });
  if (actuality.imageUrl) {
    const filename = actuality.imageUrl.split("/upload")[1];
    fs.unlink(`upload/${filename}`, () => {
      db.actuality.destroy({ where: { id: actuality.id } });
    });
  } else {
    db.actuality.destroy({ where: { id: actuality.id } }, { truncate: true });
  }
};

module.exports = {
  getAllActualitiesService,
  getAllActualitiesWithTitleContaintService,
  getOneActualityService,
  createActualityService,
  updateActualityService,
  deleteActualityService,
};
