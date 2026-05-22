// Menu burger functionality
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Gestion du sélecteur de langue
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function(e) {
            console.log('Langue sélectionnée:', e.target.value);
            // Ici on ajoutera la logique de changement de langue
            alert('Fonctionnalité multilingue à venir dans une prochaine version');
        });
    }

    // Gestion des formulaires
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Logique d'envoi du formulaire
            alert('Message envoyé avec succès!');
            contactForm.reset();
        });
    }
});

// Fonctions pour l'administration
function adminLogin() {
    const token = document.getElementById('admin-token').value;
    // Logique d'authentification simple
    if (token === "VOTRE_TOKEN_STATIQUE") {
        window.location.href = '/admin/dashboard';
    } else {
        alert('Token incorrect');
    }
}
