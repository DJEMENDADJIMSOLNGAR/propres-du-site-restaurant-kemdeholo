const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');


// Route POST pour enregistrer un contact (Sequelize)
router.post('/', async (req, res) => {
  try {
    const { prenom, nom, email, sujet, message } = req.body;
    if (!nom || !email || !message) {
      return res.status(400).json({ success: false, error: 'Tous les champs obligatoires (nom, email, message).' });
    }
    const contact = await Contact.create({ prenom, nom, email, sujet, message });
    res.json({ success: true, message: 'Message enregistré', contact });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
