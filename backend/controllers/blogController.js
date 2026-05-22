const { Blog, Comment } = require('../models');

// --- Logique pour les routes Admin du Blog ---

exports.listArticlesAdmin = async (req, res) => {
  try {
    const articles = await Blog.findAll({ order: [['date', 'DESC']] });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { titre, contenu, categorie } = req.body;
    if (!titre || !contenu) return res.status(400).json({ error: 'Titre et contenu sont requis.' });

    // Le chemin de l'image est disponible via req.file
    const image = req.file ? `/images/uploads/${req.file.filename}` : null;

    const article = await Blog.create({ titre, contenu, image, categorie });
    res.status(201).json({ success: true, article }); // 201 Created est plus sémantique
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getArticleByIdAdmin = async (req, res) => {
  try {
    const article = await Blog.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Blog.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé.' });

    const { titre, contenu, categorie, image_url } = req.body;

    // Mettre à jour l'image seulement si une nouvelle est fournie, sinon garder l'ancienne
    const image = req.file ? `/images/uploads/${req.file.filename}` : image_url;

    await article.update({ titre, contenu, image, categorie });
    res.json({ success: true, article });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Blog.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé.' });
    await article.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Logique pour les routes Publiques du Blog ---

exports.listArticlesPublic = async (req, res) => {
  try {
    const articles = await Blog.findAll({ order: [['date', 'DESC']] });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les articles." });
  }
};

exports.getArticleByIdPublic = async (req, res) => {
  try {
    const article = await Blog.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};