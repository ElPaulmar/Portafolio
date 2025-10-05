/**
 * Portafolio Paulo Marques - JavaScript Principal
 * Versión actualizada para multi-página
 */

// Configuración global
const CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 80,
  NOTIFICATION_DURATION: 4000,
  THROTTLE_DELAY: 16,
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_MARGIN: '50px'
};

// Estado global
const AppState = {
  isPreloaded: false,
  isMobileMenuOpen: false,
  currentSection: null,
  scrollY: 0,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  currentPage: window.location.pathname.split('/').pop() || 'index.html'
};

// Utilidades
const Utils = {
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  smoothScrollTo: (target, offset = CONFIG.SCROLL_OFFSET) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: AppState.reducedMotion ? 'auto' : 'smooth'
      });
    } else {
      window.scrollTo(0, targetPosition);
    }
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email?.trim());
  },

  escapeHtml: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  isMobile: () => window.innerWidth <= 900
};

/**
 * Intersection Observer Manager
 */
class IntersectionManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    this.createObserver('scroll-animations', {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: CONFIG.INTERSECTION_MARGIN
    }, this.handleScrollAnimations.bind(this));

    this.createObserver('skill-bars', {
      threshold: 0.3,
      rootMargin: '100px'
    }, this.handleSkillBars.bind(this));

    this.createObserver('sections', {
      threshold: 0.5,
      rootMargin: '-100px 0px -50% 0px'
    }, this.handleActiveNavigation.bind(this));
  }

  createObserver(name, options, callback) {
    const observer = new IntersectionObserver(callback, options);
    this.observers.set(name, observer);
    return observer;
  }

  observe(name, elements) {
    const observer = this.observers.get(name);
    if (!observer) return;

    if (Array.isArray(elements)) {
      elements.forEach(el => observer.observe(el));
    } else {
      observer.observe(elements);
    }
  }

  handleScrollAnimations(entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting && !entry.target.classList.contains('in-view')) {
        if (AppState.reducedMotion) {
          entry.target.classList.add('in-view');
        } else {
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, index * 50);
        }
      }
    });
  }

  handleSkillBars(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillFills = entry.target.querySelectorAll('.skill-fill:not(.animated)');
        skillFills.forEach((bar, index) => {
          const skillValue = bar.getAttribute('data-skill');
          if (skillValue) {
            bar.classList.add('animated');
            setTimeout(() => {
              bar.style.width = skillValue + '%';
            }, AppState.reducedMotion ? 0 : index * 200);
          }
        });
        this.observers.get('skill-bars').unobserve(entry.target);
      }
    });
  }

  handleActiveNavigation(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        AppState.currentSection = entry.target.id;
        this.updateActiveLinks(entry.target.id);
      }
    });
  }

  updateActiveLinks(sectionId) {
    // Actualizar navegación principal
    const navLinks = document.querySelectorAll('#header nav a, .mobile-menu a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('#')) {
        const linkSection = href.split('#')[1];
        if (linkSection === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });

    // Actualizar sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-link, .sidebar-sublink');
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const linkSection = href.substring(1);
        if (linkSection === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }
}

/**
 * Header Manager
 */
class HeaderManager {
  constructor() {
    this.header = document.getElementById('header');
    this.lastScrollY = window.pageYOffset;
    this.init();
  }

  init() {
    if (!this.header) return;

    const handleScroll = Utils.throttle(() => {
      this.updateHeader();
    }, CONFIG.THROTTLE_DELAY);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateHeader() {
    const currentScrollY = window.pageYOffset;
    
    if (currentScrollY > 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    if (Utils.isMobile()) {
      if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }
    }

    this.lastScrollY = currentScrollY;
    AppState.scrollY = currentScrollY;
  }
}

/**
 * Mobile Menu Manager
 */
class MobileMenuManager {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.menu = document.querySelector('.mobile-menu');
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (AppState.isMobileMenuOpen && 
          !this.menu.contains(e.target) && 
          !this.toggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
        this.closeMenu();
      }
    });

    window.addEventListener('resize', Utils.debounce(() => {
      if (!Utils.isMobile() && AppState.isMobileMenuOpen) {
        this.closeMenu();
      }
    }, 250));
  }

  toggleMenu() {
    if (AppState.isMobileMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    AppState.isMobileMenuOpen = true;
    this.menu.style.display = 'flex';
    this.toggle.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    this.toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    const firstLink = this.menu.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  closeMenu() {
    AppState.isMobileMenuOpen = false;
    this.menu.style.display = 'none';
    this.toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/**
 * Navigation Manager
 */
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#' || href === '') return;

      e.preventDefault();
      Utils.smoothScrollTo(href);
    });

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        const firstSection = document.querySelector('section[id]:not(#banner)');
        if (firstSection) {
          Utils.smoothScrollTo(`#${firstSection.id}`);
        }
      });
    }
  }
}

