const nodemailer = require('nodemailer');

// Configuration du "transporteur" d'email.
// Pour cet exemple, nous utilisons Gmail. Pour une application en production,
// il est fortement recommandé d'utiliser un service transactionnel comme SendGrid, Mailgun, ou Brevo.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse email Gmail
    pass: process.env.EMAIL_PASS, // Le mot de passe d'application généré par Google
  },
});

/**
 * Envoie un email de confirmation de réservation.
 * @param {object} reservation - L'objet de réservation contenant les détails.
 */
async function sendReservationConfirmation(reservation) {
  const mailOptions = {
    from: `"KemdeHolo" <${process.env.EMAIL_USER}>`,
    to: reservation.customerEmail,
    subject: 'Confirmation de votre réservation chez KemdeHolo',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Bonjour ${reservation.customerName},</h2>
        <p>Nous avons le plaisir de vous confirmer votre réservation chez KemdeHolo.</p>
        <h3>Détails de votre réservation :</h3>
        <ul>
          <li><strong>Type de chambre :</strong> ${reservation.roomType}</li>
          <li><strong>Date d'arrivée :</strong> ${new Date(reservation.arrivalDate).toLocaleDateString('fr-FR')}</li>
          <li><strong>Date de départ :</strong> ${new Date(reservation.departureDate).toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>Nous sommes impatients de vous accueillir.</p>
        <p>Cordialement,<br>L'équipe de KemdeHolo</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmation envoyé à ${reservation.customerEmail}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email de confirmation:`, error);
  }
}

module.exports = { sendReservationConfirmation };