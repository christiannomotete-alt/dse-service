const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-navigation');
const navLinks = document.querySelectorAll('#main-navigation a');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const sections = document.querySelectorAll('main section[id]');
const backToTopLink = document.querySelector('.back-to-top');
const form = document.getElementById('contact-form');
const formError = document.getElementById('form-error');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('contact-submit');
const contactMap = document.getElementById('contact-map');

const analyticsConfig = window.DSE_ANALYTICS || {};
const ga4MeasurementId = String(analyticsConfig.ga4MeasurementId || '').trim().toUpperCase();
const ga4IdPattern = /^G-[A-Z0-9]{6,}$/;

const initGa4 = () => {
    if (!ga4IdPattern.test(ga4MeasurementId)) {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', ga4MeasurementId, {
        anonymize_ip: analyticsConfig.anonymizeIp !== false
    });

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
    document.head.appendChild(gaScript);
};

const trackEvent = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...params
    });
};

initGa4();

document.addEventListener('click', (event) => {
    const clickedLink = event.target.closest('a');

    if (!clickedLink) {
        return;
    }

    const href = clickedLink.getAttribute('href') || '';
    const label = (clickedLink.textContent || '').trim();

    if (href.startsWith('tel:')) {
        trackEvent('click_phone', {
            event_category: 'engagement',
            event_label: href,
            link_text: label
        });
        return;
    }

    if (href.includes('wa.me')) {
        trackEvent('click_whatsapp', {
            event_category: 'engagement',
            event_label: href,
            link_text: label || 'WhatsApp'
        });
    }
});

const closeMenu = () => {
    if (!menu || !menuToggle) {
        return;
    }

    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
};

const openMenu = () => {
    if (!menu || !menuToggle) {
        return;
    }

    menu.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fermer le menu');
};

if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            closeMenu();
            return;
        }

        openMenu();
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
        const clickedInsideMenu = menu.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (window.innerWidth <= 768 && menu.classList.contains('open') && !clickedInsideMenu && !clickedToggle) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

const closeDropdowns = () => {
    navDropdowns.forEach((dropdown) => dropdown.classList.remove('is-open'));
};

if (navDropdowns.length > 0) {
    navDropdowns.forEach((dropdown) => {
        const toggleLink = dropdown.querySelector('.nav-dropdown-toggle');

        if (!toggleLink) {
            return;
        }

        toggleLink.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                return;
            }

            const isOpen = dropdown.classList.contains('is-open');

            if (!isOpen) {
                event.preventDefault();
                closeDropdowns();
                dropdown.classList.add('is-open');
            }
        });
    });

    document.addEventListener('click', (event) => {
        const clickedInsideDropdown = Array.from(navDropdowns).some((dropdown) => dropdown.contains(event.target));

        if (!clickedInsideDropdown) {
            closeDropdowns();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDropdowns();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            closeDropdowns();
        }
    });
}

const faders = document.querySelectorAll('.fade-in');

if (faders.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15
    });

    faders.forEach((element) => fadeObserver.observe(element));
}

const normalizePath = (pathValue) => {
    const value = String(pathValue || '').trim().toLowerCase();

    if (value === '' || value === '/' || value.endsWith('/index.html')) {
        return '/index.html';
    }

    return value.startsWith('/') ? value : `/${value}`;
};

const currentPath = normalizePath(window.location.pathname);
const hasHashNavigation = Array.from(navLinks).some((link) => String(link.getAttribute('href') || '').startsWith('#'));

if (hasHashNavigation) {
    const setActiveLinkBySection = (id) => {
        navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
                link.setAttribute('aria-current', 'page');
                return;
            }

            link.removeAttribute('aria-current');
        });
    };

    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            const visibleEntries = entries
                .filter((entry) => entry.isIntersecting)
                .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

            if (visibleEntries.length > 0) {
                setActiveLinkBySection(visibleEntries[0].target.id);
            }
        }, {
            threshold: [0.25, 0.5, 0.75],
            rootMargin: '-35% 0px -45% 0px'
        });

        sections.forEach((section) => sectionObserver.observe(section));
        setActiveLinkBySection(sections[0].id);
    }
} else {
    navLinks.forEach((link) => {
        const href = String(link.getAttribute('href') || '').trim();

        if (href === '' || href.startsWith('#')) {
            link.removeAttribute('aria-current');
            return;
        }

        let linkPath = href;

        if (/^https?:\/\//i.test(href)) {
            try {
                linkPath = new URL(href).pathname;
            } catch (error) {
                link.removeAttribute('aria-current');
                return;
            }
        }

        if (normalizePath(linkPath) === currentPath) {
            link.setAttribute('aria-current', 'page');
            return;
        }

        link.removeAttribute('aria-current');
    });
}