/**
 * Sidebar Manager
 */
class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('.sidebar-index');
    this.init();
  }

  init() {
    if (!this.sidebar) return;

    // Smooth scroll para links del sidebar
    this.sidebar.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        Utils.smoothScrollTo(target);
      });
    });

    // Actualizar posición en scroll
    const handleScroll = Utils.throttle(() => {
      this.updateSidebarPosition();
    }, CONFIG.THROTTLE_DELAY);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateSidebarPosition() {
    if (!this.sidebar || Utils.isMobile()) return;

    const scrollY = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Mantener el sidebar visible pero sin salirse del viewport
    if (scrollY > 100 && scrollY < maxScroll - 200) {
      this.sidebar.style.position = 'fixed';
      this.sidebar.style.top = '150px';
    }
  }
}

/**
 * Project Manager
 */
class ProjectManager {
  constructor() {
    this.init();
  }

  init() {
    const toggles = document.querySelectorAll('.toggle-process');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleProcess(toggle);
      });
    });
  }

  toggleProcess(toggle) {
    const isActive = toggle.classList.contains('active');
    const processId = toggle.getAttribute('aria-controls');
    const process = document.getElementById(processId);
    
    if (!process) return;

    toggle.classList.toggle('active');
    const icon = toggle.querySelector('i');
    
    if (isActive) {
      process.style.display = 'none';
      process.classList.remove('show');
      process.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
      process.style.display = 'block';
      process.classList.add('show');
      process.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      if (icon) icon.style.transform = 'rotate(180deg)';
      
      setTimeout(() => {
        if (!AppState.reducedMotion) {
          const rect = process.getBoundingClientRect();
          const scrollTarget = window.pageYOffset + rect.top - CONFIG.SCROLL_OFFSET;
          window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }
}

/**
 * Notification Manager
 */
class NotificationManager {
  constructor() {
    this.notification = document.getElementById('message-notification');
    this.queue = [];
    this.isShowing = false;
  }

  show(message, type = 'success') {
    this.queue.push({ message, type });
    this.processQueue();
  }

  async processQueue() {
    if (this.isShowing || this.queue.length === 0) return;
    
    this.isShowing = true;
    const { message, type } = this.queue.shift();
    
    await this.displayNotification(message, type);
    
    this.isShowing = false;
    
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 500);
    }
  }

  async displayNotification(message, type) {
    if (!this.notification) return;

    const iconMap = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const colorMap = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };

    this.notification.innerHTML = `
      <i class="fas ${iconMap[type] || iconMap.info}" aria-hidden="true"></i>
      <span>${Utils.escapeHtml(message)}</span>
    `;
    
    this.notification.style.background = colorMap[type] || colorMap.info;
    this.notification.classList.add('show');
    this.notification.setAttribute('role', type === 'error' ? 'alert' : 'status');

    return new Promise(resolve => {
      setTimeout(() => {
        this.notification.classList.remove('show');
        setTimeout(resolve, 300);
      }, CONFIG.NOTIFICATION_DURATION);
    });
  }
}

/**
 * Contact Form Manager
 */
