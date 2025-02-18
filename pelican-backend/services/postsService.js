const db = require("../models");
const fs = require("fs");

const getAllPostsService = async () => {
  return await db.post.findAll({
    attributes: ["id", "message", "imageUrl", "link", "createdAt"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.user,
        attributes: ["id", "pseudo", "photo", "building"],
      },
      {
        model: db.favorite,
        attributes: ["userId"],
      },
      {
        model: db.comment,
        attributes: ["message", "userId", "id", "createdAt"],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.user,
            attributes: ["photo", "pseudo"],
          },
        ],
      },
    ],
  });
};

const getHotPostsService = async () => {
  return await db.post.findAll({
    attributes: [
      "id",
      "message",
      "imageUrl",
      "link",
      "createdAt",
      [
        db.sequelize.literal("(SELECT COUNT(*) FROM favorite WHERE favorite.postId = post.id)"),
        "LikeCount",
      ],
    ],
    order: [[db.sequelize.literal("LikeCount"), "DESC"]],
    include: [
      {
        model: db.user,
        attributes: ["id", "pseudo", "photo", "building"],
      },
      {
        model: db.favorite,
        attributes: ["postId", "userId"],
      },
      {
        model: db.comment,
        order: [["createdAt", "DESC"]],
        attributes: ["message", "userId", "id", "createdAt"],
        include: [
          {
            model: db.user,
            attributes: ["photo", "pseudo"],
          },
        ],
      },
    ],
  });
};

const getOnePostService = async (id) => {
  return await db.post.findOne({
    where: { id },
    include: [
      {
        model: db.user,
        attributes: ["id", "pseudo", "photo"],
      },
      {
        model: db.favorite,
        attributes: ["postId", "userId"],
      },
      {
        model: db.comment,
        order: [["createdAt", "DESC"]],
        attributes: ["message", "userId"],
        include: [
          {
            model: db.user,
            attributes: ["photo", "pseudo"],
          },
        ],
      },
    ],
  });
};

const getUserPostsService = async (userId) => {
  return await db.post.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.user,
        attributes: ["id", "pseudo", "photo", "building"],
      },
      {
        model: db.favorite,
        attributes: ["postId", "userId"],
      },
      {
        model: db.comment,
        order: [["createdAt", "DESC"]],
        attributes: ["message", "userId", "id", "createdAt"],
        include: [
          {
            model: db.user,
            attributes: ["photo", "pseudo"],
          },
        ],
      },
    ],
  });
};

const createPostService = async (data, userId, imageUrl) => {
  const user = await db.user.findOne({
    attributes: ["id", "pseudo", "photo"],
    where: { id: userId },
  });
  if (user !== null) {
    const post = await db.post.create({
      message: data.message,
      link: data.link,
      imageUrl: imageUrl,
      userId: user.id,
    });
    return post;
  } else {
    throw new Error("User not found or not authorized");
  }
};

const updatePostService = async (id, data, newImageUrl, userId) => {
  let post = await db.post.findOne({ where: { id } });
  if (userId === post.userId) {
    if (newImageUrl) {
      if (post.imageUrl) {
        const filename = post.imageUrl.split("/upload/")[1];
        fs.unlink(`upload/${filename}`, (err) => {
          if (err) console.log(err);
          else {
            console.log(`Deleted file: upload/${filename}`);
          }
        });
      }
      post.imageUrl = newImageUrl;
    }
    if (data.message) post.message = data.message;
    if (data.link) post.link = data.link;
    const newPost = await post.save({
      fields: ["message", "link", "imageUrl"],
    });
    return newPost;
  } else {
    throw new Error("User not authorized to update this post");
  }
};

const deletePostService = async (id, userId) => {
  const post = await db.post.findOne({ where: { id } });
  const checkAdmin = await db.user.findOne({ where: { id: userId } });
  if (userId === post.userId || checkAdmin.admin === true) {
    if (post.imageUrl) {
      const filename = post.imageUrl.split("/upload/")[1];
      fs.unlink(`upload/${filename}`, async (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log(`Deleted file: upload/${filename}`);
        }
        await db.post.destroy({ where: { id: post.id } });
      });
    } else {
      await db.post.destroy({ where: { id: post.id } });
    }
  } else {
    throw new Error("User not authorized to delete this post");
  }
};

const likePostService = async (userId, postId) => {
  const user = await db.favorite.findOne({
    where: { userId: userId, postId: postId },
  });
  if (user) {
    await db.favorite.destroy(
      { where: { userId: userId, postId: postId } },
      { truncate: true, restartIdentity: true }
    );
    return { messageRetour: "vous n'aimez plus ce post" };
  } else {
    await db.favorite.create({
      userId: userId,
      postId: postId,
    });
    return { messageRetour: "vous aimez ce post" };
  }
};

const addCommentService = async (commentMessage, userId, postId) => {
  return await db.comment.create({
    message: commentMessage,
    userId: userId,
    postId: postId,
  });
};

const deleteCommentService = async (id, userId) => {
  const comment = await db.comment.findOne({ where: { id } });
  const checkAdmin = await db.user.findOne({ where: { id: userId } });
  if (userId === comment.userId || checkAdmin.admin === true) {
    await db.comment.destroy({ where: { id } }, { truncate: true });
    return { message: "commentaire supprimé" };
  } else {
    throw new Error("User not authorized to delete this comment");
  }
};

module.exports = {
  getAllPostsService,
  getHotPostsService,
  getOnePostService,
  getUserPostsService,
  createPostService,
  updatePostService,
  deletePostService,
  likePostService,
  addCommentService,
  deleteCommentService,
};
