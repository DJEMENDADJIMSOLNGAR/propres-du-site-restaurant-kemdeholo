const { sequelize, Subscriber, Notification, Blog, Contact, Menu, Comment, Hebergement, Formation, Blanchisserie, Team, Testimonial, Order, Reservation, FormationInscription } = require('./models');
const { sendReservationConfirmation } = require('./mailer');

// Backend principal pour KemdeHolo
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const redoc = require('redoc-express');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend Render OK !");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../frontend/images/uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Configuration de Swagger / OpenAPI ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API KemdeHolo',
      version: '1.0.0',
      description: `Documentation de l'API pour le site KemdeHolo.
      Cette documentation est générée automatiquement.
      
      **Accès à l'interface d'administration :**
      Pour accéder à la page d'administration complète, cliquez ici.
      Vous aurez besoin d'un token d'authentification pour utiliser les routes admin.`,
      contact: {
        name: 'Support KemdeHolo',
        email: 'kemdeholo@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./backend/app.js', './backend/routes/*.js'], // Fichiers à scanner pour la documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


// --- Authentification admin simple (démonstration) ---
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'kemdeholo2025';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admintokenkemdeholo';

// Middleware de vérification du token admin
function checkAdminAuth(req, res, next) {
  let token = req.headers['authorization'] || req.query.token || (req.body && req.body.token);

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token === ADMIN_TOKEN) return next();
  res.status(403).json({ error: 'Accès administrateur requis' });
}

// --- Importation et utilisation des routes ---
const blogRoutes = require('./routes/blogRoutes')(checkAdminAuth, upload);
app.use('/', blogRoutes);

// Route de suppression pour le Blog (si non présente dans blogRoutes)
app.delete('/admin/blog/:id', checkAdminAuth, async (req, res) => {
  try {
    const article = await Blog.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé.' });
    await article.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/blog/:id', checkAdminAuth, async (req, res) => {
  const article = await Blog.findByPk(req.params.id);
  res.json(article);
});

// --- Routes pour la documentation API ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/redoc', redoc({
    title: 'API Docs KemdeHolo',
    specUrl: '/swagger.json'
}));
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// --- Gestion des notifications (admin) ---
// Voir toutes les notifications (protégée)
app.get('/admin/notifications', checkAdminAuth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({ order: [['date', 'DESC']] });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter une notification (protégée)
app.post('/admin/notifications', checkAdminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message requis.' });
    const notif = await Notification.create({ message });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer une notification (protégée)
app.delete('/admin/notifications/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée.' });
    await notif.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour servir la page HTML de l'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route pour servir la page de connexion de l'admin depuis le backend
app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});


/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Routes protégées pour la gestion du site.
 *   - name: Public
 *     description: Routes accessibles publiquement.
 *   - name: Blog
 *     description: Gestion des articles de blog.
 *   - name: Commandes
 *     description: Gestion des commandes du restaurant.
 *   - name: Réservations
 *     description: Gestion des réservations de chambres.
 *   - name: Contacts
 *     description: Gestion des messages de contact.
 *   - name: Équipe
 *     description: Gestion des membres de l'équipe.
 *   - name: Témoignages
 *     description: Gestion des témoignages clients.
 */
// --- Routes publiques ---

// Route de login admin
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, error: 'Identifiants invalides' });
  }
});

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Connecte un administrateur.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "kemdeholo2025"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token.
 *       401:
 *         description: Identifiants invalides.
 */


