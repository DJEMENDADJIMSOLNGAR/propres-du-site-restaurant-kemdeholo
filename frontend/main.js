// --- Gestion de l'animation de chargement (Preloader) ---
window.addEventListener('load', () => {
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
        // Ajoute la classe pour déclencher l'animation de disparition
        loaderContainer.classList.add('loader-hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.querySelector('footer[id="main-footer"]');

    const loadComponent = async (url, placeholder) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${url}`);
            }
            const text = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            const componentElement = tempDiv.firstElementChild;
            placeholder.replaceWith(componentElement);
            return componentElement;
        } catch (error) {
            console.error(error);
            placeholder.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        }
    };

    const initFooterAnimations = (footerElement) => {
        const footerLinks = footerElement.querySelectorAll('.footer-link-reveal');
        if (footerLinks.length > 0) {
            const footerObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 80); // Délai progressif de 80ms
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            footerLinks.forEach(link => footerObserver.observe(link));
        }
    };

    const initializeComponents = async () => {
        // Load header and footer in parallel
        const [header, footer] = await Promise.all([
            headerPlaceholder ? loadComponent('_header.html', headerPlaceholder) : document.getElementById('main-header'),
            footerPlaceholder ? loadComponent('_footer.html', footerPlaceholder) : Promise.resolve()
        ]).catch(err => console.error("Error loading components", err));

        if (footer) {
            footer.classList.add('main-footer');
            initFooterAnimations(footer);
        }

        const mainHeader = document.getElementById('main-header');

        // --- After header is loaded, initialize its scripts ---
        if (mainHeader) {
            // Active link styling
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = header.querySelectorAll('a');
            navLinks.forEach(link => {
                const linkPage = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
                if (linkPage === currentPage) {
                    link.classList.add('font-semibold', 'text-secondary-red');
                }
            });

            // Mobile menu toggle
            const menuBtn = mainHeader.querySelector('#menuBtn');
            const mobileMenu = mainHeader.querySelector('#mobileMenu');
           if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', () => {
                    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
                    menuBtn.setAttribute('aria-expanded', !isExpanded);
                    mobileMenu.classList.toggle('hidden');
                });
            }

            // --- Navbar scroll effect ---
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('scrolled');
                } else {
                    mainHeader.classList.remove('scrolled');
                }
            };

            if (currentPage === 'index.html') {
                const heroContainer = document.getElementById('hero-container');
                heroContainer.innerHTML = `
                    <div class="hero-slider">
                        <div class="hero-slide" style="background-image: url('https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');"></div>
                        <div class="hero-slide" style="background-image: url('https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');"></div>
                        <div class="hero-slide" style="background-image: url('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');"></div>
                        <div class="hero-slide" style="background-image: url('https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');"></div>
                        <div class="hero-slide" style="background-image: url('https://images.pexels.com/photos/1449775/pexels-photo-1449775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');"></div>
                    </div>
                    <div class="hero-content absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <h1 class="text-5xl md:text-6xl font-bold mb-6" data-translate-key="home_hero_title">Bienvenue chez KemdeHolo</h1>
                        <p class="text-xl mb-8 text-white" data-translate-key="home_hero_subtitle">Découvrez l'authenticité de l'hospitalité sahélienne</p>
                        <a href="contact.html" class="btn-primary" data-translate-key="home_hero_button">Nous contacter</a>
                    </div>
                `;
                $('.hero-slider').slick({
                    dots: true, arrows: false, infinite: true, speed: 1000,
                    fade: true, autoplay: true, autoplaySpeed: 7000, cssEase: 'linear'
                });
                window.addEventListener('scroll', handleScroll);
                handleScroll();
            } else {
                // Pour les autres pages que l'accueil, on ajoute un espace en haut pour compenser le header fixe
                if (currentPage !== 'index.html') {
                    const mainContent = document.querySelector('body > section:first-of-type, body > main:first-of-type'); // On cible la première section ou le main
                    if(mainContent && !mainContent.classList.contains('hero-section')) { // On vérifie que ce n'est PAS une hero-section
                        mainContent.style.paddingTop = `${mainHeader.offsetHeight}px`;
                    }
                    mainHeader.classList.add('scrolled'); // Reste noir sur les autres pages
                }
            }
        }
    };

    initializeComponents();

    // --- Animation au défilement (Scroll Reveal avec IntersectionObserver) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // L'élément est visible, on retire les transformations pour lancer l'animation
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target); // On arrête d'observer l'élément une fois animé
                }
            });
        }, {
            threshold: 0.1
        }); // L'animation se déclenche quand 10% de l'élément est visible

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // --- Animation des compteurs ---
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const animateCountUp = (el) => {
            const target = +el.getAttribute('data-target');
            const duration = 2000; // 2 secondes
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;

            const counter = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                const currentCount = Math.round(target * progress);

                if (el.innerText.includes('+')) {
                    el.innerText = `${currentCount}+`;
                } else {
                    el.innerText = currentCount;
                }

                if (frame === totalFrames) {
                    clearInterval(counter);
                }
            }, frameDuration);
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCountUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // --- Animation pour les cartes de service ---
    const serviceCards = document.querySelectorAll('.service-card-animated');
    if (serviceCards.length > 0) {
        const serviceCardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Applique un délai progressif pour un effet de cascade
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100); // 100ms de décalage entre chaque carte
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        serviceCards.forEach(card => {
            serviceCardObserver.observe(card);
        });
    }

    // --- Gestion des Témoignages (Slider et Modale) ---
    const testimonialSliderWrapper = document.getElementById('testimonial-slider-wrapper');
    if (testimonialSliderWrapper) {
        const category = testimonialSliderWrapper.dataset.category || '';

        const chargerTemoignages = async (categorie) => {
            try {
                let url = '/api/testimonials';
                if (categorie) {
                    url += `?category=${categorie}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error('Erreur de chargement des témoignages.');
                const testimonials = await response.json();

                const sliderContent = document.getElementById('testimonial-slider-content');
                const sliderNav = document.getElementById('testimonial-slider-nav');

                if (!testimonials || testimonials.length === 0) {
                    if (categorie) {
                        testimonialSliderWrapper.innerHTML = `<p class="text-center text-white/70">Aucun témoignage pour la catégorie "${categorie}" pour le moment.</p>`;
                    } else {
                        testimonialSliderWrapper.innerHTML = `<p class="text-center text-white/70">Aucun témoignage pour le moment.</p>`;
                    }
                    testimonialSliderWrapper.classList.remove('hidden');
                    return;
                }

                sliderContent.innerHTML = testimonials.map(t => {
                    // Générer les étoiles en fonction de la note
                    const stars = Array.from({ length: 5 }, (_, i) => 
                        `<i class="fas fa-star ${i < t.rating ? 'text-secondary-red' : 'text-black'}"></i>`
                    ).join('');

                    return `
                        <div class="testimonial-item">
                            <img src="${t.image || 'images/placeholder-avatar.png'}" alt="${t.name}" class="author-image">
                            <div class="testimonial-bubble">
                                <p>"${t.quote}"</p>
                            </div>
                            <div class="testimonial-rating">${stars}</div> 
                            <span class="author-name">${t.name}</span>
                        </div>
                    `;
                }).join('');

                sliderNav.innerHTML = testimonials.map(t => `
                    <div>
                        <img src="${t.image || 'images/placeholder-avatar.png'}" alt="${t.name}" class="author-image-nav">
                    </div>
                `).join('');

                // S'assurer que jQuery et Slick sont chargés
                if (typeof $ !== 'undefined' && $.fn.slick) {
                    $('#testimonial-slider-content').slick({
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        arrows: false,
                        asNavFor: '#testimonial-slider-nav',
                        autoplay: true,
                        autoplaySpeed: 7000, // Ralentit le défilement de 5s à 7s
                        pauseOnHover: true,
                        responsive: [
                            { breakpoint: 768, settings: { slidesToShow: 1 } }
                        ]
                    });
                    $('#testimonial-slider-nav').slick({
                        slidesToShow: Math.min(5, testimonials.length), // Affiche jusqu'à 5 avatars, ou moins si pas assez de témoignages
                        slidesToScroll: 1, asNavFor: '#testimonial-slider-content', dots: false, centerMode: true, focusOnSelect: true, arrows: false
                    });
                    testimonialSliderWrapper.classList.remove('hidden');

                    // Fonction pour égaliser la hauteur des témoignages
                    const equalizeTestimonialHeights = () => {
                        let maxHeight = 0;
                        const $testimonials = $('#testimonial-slider-content .testimonial-item');
                        $testimonials.css('height', 'auto'); // Réinitialiser la hauteur
                        $testimonials.each(function() {
                            if ($(this).height() > maxHeight) {
                                maxHeight = $(this).height();
                            }
                        });
                        $testimonials.css('height', maxHeight + 'px');
                    };

                    // Appliquer l'égalisation au chargement et lors du redimensionnement
                    equalizeTestimonialHeights();
                    $(window).on('resize', equalizeTestimonialHeights);
                    $('#testimonial-slider-content').on('setPosition', equalizeTestimonialHeights); // Événement Slick après changement de slide
                } else {
                    console.error("jQuery or Slick Carousel is not loaded.");
                }
            } catch (error) {
                console.error(error);
                testimonialSliderWrapper.innerHTML = `<p class="text-center text-yellow-400">${error.message}</p>`;
                testimonialSliderWrapper.classList.remove('hidden');
            }
        };
        chargerTemoignages(category);
    }

    // --- Modale pour laisser un témoignage ---
    const showFormBtn = document.getElementById('show-testimonial-form-btn');
    const testimonialModal = document.getElementById('testimonial-modal');
    const closeBtn = document.getElementById('close-testimonial-modal-btn');
    const testimonialForm = document.getElementById('public-testimonial-form');

    if (showFormBtn && testimonialModal && closeBtn) {
        showFormBtn.addEventListener('click', () => {
            testimonialModal.classList.remove('hidden');
            testimonialModal.classList.add('flex');
        });
        closeBtn.addEventListener('click', () => {
            testimonialModal.classList.add('hidden');
            testimonialModal.classList.remove('flex');
        });
    }

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('testimonial-form-message');
            const formData = {
                name: document.getElementById('public-testimonial-name').value,
                category: document.getElementById('public-testimonial-category').value,
                quote: document.getElementById('public-testimonial-quote').value,
                rating: document.querySelector('input[name="rating"]:checked')?.value
            };

            try {
                const response = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.');
                messageDiv.textContent = result.message;
                messageDiv.className = 'bg-green-100 text-green-800 p-3 rounded-md text-center font-bold';
                messageDiv.classList.remove('hidden');
                testimonialForm.reset();
            } catch (error) {
                messageDiv.textContent = `Erreur: ${error.message}`;
                messageDiv.className = 'bg-red-100 text-red-800 p-3 rounded-md text-center font-bold';
                messageDiv.classList.remove('hidden');
            }
        });
    }

    // --- Gestion de la modale de réservation ---
    const reservationModal = document.getElementById('reservation-modal');
    const bookButtons = document.querySelectorAll('.btn-book-room'); // Boutons "Réserver" sur les cartes de chambre
    const closeReservationModalBtn = document.getElementById('close-reservation-modal-btn');
    const arrivalDateInput = document.getElementById('arrival-date');
    const departureDateInput = document.getElementById('departure-date');
    const roomTypeSelect = document.getElementById('room-type-select');

    if (reservationModal && bookButtons.length > 0 && closeReservationModalBtn) {
        // Fonction pour charger les types de chambres dans le select
        const populateRoomTypes = async () => {
            if (!roomTypeSelect) return;
            try {
                const response = await fetch('/api/hebergement');
                if (!response.ok) throw new Error('Impossible de charger les types de chambres.');
                const rooms = await response.json();
                roomTypeSelect.innerHTML = '<option value="">Sélectionnez un type de chambre</option>';
                rooms.forEach(room => {
                    roomTypeSelect.innerHTML += `<option value="${room.type}">${room.type}</option>`;
                });
            } catch (error) {
                console.error(error);
                roomTypeSelect.innerHTML = `<option value="">Erreur de chargement</option>`;
            }
        };

        const openModal = (event) => {
            reservationModal.classList.remove('hidden');
            reservationModal.classList.add('flex');
            // Pré-sélectionner le type de chambre si disponible
            const roomType = event.currentTarget.dataset.roomType;
            if (roomType && roomTypeSelect) {
                roomTypeSelect.value = roomType;
            }
        };

        const closeModal = () => {
            reservationModal.classList.add('hidden');
            reservationModal.classList.remove('flex');
        };

        // Charger les types de chambres au chargement de la page
        populateRoomTypes();

        bookButtons.forEach(btn => btn.addEventListener('click', (e) => openModal(e)));
        closeReservationModalBtn.addEventListener('click', closeModal);

        // --- Validation des dates pour la réservation ---
        if (arrivalDateInput && departureDateInput) {
            const today = new Date().toISOString().split('T')[0];
            arrivalDateInput.setAttribute('min', today);

            arrivalDateInput.addEventListener('change', () => {
                // La date de départ doit être au moins le jour de l'arrivée
                if (arrivalDateInput.value) {
                    departureDateInput.setAttribute('min', arrivalDateInput.value);
                    // Si la date de départ actuelle est avant la nouvelle date d'arrivée, on la réinitialise
                    if (departureDateInput.value < arrivalDateInput.value) {
                        departureDateInput.value = arrivalDateInput.value;
                    }
                }
            });
        }

        // --- Soumission du formulaire de réservation ---
        const reservationForm = document.getElementById('reservation-form');
        if (reservationForm) {
            reservationForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Empêche l'envoi classique du formulaire

                // Validation de la date côté client avant envoi
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const arrivalDate = new Date(arrivalDateInput.value);

                if (arrivalDate < today) {
                    alert("La date d'arrivée ne peut pas être dans le passé. Veuillez choisir une date valide.");
                    return; // Bloque l'envoi
                }

                const formData = new FormData(reservationForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch('/api/reservations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();

                    if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.');

                    alert(result.message); // Affiche le message de succès
                    
                    // On réinitialise le formulaire et on ferme la modale
                    reservationForm.reset();
                    roomTypeSelect.value = ""; // S'assure que le select est aussi réinitialisé
                    closeModal();
                } catch (error) {
                    alert(`Erreur: ${error.message}`); // Affiche le message d'erreur
                }
            });
        }
    }

    // --- Chargement des actualités pour la page d'accueil ---
    const actualitesGrid = document.getElementById('actualites-grid');
    // On vérifie qu'on est bien sur la page d'accueil en testant un élément parent spécifique
    if (actualitesGrid && document.getElementById('actualites-section')) {
        const chargerActualites = async () => {
            try {
                const response = await fetch('/api/articles');
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                const articles = await response.json();

                if (!articles || articles.length === 0) {
                    actualitesGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">Aucune actualité pour le moment.</p>';
                    return;
                }

                // Afficher les 3 articles les plus récents
                actualitesGrid.innerHTML = articles.slice(0, 3).map(article => `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <div class="overflow-hidden">
                            <a href="blog-article.html?id=${article.id}" class="block">
                                <img src="${article.image || 'images/placeholder-image.png'}" alt="${article.titre}" class="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300">
                            </a>
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <div class="text-sm text-black mb-2">
                                <span class="font-semibold text-black">${article.categorie || 'Non classé'}</span>
                                <span class="mx-2">|</span>
                                <span>${new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <h3 class="text-xl font-bold text-black mb-3 flex-grow hover:text-gray-700 transition-colors"><a href="blog-article.html?id=${article.id}">${article.titre}</a></h3>
                            <p class="text-black text-sm mb-6">${(article.contenu || '').substring(0, 120)}...</p> 
                            <a href="blog-article.html?id=${article.id}" class="mt-auto text-white bg-black hover:bg-secondary-red font-bold py-2 px-4 rounded-full self-start transition-colors duration-300" aria-label="Lire la suite de l'article ${article.titre}">Lire la suite</a>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error("Erreur lors du chargement des actualités:", error);
                actualitesGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Impossible de charger les actualités.</p>';
            }
        };
        chargerActualites();
    }

    // --- Formulaire Newsletter ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const messageP = document.getElementById('newsletter-message');
            const email = emailInput.value;

            try {
                const response = await fetch('/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                messageP.textContent = data.message;
                messageP.className = 'mb-8 text-green-300 max-w-xl mx-auto'; // Remplacer les classes pour assurer la couleur
                localStorage.setItem('refreshAdminData', 'subscribers_' + Date.now());
                emailInput.value = '';
            } catch (error) {
                messageP.textContent = 'Une erreur est survenue. Veuillez réessayer.';
                messageP.className = 'mb-8 text-red-500 max-w-xl mx-auto'; // Remplacer les classes pour assurer la couleur
            }
        });
    }

    // --- Initialisation des carrousels (Slick) ---
    // Note: jQuery est nécessaire pour Slick. Assurez-vous qu'il est chargé avant ce script.
    if (typeof $ !== 'undefined' && $.fn.slick) {
        // Carrousel des partenaires
        const partnerCarousel = $('.partner-carousel');
        if (partnerCarousel.length) {
            partnerCarousel.slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 0,
                speed: 5000,
                cssEase: 'linear',
                infinite: true,
                arrows: false,
                dots: false,
                pauseOnHover: true,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2
                    }
                }]
            });
        }
    }

    // --- Gestion du bouton "Retour en haut" ---
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        // Afficher le bouton si on a défilé de plus de 300px
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        });

        // Action au clic : remonter en haut de la page avec un défilement doux
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});