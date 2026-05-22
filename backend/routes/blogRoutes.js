const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

module.exports = (checkAdminAuth, upload) => {
  // --- Routes Admin pour le Blog (préfixe /admin/blog) ---

  // Lister tous les articles (admin)
  router.get('/admin/blog', checkAdminAuth, blogController.listArticlesAdmin);

  // Ajouter un article
  router.post('/admin/blog', checkAdminAuth, upload.single('image'), blogController.createArticle);

  // Obtenir un article par ID (admin)
  router.get('/admin/blog/:id', checkAdminAuth, blogController.getArticleByIdAdmin);

  // Mettre à jour un article
  router.put('/admin/blog/:id', checkAdminAuth, upload.single('image'), blogController.updateArticle);

  // Supprimer un article
  router.delete('/admin/blog/:id', checkAdminAuth, blogController.deleteArticle);

  // --- Routes Publiques pour le Blog (préfixe /api) ---
  router.get('/api/articles', blogController.listArticlesPublic);
  router.get('/api/articles/:id', blogController.getArticleByIdPublic);

  return router;
};