class ContactFormManager {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.notification = new NotificationManager();
    this.init();
  }

  init() {
    if (!this.form) return;

    this.setupRealTimeValidation();
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('input', Utils.debounce(() => {
        this.updateSubmitButton();
      }, 300));

      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  updateSubmitButton() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const formData = new FormData(this.form);
    const errors = this.validateFormData(formData);
    
    submitButton.disabled = errors.length > 0;
  }

  validateFormData(formData) {
    const errors = [];
    
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();
    
    if (!name || name.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!email || !Utils.isValidEmail(email)) {
      errors.push('Por favor ingresa un email válido');
    }
    
    if (!message || message.length < 10) {
      errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    return errors;
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
      case 'text':
        if (field.hasAttribute('required') && value.length < 2) {
          isValid = false;
          errorMessage = 'Mínimo 2 caracteres';
        }
        break;
      case 'email':
        if (field.hasAttribute('required') && !Utils.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Email inválido';
        }
        break;
      default:
        if (field.tagName === 'TEXTAREA' && field.hasAttribute('required') && value.length < 10) {
          isValid = false;
          errorMessage = 'Mínimo 10 caracteres';
        }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.style.borderColor = '#e74c3c';
    field.setAttribute('aria-invalid', 'true');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  async handleSubmit() {
    const formData = new FormData(this.form);
    const errors = this.validateFormData(formData);
    
    if (errors.length > 0) {
      this.notification.show(errors[0], 'error');
      return;
    }

    const submitButton = this.form.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector('.button-text');
    
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonText.textContent = 'Enviando...';
    
    try {
      await this.simulateFormSubmission(formData);
      
      this.notification.show('¡Mensaje enviado correctamente! Te responderé pronto.');
      this.form.reset();
      this.updateSubmitButton();
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      this.notification.show('Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      buttonText.textContent = 'Enviar Mensaje';
    }
  }

  async simulateFormSubmission(formData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() < 0.05) {
      throw new Error('Error de red simulado');
    }
    
    return { success: true };
  }
}

/**
 * Interactivity Manager
 */
class InteractivityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.button');
      if (!button || AppState.reducedMotion) return;

      this.createRipple(button, e);
    });
  }

  createRipple(button, event) {
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    const circle = document.createElement('span');
    circle.classList.add('ripple');
    button.appendChild(circle);

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    circle.addEventListener('animationend', () => {
      if (circle.parentNode) {
        circle.remove();
      }
    });
  }
}

/**
 * Aplicación Principal
 */
class PortfolioApp {
  constructor() {
    this.intersectionManager = null;
    this.components = {};
    
    this.init();
  }

  async init() {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    this.handlePreloader();
    
    this.intersectionManager = new IntersectionManager();
    
    this.components = {
      header: new HeaderManager(),
      mobileMenu: new MobileMenuManager(),
      navigation: new NavigationManager(),
      sidebar: new SidebarManager(),
      projects: new ProjectManager(),
      contactForm: new ContactFormManager(),
      interactivity: new InteractivityManager()
    };

    this.setupObservers();
    this.setupGlobalListeners();
    this.applyInitialAnimations();

    console.log('Portafolio de Paulo Marques cargado correctamente');
  }

  handlePreloader() {
    setTimeout(() => {
      document.body.classList.remove('is-preload');
      AppState.isPreloaded = true;
    }, 100);
  }

  setupObservers() {
    const scrollElements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');
    this.intersectionManager.observe('scroll-animations', Array.from(scrollElements));

    const skillCategories = document.querySelectorAll('.skill-category');
    this.intersectionManager.observe('skill-bars', Array.from(skillCategories));

    const sections = document.querySelectorAll('section[id]');
    this.intersectionManager.observe('sections', Array.from(sections));
  }

  setupGlobalListeners() {
    window.addEventListener('error', (e) => {
      console.error('Error global capturado:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Promesa rechazada no manejada:', e.reason);
    });

    window.addEventListener('resize', Utils.debounce(() => {
      this.handleResize();
    }, 250));

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', (e) => {
      AppState.reducedMotion = e.matches;
    });

    window.addEventListener('beforeunload', () => {
      document.body.classList.add('is-preload');
    });
  }

  handleResize() {
    const wasMobile = document.body.classList.contains('mobile-device');
    const isMobile = Utils.isMobile();
    
    if (isMobile !== wasMobile) {
      document.body.classList.toggle('mobile-device', isMobile);
    }
  }

  applyInitialAnimations() {
    if (AppState.reducedMotion) return;
    
    setTimeout(() => {
      const heroElements = document.querySelectorAll('.page-hero .fade-in, #banner .fade-in');
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('in-view');
        }, index * 100);
      });
    }, 200);
  }
}

// Inicializar la aplicación
const app = new PortfolioApp();