// --- Routes admin pour l'interface d'administration ---
// Liste des messages de contact (protégée)
app.get('/admin/contacts', checkAdminAuth, async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['date', 'DESC']] });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/contacts:
 *   get:
 *     summary: Récupère tous les messages de contact.
 *     tags: [Admin, Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages.
 *       403:
 *         description: Accès non autorisé.
 */

// Supprimer un message de contact
app.delete('/admin/contacts/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ error: 'Contact non trouvé.' });
    await contact.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/contacts/{id}:
 *   delete:
 *     summary: Supprime un message de contact.
 *     tags: [Admin, Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message supprimé.
 */
// Liste des abonnés (protégée)
app.get('/admin/subscribers', checkAdminAuth, async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({ order: [['date', 'DESC']] });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/subscribers:
 *   get:
 *     summary: Récupère tous les abonnés à la newsletter.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des emails abonnés.
 *       403:
 *         description: Accès non autorisé.
 */

app.delete('/admin/subscribers/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const sub = await Subscriber.findByPk(id);
    if (!sub) return res.status(404).json({ error: 'Abonné non trouvé.' });
    await sub.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Gestion des Formations (admin) ---
app.get('/admin/formation', checkAdminAuth, async (req, res) => {
  try {
    const formations = await Formation.findAll({ order: [['nom', 'ASC']] });
    res.json(formations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/formation', checkAdminAuth, async (req, res) => {
  const { nom, description, duree, image } = req.body;
  if (!nom) return res.status(400).json({ error: 'Le nom est requis.' });
  const formation = await Formation.create({ nom, description, duree, image });
  res.json({ success: true, formation });
});

app.get('/admin/formation/:id', checkAdminAuth, async (req, res) => {
  const formation = await Formation.findByPk(req.params.id);
  res.json(formation);
});

app.put('/admin/formation/:id', checkAdminAuth, async (req, res) => {
  const formation = await Formation.findByPk(req.params.id);
  if (!formation) return res.status(404).json({ error: 'Formation non trouvée.' });
  const { nom, description, duree, image } = req.body;
  await formation.update({ nom, description, duree, image });
  res.json({ success: true, formation });
});

app.delete('/admin/formation/:id', checkAdminAuth, async (req, res) => {
  const formation = await Formation.findByPk(req.params.id);
  if (formation) await formation.destroy();
  res.json({ success: true });
});

// --- Gestion des Commentaires (admin) ---
app.get('/admin/comments', checkAdminAuth, async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [{
        model: Blog,
        attributes: ['id', 'titre'] // On inclut seulement l'ID et le titre du blog
      }],
      order: [['date', 'DESC']] });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/comments:
 *   get:
 *     summary: Récupère tous les commentaires du blog.
 *     tags: [Admin, Blog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commentaires.
 *       403:
 *         description: Accès non autorisé.
 */


app.delete('/admin/comments/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Commentaire non trouvé.' });
    await comment.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/comments/{id}:
 *   delete:
 *     summary: Supprime un commentaire.
 *     tags: [Admin, Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Commentaire supprimé.
 */
// --- Gestion de l'Équipe (admin) ---
app.get('/admin/team', checkAdminAuth, async (req, res) => {
  try {
    const members = await Team.findAll({ order: [['id', 'ASC']] });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/team:
 *   get:
 *     summary: Récupère tous les membres de l'équipe.
 *     tags: [Admin, Équipe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des membres.
 *       403:
 *         description: Accès non autorisé.
 */
app.post('/admin/team', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { nom, role, description } = req.body;
    if (!nom || !role) return res.status(400).json({ error: 'Nom et rôle sont requis.' });

    // Le chemin de l'image est disponible via req.file
    const image = req.file ? `/images/uploads/${req.file.filename}` : null;

    const member = await Team.create({ nom, role, description, image });
    res.json({ success: true, member });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/team/:id', checkAdminAuth, async (req, res) => {
  const member = await Team.findByPk(req.params.id);
  if (!member) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json(member);
});

app.put('/admin/team/:id', checkAdminAuth, upload.single('image'), async (req, res) => {
  const member = await Team.findByPk(req.params.id);
  if (!member) return res.status(404).json({ error: 'Membre non trouvé.' });
  
  const { nom, role, description, image_url } = req.body;
  if (!nom || !role) return res.status(400).json({ error: 'Nom et rôle sont requis.' });

  // Mettre à jour l'image seulement si une nouvelle est fournie
  const image = req.file ? `/images/uploads/${req.file.filename}` : image_url;

  await member.update({ nom, role, description, image });
  res.json({ success: true, member });
});

app.delete('/admin/team/:id', checkAdminAuth, async (req, res) => {
  try {
    const member = await Team.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Membre non trouvé.' });
    await member.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Gestion des Témoignages (admin) ---
app.get('/admin/testimonials', checkAdminAuth, async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ order: [['id', 'ASC']] });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les témoignages depuis la base de données." });
  }
});

app.post('/admin/testimonials', checkAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, quote, rating, status, category } = req.body;
    if (!name || !quote || !category) return res.status(400).json({ error: 'Le nom, la citation et la catégorie sont requis.' });

    // Récupérer le chemin de l'image si elle a été téléversée
    const image = req.file ? `/images/uploads/${req.file.filename}` : null;

    const testimonial = await Testimonial.create({ name, quote, image, rating, status: status || 'approved', category });
    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/testimonials/:id', checkAdminAuth, async (req, res) => {
  const testimonial = await Testimonial.findByPk(req.params.id);
  if (!testimonial) return res.status(404).json({ error: 'Témoignage non trouvé' });
  res.json(testimonial);
});

app.put('/admin/testimonials/:id', checkAdminAuth, upload.single('image'), async (req, res) => {
  const testimonial = await Testimonial.findByPk(req.params.id);
  if (!testimonial) return res.status(404).json({ error: 'Témoignage non trouvé.' });

  const { name, quote, rating, status, image_url, category } = req.body;
  if (!name || !quote || !category) return res.status(400).json({ error: 'Le nom, la citation et la catégorie sont requis.' });

  // Mettre à jour l'image seulement si une nouvelle est fournie, sinon garder l'ancienne
  const image = req.file ? `/images/uploads/${req.file.filename}` : image_url;

  await testimonial.update({ name, quote, image, rating, status, category });
  res.json({ success: true, testimonial });
});

app.delete('/admin/testimonials/:id', checkAdminAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Témoignage non trouvé.' });
    await testimonial.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- API Publique pour les témoignages ---
app.get('/api/testimonials', async (req, res) => {
  const { category } = req.query;
  const whereClause = { status: 'approved' };
  if (category) {
    whereClause.category = category;
  }

  try {
    const testimonials = await Testimonial.findAll({ 
      where: whereClause,
      order: [['id', 'DESC']], 
      limit: 10 // On augmente la limite pour avoir plus de choix
    });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les témoignages." });
  }
});

app.delete('/admin/orders/:id', checkAdminAuth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    await order.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, quote, rating, category } = req.body;
    if (!name || !quote || !rating || !category) return res.status(400).json({ error: 'Le nom, la citation, la catégorie et la note sont requis.' });
    await Testimonial.create({ name, quote, rating, category, status: 'pending' });
    res.status(201).json({ success: true, message: 'Témoignage ajouté avec succès ! Il est en attente de validation.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- API Publique pour les commentaires ---
app.post('/api/comments', async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ error: 'Nom et commentaire requis.' });
    const comment = await Comment.create({ name, text });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route publique pour les messages de contact
app.post('/contact', async (req, res) => {
  try {
    const { prenom, nom, email, sujet, message } = req.body;
    if (!nom || !email || !message) {
      return res.status(400).json({ message: 'Nom, email et message sont requis.' });
    }
    await Contact.create({ prenom, nom, email, sujet, message });
    res.json({ message: 'Votre message a bien été envoyé !' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
  }
});

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Envoie un message depuis le formulaire de contact.
 *     tags: [Public, Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               sujet:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message envoyé avec succès.
 */

// Route POST pour s'abonner
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis.' });
    const exist = await Subscriber.findOne({ where: { email } });
    if (exist) return res.json({ message: 'Vous êtes déjà abonné.' });
    await Subscriber.create({ email });
    res.json({ message: 'Abonnement réussi!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /subscribe:
 *   post:
 *     summary: Abonne un utilisateur à la newsletter.
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Abonnement réussi.
 */
// --- Gestion des Réservations (admin) ---
app.get('/admin/reservations', checkAdminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/reservations:
 *   get:
 *     summary: Récupère toutes les réservations de chambres.
 *     tags: [Admin, Réservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations.
 *       403:
 *         description: Accès non autorisé.
 */
app.put('/admin/reservations/:id', checkAdminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée.' });

    const oldStatus = reservation.status;
    const newStatus = req.body.status;

    await reservation.update({ status: newStatus });

    // Si le statut passe à "Confirmée", on envoie l'email.
    if (newStatus === 'Confirmée' && oldStatus !== 'Confirmée') {
      await sendReservationConfirmation(reservation);
    }

    res.json({ success: true, reservation: reservation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/admin/reservations/:id', checkAdminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée.' });
    await reservation.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API Publique pour les réservations ---
app.post('/api/reservations', async (req, res) => {
  try {
    const { roomType, arrivalDate, departureDate, adults, customerName, customerEmail, customerPhone, specialRequests } = req.body; // customerPhone est déjà là, parfait !
    if (!roomType || !arrivalDate || !departureDate || !adults || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Validation de la date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On met l'heure à minuit pour comparer uniquement les jours
    if (new Date(arrivalDate) < today) {
      return res.status(400).json({ error: "La date d'arrivée ne peut pas être dans le passé." });
    }
    const reservation = await Reservation.create({
      roomType,
      arrivalDate,
      departureDate,
      adults,
      customerName,
      customerEmail,
      customerPhone, // On s'assure qu'il est bien inclus
      specialRequests,
      status: 'En attente'
    });
    res.status(201).json({ success: true, message: 'Votre demande de réservation a bien été envoyée. Nous vous contacterons bientôt pour la confirmation.' });
  } catch (err) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la réservation.' });
  }
});

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Crée une nouvelle demande de réservation de chambre.
 *     tags: [Public, Réservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *               arrivalDate:
 *                 type: string
 *                 format: date
 *               departureDate:
 *                 type: string
 *                 format: date
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *                 format: email
 *               customerPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demande de réservation envoyée.
 *       400:
 *         description: Données manquantes.
 */


// --- Gestion des Commandes (admin) ---
app.get('/admin/orders', checkAdminAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Récupère toutes les commandes du restaurant.
 *     tags: [Admin, Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes.
 *       403:
 *         description: Accès non autorisé.
 */
app.put('/admin/orders/:id', checkAdminAuth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    const { status } = req.body;
    await order.update({ status });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post('/api/orders', async (req, res) => {
    try {
        const { itemName, quantity, customerName, customerPhone } = req.body;
        const order = await Order.create({ itemName, quantity, customerName, customerPhone, status: 'En attente' });
        res.status(201).json({ success: true, order });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Passe une nouvelle commande au restaurant.
 *     tags: [Public, Commandes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commande créée avec succès.
 */

// --- Gestion des Inscriptions aux Formations (admin) ---
app.get('/admin/formation-inscriptions', checkAdminAuth, async (req, res) => {
  try {
    const inscriptions = await FormationInscription.findAll({ order: [['createdAt', 'DESC']] });
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/formation-inscriptions/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const inscription = await FormationInscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ error: 'Inscription non trouvée.' });
    }
    await inscription.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API Publique pour les inscriptions aux formations ---
app.post('/api/formation-inscriptions', async (req, res) => {
  try {
    const { name, email, phone, formationName } = req.body;
    if (!name || !email || !formationName) {
      return res.status(400).json({ error: 'Nom, email et nom de la formation sont requis.' });
    }
    const inscription = await FormationInscription.create({ nom: name, email, telephone: phone, formation: formationName });
    res.status(201).json({ success: true, inscription });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Route GET pour afficher toutes les notifications
app.get('/notifications', async (req, res) => {
  try {
    const notifs = await Notification.findAll({ order: [['date', 'DESC']] });
    res.json({ notifications: notifs.map(n => n.message) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route GET restaurant
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Menu.findAll({ order: [['categorie', 'ASC'], ['nom', 'ASC']] });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger le menu." });
  }
});

// Route GET hébergement
app.get('/api/hebergement', async (req, res) => {
  try {
    const chambres = await Hebergement.findAll({ order: [['prix', 'ASC']] });
    res.json(chambres);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les chambres." });
  }
});

// Route GET formation
app.get('/api/formation', async (req, res) => {
  try {
    const formations = await Formation.findAll();
    res.json(formations);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les formations." });
  }
});

// Route GET blanchisserie
app.get('/api/blanchisserie', async (req, res) => {
  const tarifs = await Blanchisserie.findAll();
  res.json(tarifs);
});

// Route GET pour l'équipe
app.get('/api/team', async (req, res) => {
  try {
    const members = await Team.findAll({ order: [['id', 'ASC']] });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger l'équipe." });
  }
});

// Servir les fichiers HTML
// Cette route doit être à la fin, après toutes les routes API
app.get(/^\/(?!api\/|admin|admin-login\.html)[^.]*$/, (req, res) => {
  const page = req.path === '/' ? 'index.html' : `${req.path.substring(1)}.html`;
  const filePath = path.join(__dirname, '../frontend', path.basename(page));
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, '../frontend', '404.html'));
    }
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie');

    await sequelize.sync({ alter: true });
    console.log('Modèles synchronisés');

   

    const hebergementCount = await Hebergement.count();
    if (hebergementCount === 0) {
      console.log('La table Hebergement est vide, ajout des chambres de base...');
      await Hebergement.bulkCreate([
        { type: 'Chambre Standard', description: 'Lit double, climatisation, Wi-Fi, petit-déjeuner inclus.', prix: 25000, image: 'images/chambre1.jpg' },
        { type: 'Chambre Supérieure', description: 'Lit king size, balcon, TV, Wi-Fi, petit-déjeuner inclus.', prix: 40000, image: 'images/chambre2.jpg' },
        { type: 'Suite Familiale', description: '2 lits doubles, salon, climatisation, Wi-Fi, petit-déjeuner inclus.', prix: 60000, image: 'images/chambre3.jpg' }
      ]);
    }

    const formationCount = await Formation.count();
    if (formationCount === 0) {
      console.log('La table Formation est vide, ajout des formations de base...');
      await Formation.bulkCreate([
        { nom: 'Hôtellerie', description: 'Gestion, accueil, service en salle, entretien des chambres.', duree: '3 mois', image: 'images/formation-hotellerie.jpg' },
        { nom: 'Tourisme', description: 'Organisation de circuits, accueil touristique, gestion de groupes.', duree: '2 mois', image: 'images/formation-tourisme.jpg' },
        { nom: 'Blanchisserie Pro', description: 'Techniques de lavage, repassage, gestion des commandes.', duree: '1 mois', image: 'images/formation-blanchisserie.jpg' }
      ]);
    }

    const blanchisserieCount = await Blanchisserie.count();
    if (blanchisserieCount === 0) {
      console.log('La table Blanchisserie est vide, ajout des tarifs de base...');
      await Blanchisserie.bulkCreate([
        { article: 'Chemise', prix: 500 },
        { article: 'Pantalon', prix: 700 },
        { article: 'Robe', prix: 1000 },
        { article: 'Drap (la paire)', prix: 1500 }
      ]);
    }

    const blogCount = await Blog.count();
    if (blogCount === 0) {
      console.log('La table Blog est vide, ajout des articles de base...');
      await Blog.bulkCreate([
        { 
          titre: 'Découvrez la cuisine sahélienne', 
          contenu: 'Un voyage culinaire au cœur du Sahel. Nos chefs vous partagent les secrets des plats traditionnels revisités avec une touche de modernité. De la sauce gombo au poisson braisé, chaque bouchée est une histoire.', 
          image: 'images/sahel-cuisine.jpg', 
          categorie: 'Cuisine' 
        },
        { 
          titre: 'Conseils pour un séjour inoubliable à Moundou', 
          contenu: 'Moundou, la capitale économique du Tchad, regorge de trésors cachés. Voici nos conseils pour profiter au maximum de votre séjour, des marchés locaux aux excursions sur le fleuve Logone.', 
          image: 'images/sejour-kemdeholo.jpg', 
          categorie: 'Tourisme' 
        },
        { 
          titre: 'L\'hôtellerie, un secteur d\'avenir au Tchad', 
          contenu: 'Le secteur de l\'hôtellerie est en pleine expansion. Découvrez pourquoi nos formations peuvent vous ouvrir les portes d\'une carrière passionnante et pleine d\'opportunités.', 
          image: 'images/formation-hotellerie.jpg', 
          categorie: 'Formation' 
        }
      ]);
    }

    const testimonialCount = await Testimonial.count();
    if (testimonialCount === 0) {
      console.log('La table Testimonial est vide, ajout des témoignages de base...');
      await Testimonial.bulkCreate([
        { name: 'Fatimé', category: 'Restaurant', quote: 'Une expérience culinaire inoubliable ! Le poisson braisé était divin.', image: 'images/formation-eleve2.jpg', rating: 5, status: 'approved' },
        { name: 'Moussa D.', category: 'Restaurant', quote: 'Le meilleur poulet DG de la ville. Le service est rapide et le personnel très accueillant.', image: 'images/formation-eleve1.jpg', rating: 5, status: 'approved' },
        { name: 'Aisha', category: 'Restaurant', quote: 'L\'ambiance est parfaite pour un dîner en famille. Les jus locaux sont un délice !', image: 'images/formation-eleve3.jpg', rating: 4, status: 'approved' },
        { name: 'Djemenda Clémence', category: 'Hebergement', quote: 'Un séjour inoubliable ! Les chambres sont confortables et le personnel est d\'une gentillesse rare. Je me suis sentie comme à la maison.', image: 'images/placeholder-avatar.png', rating: 5, status: 'approved' },
        { name: 'Bemadjibeye Ruth', category: 'Restaurant', quote: 'Le restaurant de KemdeHolo est devenu ma cantine. La cuisine est délicieuse, authentique et les prix sont très corrects. Un vrai régal !', image: 'images/placeholder-avatar.png', rating: 5, status: 'approved' },
        { name: 'Djimarem Roland', category: 'Blanchisserie', quote: 'Le service de blanchisserie est impeccable et rapide. Mon linge est toujours parfait. Un service de grande qualité que je recommande vivement.', image: 'images/placeholder-avatar.png', rating: 5, status: 'approved' },
        { name: 'Aïcha Mahamat', category: 'Formation', quote: 'La formation en service m\'a ouvert les portes d\'un grand hôtel à N\'Djamena. Merci KemdeHolo !', image: 'images/placeholder-avatar.png', rating: 5, status: 'approved' },
        { name: 'Moussa Dallah', category: 'Formation', quote: 'Les techniques apprises en cuisine sont directement applicables. J\'ai pu améliorer mes plats et satisfaire mes clients.', image: 'images/placeholder-avatar.png', rating: 5, status: 'approved' }
      ]);
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));

  } catch (error) {
    console.error('Impossible de démarrer le serveur:', error);
  }
}

startServer();
