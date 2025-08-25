/**
 * Portafolio Paulo Marques - JavaScript Principal
 * Versión optimizada con mejoras de rendimiento y accesibilidad
 */

// Configuración global
const CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 80,
  NOTIFICATION_DURATION: 4000,
  THROTTLE_DELAY: 16, // ~60fps
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_MARGIN: '50px'
};

// Estado global de la aplicación
const AppState = {
  isPreloaded: false,
  isMobileMenuOpen: false,
  currentSection: 'banner',
  scrollY: 0,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

/**
 * Utilidades de rendimiento
 */
const Utils = {
  // Throttle optimizado
  throttle: (func, limit) => {
    let inThrottle;
    let lastRan;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        lastRan = Date.now();
        inThrottle = true;
      } else {
        clearTimeout(lastRan);
        lastRan = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },

  // Debounce para eventos que no necesitan ser tan frecuentes
  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  },

  // Detección de elementos en viewport optimizada
  elementInView: (el, offset = CONFIG.INTERSECTION_THRESHOLD * 100) => {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return rect.top <= viewportHeight - offset && rect.bottom >= offset;
  },

  // Smooth scroll con fallback
  smoothScrollTo: (target, offset = CONFIG.SCROLL_OFFSET) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const targetPosition = element.offsetTop - offset;
    
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: AppState.reducedMotion ? 'auto' : 'smooth'
      });
    } else {
      // Fallback para navegadores antiguos
      window.scrollTo(0, targetPosition);
    }
  },

  // Validación de email mejorada
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email?.trim());
  },

  // Escape HTML para prevenir XSS
  escapeHtml: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Detectar si es dispositivo móvil
  isMobile: () => window.innerWidth <= 900,

  // Detectar si soporta hover
  supportsHover: () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
};

/**
 * Manejo de intersecciones (Intersection Observer)
 */
class IntersectionManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    // Observer para animaciones de scroll
    this.createObserver('scroll-animations', {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: CONFIG.INTERSECTION_MARGIN
    }, this.handleScrollAnimations.bind(this));

    // Observer para barras de habilidades
    this.createObserver('skill-bars', {
      threshold: 0.3,
      rootMargin: '100px'
    }, this.handleSkillBars.bind(this));

    // Observer para navegación activa
    this.createObserver('sections', {
      threshold: 0.5,
      rootMargin: '-100px 0px -50% 0px'
    }, this.handleActiveNavigation.bind(this));

    // Observer para lazy loading de imágenes
    this.createObserver('images', {
      threshold: 0.1,
      rootMargin: '200px'
    }, this.handleImageLoading.bind(this));
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
        this.updateActiveNavLinks(entry.target.id);
      }
    });
  }

  handleImageLoading(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observers.get('images').unobserve(img);
      }
    });
  }

  loadImage(img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    const loadHandler = () => {
      img.classList.remove('loading');
      img.style.opacity = '1';
      img.removeEventListener('load', loadHandler);
      img.removeEventListener('error', errorHandler);
    };

    const errorHandler = () => {
      img.classList.remove('loading');
      img.style.opacity = '1';
      img.removeEventListener('load', loadHandler);
      img.removeEventListener('error', errorHandler);
    };

    img.addEventListener('load', loadHandler);
    img.addEventListener('error', errorHandler);

    if (img.complete) {
      loadHandler();
    }
  }

  updateActiveNavLinks(sectionId) {
    const navLinks = document.querySelectorAll('#header nav a, .mobile-menu a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }
}

/**
 * Manejo del header
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
    
    // Añadir clase scrolled
    if (currentScrollY > 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    // Auto-hide en móviles
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
 * Manejo del menú móvil
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

    // Cerrar menú al hacer clic en enlaces
    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (AppState.isMobileMenuOpen && 
          !this.menu.contains(e.target) && 
          !this.toggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Cerrar menú con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
        this.closeMenu();
      }
    });

    // Cerrar menú al cambiar a desktop
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

    // Focus en el primer enlace
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
 * Manejo de navegación y smooth scroll
 */
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    // Smooth scroll para anclas
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      Utils.smoothScrollTo(href);
    });

    // Scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        Utils.smoothScrollTo('#proyectos');
      });
    }
  }
}

/**
 * Manejo de proyectos expandibles
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
    const process = toggle.closest('.project-actions').nextElementSibling;
    
    if (!process || !process.classList.contains('development-process')) return;

    toggle.classList.toggle('active');
    const icon = toggle.querySelector('i');
    
    if (isActive) {
      // Cerrar
      process.style.display = 'none';
      process.classList.remove('show');
      process.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
      // Abrir
      process.style.display = 'block';
      process.classList.add('show');
      process.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      if (icon) icon.style.transform = 'rotate(180deg)';
      
      // Scroll suave hacia el contenido expandido
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
 * Sistema de notificaciones
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
    
    // Procesar siguiente notificación si existe
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
        setTimeout(resolve, 300); // Esperar a que termine la animación
      }, CONFIG.NOTIFICATION_DURATION);
    });
  }
}

/**
 * Manejo del formulario de contacto
 */