const updateBackToTopVisibility = () => {
    if (!backToTopLink) {
        return;
    }

    const shouldShow = window.scrollY > 500;
    backToTopLink.classList.toggle('is-visible', shouldShow);
    backToTopLink.setAttribute('aria-hidden', String(!shouldShow));
};

if (backToTopLink) {
    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

    backToTopLink.addEventListener('click', () => {
        trackEvent('click_back_to_top', {
            event_category: 'navigation',
            event_label: 'floating_button'
        });
    });
}

if (contactMap) {
    contactMap.addEventListener('load', () => {
        trackEvent('map_displayed', {
            event_category: 'engagement',
            event_label: 'contact_map'
        });
    }, { once: true });
}

const hideFeedback = () => {
    if (formError) {
        formError.hidden = true;
    }

    if (formStatus) {
        formStatus.hidden = true;
        formStatus.textContent = '';
    }

    if (form) {
        form.setAttribute('aria-busy', 'false');
    }
};

if (form) {
    form.addEventListener('input', hideFeedback);

    form.addEventListener('submit', (event) => {
        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const message = form.elements.message.value.trim();
        const serviceField = form.elements.service;
        const service = serviceField ? String(serviceField.value || '').trim() : '';
        const consentField = form.elements.consent;
        const consentAccepted = consentField ? Boolean(consentField.checked) : true;
        const honeypot = form.elements.website.value.trim();
        const action = form.getAttribute('action') || '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        hideFeedback();

        if (honeypot !== '') {
            event.preventDefault();
            formError.textContent = 'Envoi bloqué : spam détecté.';
            formError.hidden = false;

            trackEvent('lead_form_blocked_spam', {
                event_category: 'form',
                event_label: 'honeypot'
            });
            return;
        }

        if (name === '' || email === '' || message === '') {
            event.preventDefault();
            formError.textContent = 'Veuillez remplir tous les champs.';
            formError.hidden = false;

            trackEvent('lead_form_error', {
                event_category: 'form',
                event_label: 'missing_fields'
            });
            return;
        }

        if (serviceField && service === '') {
            event.preventDefault();
            formError.textContent = 'Veuillez sélectionner le service concerné.';
            formError.hidden = false;

            trackEvent('lead_form_error', {
                event_category: 'form',
                event_label: 'missing_service'
            });
            return;
        }

        if (consentField && !consentAccepted) {
            event.preventDefault();
            formError.textContent = 'Veuillez accepter la politique de confidentialite avant l\'envoi.';
            formError.hidden = false;

            trackEvent('lead_form_error', {
                event_category: 'form',
                event_label: 'missing_consent'
            });
            return;
        }

        if (!emailRegex.test(email)) {
            event.preventDefault();
            formError.textContent = 'Veuillez saisir une adresse email valide.';
            formError.hidden = false;

            trackEvent('lead_form_error', {
                event_category: 'form',
                event_label: 'invalid_email'
            });
            return;
        }

        if (!action.includes('formspree.io/f/')) {
            event.preventDefault();
            formError.textContent = 'Le formulaire de contact n’est pas correctement configuré. Utilisez le téléphone, WhatsApp ou l’adresse email affichés à droite.';
            formError.hidden = false;

            trackEvent('lead_form_error', {
                event_category: 'form',
                event_label: 'invalid_action'
            });
            return;
        }

        trackEvent('lead_form_submit', {
            event_category: 'lead',
            event_label: 'contact_form',
            service
        });

        try {
            window.sessionStorage.setItem('dse_lead_pending', '1');
        } catch (storageError) {
            // Ignore storage failures (privacy mode, disabled storage, etc.).
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
        }

        form.setAttribute('aria-busy', 'true');

        if (formStatus) {
            formStatus.textContent = 'Votre demande est en cours d’envoi.';
            formStatus.hidden = false;
        }
    });
}

const pathname = String(window.location.pathname || '').toLowerCase();
const isThankYouPage = pathname.endsWith('/merci.html') || pathname === '/merci.html';

if (isThankYouPage) {
    let hadPendingLead = false;

    try {
        hadPendingLead = window.sessionStorage.getItem('dse_lead_pending') === '1';

        if (hadPendingLead) {
            window.sessionStorage.removeItem('dse_lead_pending');
        }
    } catch (storageError) {
        hadPendingLead = false;
    }

    trackEvent('lead_thank_you_view', {
        event_category: 'lead',
        event_label: hadPendingLead ? 'confirmed_submission' : 'direct_visit'
    });

    if (hadPendingLead) {
        trackEvent('lead_form_success', {
            event_category: 'lead',
            event_label: 'formspree_redirect'
        });
    }
}
