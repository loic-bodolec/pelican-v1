const token = require("../middlewares/token");
const postsService = require("../services/postsService");

// Récupère tous les posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await postsService.getAllPostsService();
    res.status(200).send(posts);
  } catch (error) {
    return res.status(500).send({
      error: "une erreur est survenue lors de la récupération des posts ",
    });
  }
};

// Affiche les posts les plus likés en premier
exports.getHotPosts = async (req, res) => {
  try {
    const posts = await postsService.getHotPostsService();
    res.status(200).send(posts);
  } catch (error) {
    return res.status(500).send({
      error: "une erreur est survenue lors de la récupération des posts",
    });
  }
};

// Récupère un post en fonction de son id
exports.getOnePost = async (req, res) => {
  try {
    const post = await postsService.getOnePostService(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Récupère tous les posts d'un utilisateur en fonction de son id (post.userId)
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await postsService.getUserPostsService(req.params.id);
    res.status(200).json(posts);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Crée un nouveau post
exports.createPost = async (req, res) => {
  try {
    const userId = token.getUserId(req);
    let imageUrl;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
    } else {
      imageUrl = null;
    }
    const post = await postsService.createPostService(req.body, userId, imageUrl);
    res.status(201).json({ post: post, messageRetour: "votre post est ajouté" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Modifie un post
exports.updatePost = async (req, res) => {
  try {
    let newImageUrl;
    const userId = token.getUserId(req);
    if (req.file) {
      newImageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
    }
    const newPost = await postsService.updatePostService(
      req.params.id,
      req.body,
      newImageUrl,
      userId
    );
    res.status(200).json({ newPost: newPost, messageRetour: "post modifié" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Supprime un post
exports.deletePost = async (req, res) => {
  try {
    const userId = token.getUserId(req);
    await postsService.deletePostService(req.params.id, userId);
    res.status(200).json({ message: "post supprimé" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Permet de liker ou "déliker" un post
// Permet de liker ou "déliker" un post
exports.likePost = async (req, res) => {
  try {
    const userId = token.getUserId(req);
    const postId = req.params.id;
    const result = await postsService.likePostService(userId, postId);
    res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Ajoute un commentaire
exports.addComment = async (req, res) => {
  try {
    const comment = req.body.commentMessage;
    const newComment = await postsService.addCommentService(
      comment,
      token.getUserId(req),
      req.params.id
    );
    res.status(201).json({ newComment, messageRetour: "votre commentaire est publié" });
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};

// Supprime un commentaire (par l'utilisateur ou par l'admin)
exports.deleteComment = async (req, res) => {
  try {
    const userId = token.getUserId(req);
    const result = await postsService.deleteCommentService(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).send({ error: "erreur serveur" });
  }
};