class ContactFormManager {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.notification = new NotificationManager();
    this.init();
  }

  init() {
    if (!this.form) return;

    // Validación en tiempo real
    this.setupRealTimeValidation();
    
    // Manejo del envío
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      // Habilitar botón cuando el formulario sea válido
      input.addEventListener('input', Utils.debounce(() => {
        this.updateSubmitButton();
      }, 300));

      // Validación al perder el foco
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      // Limpiar errores al escribir
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
    const buttonLoader = submitButton.querySelector('.button-loader');
    
    // Estado de carga
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonText.textContent = 'Enviando...';
    
    try {
      // Simular envío (aquí integrarías con tu backend real)
      await this.simulateFormSubmission(formData);
      
      const formDataObj = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'Contacto desde portafolio',
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        source: 'portafolio-web'
      };
      
      // Log para desarrollo (remover en producción)
      console.log('Datos del formulario:', formDataObj);
      
      this.notification.show('¡Mensaje enviado correctamente! Te responderé pronto.');
      this.form.reset();
      this.updateSubmitButton();
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      this.notification.show('Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
    } finally {
      // Restaurar estado del botón
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      buttonText.textContent = 'Enviar Mensaje';
    }
  }

  async simulateFormSubmission(formData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular posible error (5% probabilidad)
    if (Math.random() < 0.05) {
      throw new Error('Error de red simulado');
    }
    
    return { success: true };
  }
}

/**
 * Efectos de interactividad
 */
class InteractivityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupRippleEffect();
    this.setupParallaxCards();
    this.setupParticleSystem();
  }

  setupRippleEffect() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.button');
      if (!button || AppState.reducedMotion) return;

      this.createRipple(button, e);
    });
  }

  createRipple(button, event) {
    // Remover ripple existente
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

  setupParallaxCards() {
    if (!Utils.supportsHover() || Utils.isMobile() || AppState.reducedMotion) return;

    const parallaxCards = document.querySelectorAll('.improved-project');
    
    parallaxCards.forEach(card => {
      card.addEventListener('mousemove', Utils.throttle((e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(0)`;
      }, CONFIG.THROTTLE_DELAY));
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
      });
    });
  }

  setupParticleSystem() {
    if (Utils.isMobile() || AppState.reducedMotion) return;

    this.particleInterval = null;
    this.startParticles();

    // Pausar/reanudar según visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.startParticles();
      } else {
        this.stopParticles();
      }
    });
  }

  startParticles() {
    if (this.particleInterval) return;
    
    this.particleInterval = setInterval(() => {
      this.createParticle();
    }, 300);
  }

  stopParticles() {
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
      this.particleInterval = null;
    }
  }

  createParticle() {
    const banner = document.getElementById('banner');
    if (!banner || document.visibilityState !== 'visible') return;
    
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    banner.appendChild(particle);
    
    const animationDuration = Math.random() * 3000 + 2000;
    
    const animation = particle.animate([
      { transform: 'translateY(0) translateX(0)', opacity: 0 },
      { transform: `translateY(-${window.innerHeight}px) translateX(${Math.random() * 100 - 50}px)`, opacity: 0.8 },
      { transform: `translateY(-${window.innerHeight * 1.5}px) translateX(${Math.random() * 200 - 100}px)`, opacity: 0 }
    ], {
      duration: animationDuration,
      easing: 'linear'
    });

    animation.onfinish = () => {
      if (particle.parentNode) {
        particle.remove();
      }
    };
  }
}

/**
 * Easter eggs y funciones especiales
 */
class EasterEggManager {
  constructor() {
    this.konamiCode = [];
    this.konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    this.notification = new NotificationManager();
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      this.handleKonamiCode(e);
    });

    // Typing effect para el hero title
    setTimeout(() => {
      this.initTypingEffect();
    }, 1000);
  }

  handleKonamiCode(e) {
    this.konamiCode.push(e.code);
    
    if (this.konamiCode.length > this.konamiSequence.length) {
      this.konamiCode.shift();
    }
    
    if (this.konamiCode.join(',') === this.konamiSequence.join(',')) {
      this.activateKonamiEasterEgg();
      this.konamiCode = [];
    }
  }

  activateKonamiEasterEgg() {
    document.body.style.filter = 'hue-rotate(180deg)';
    this.notification.show('🎮 ¡Código Konami activado! Eres un verdadero gamer.');
    
    setTimeout(() => {
      document.body.style.filter = '';
    }, 5000);
  }

  initTypingEffect() {
    if (AppState.reducedMotion) return;
    
    const heroTitle = document.querySelector('.hero-text h2');
    if (!heroTitle || heroTitle.classList.contains('typed')) return;

    heroTitle.classList.add('typed');
    const originalText = heroTitle.textContent;
    this.typeWriter(heroTitle, originalText, 80);
  }

  typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    const typing = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    };
    
    typing();
  }
}

/**
 * Inicialización de la aplicación
 */
class PortfolioApp {
  constructor() {
    this.intersectionManager = null;
    this.components = {};
    
    this.init();
  }

  async init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Preloader
    this.handlePreloader();
    
    // Inicializar componentes principales
    this.intersectionManager = new IntersectionManager();
    
    this.components = {
      header: new HeaderManager(),
      mobileMenu: new MobileMenuManager(),
      navigation: new NavigationManager(),
      projects: new ProjectManager(),
      contactForm: new ContactFormManager(),
      interactivity: new InteractivityManager(),
      easterEggs: new EasterEggManager()
    };

    // Configurar observers
    this.setupObservers();
    
    // Configurar listeners globales
    this.setupGlobalListeners();
    
    // Aplicar animaciones iniciales
    this.applyInitialAnimations();
    
    // Precargar recursos
    this.preloadResources();

    console.log('🎮 Portafolio de Paulo Marques cargado correctamente!');
    console.log('💡 Tip: Prueba el código Konami (↑↑↓↓←→←→BA) para un easter egg');
  }

  handlePreloader() {
    setTimeout(() => {
      document.body.classList.remove('is-preload');
      AppState.isPreloaded = true;
    }, 100);
  }

  setupObservers() {
    // Elementos para animaciones de scroll
    const scrollElements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');
    this.intersectionManager.observe('scroll-animations', Array.from(scrollElements));

    // Categorías de habilidades
    const skillCategories = document.querySelectorAll('.skill-category');
    this.intersectionManager.observe('skill-bars', Array.from(skillCategories));

    // Secciones para navegación activa
    const sections = document.querySelectorAll('section[id]');
    this.intersectionManager.observe('sections', Array.from(sections));

    // Imágenes para lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    this.intersectionManager.observe('images', Array.from(lazyImages));
  }

  setupGlobalListeners() {
    // Manejo de errores globales
    window.addEventListener('error', (e) => {
      console.error('Error global capturado:', e.error);
    });

    // Manejo de promesas rechazadas
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Promesa rechazada no manejada:', e.reason);
    });

    // Manejo de cambio de tamaño de ventana
    window.addEventListener('resize', Utils.debounce(() => {
      this.handleResize();
    }, 250));

    // Manejo de cambios en las preferencias de movimiento
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', (e) => {
      AppState.reducedMotion = e.matches;
      if (e.matches) {
        this.components.interactivity.stopParticles();
      }
    });

    // Manejo de visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.components.interactivity.stopParticles();
      } else if (!AppState.reducedMotion && !Utils.isMobile()) {
        this.components.interactivity.startParticles();
      }
    });

    // Prevenir recarga accidental
    window.addEventListener('beforeunload', () => {
      document.body.classList.add('is-preload');
    });
  }

  handleResize() {
    // Actualizar estado móvil
    const wasMobile = document.body.classList.contains('mobile-device');
    const isMobile = Utils.isMobile();
    
    if (isMobile !== wasMobile) {
      document.body.classList.toggle('mobile-device', isMobile);
      
      // Reiniciar sistema de partículas si es necesario
      if (isMobile) {
        this.components.interactivity.stopParticles();
      } else if (!AppState.reducedMotion) {
        this.components.interactivity.startParticles();
      }
    }
  }

  applyInitialAnimations() {
    if (AppState.reducedMotion) return;
    
    setTimeout(() => {
      const heroElements = document.querySelectorAll('#banner .fade-in');
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('in-view');
        }, index * 100);
      });
    }, 200);
  }

  preloadResources() {
    // Precargar imágenes críticas si están definidas
    const preloadImages = [
      // Añadir aquí las rutas de imágenes importantes
      // 'assets/images/perfil-paulo.jpg',
      // 'assets/images/overhaul-preview.jpg'
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Precargar fuentes si es necesario
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 1em "Open Sans"'),
        document.fonts.load('700 1em "Raleway"')
      ]).then(() => {
        console.log('Fuentes cargadas correctamente');
      }).catch(err => {
        console.warn('Error cargando fuentes:', err);
      });
    }
  }
}

// Inicializar la aplicación
const app = new PortfolioApp();