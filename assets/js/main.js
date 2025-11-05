// Configuración global
const CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 80,
  NOTIFICATION_DURATION: 4000,
  THROTTLE_DELAY: 16, // ~60fps
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_MARGIN: '50px'
};

// Estado de la aplicación
const AppState = {
  isPreloaded: false,
  isMobileMenuOpen: false,
  currentSection: null,
  currentLanguage: null,
  scrollY: 0,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  observers: new Map(),
  cache: new Map()
};

// Utilidades optimizadas
const Utils = {
  // Throttle mejorado con requestAnimationFrame
  throttle(func, limit = CONFIG.THROTTLE_DELAY) {
    let waiting = false;
    let lastArgs = null;
    
    return function throttled(...args) {
      if (!waiting) {
        func.apply(this, args);
        waiting = true;
        setTimeout(() => {
          waiting = false;
          if (lastArgs) {
            throttled.apply(this, lastArgs);
            lastArgs = null;
          }
        }, limit);
      } else {
        lastArgs = args;
      }
    };
  },

  // Debounce optimizado
  debounce(func, wait) {
    let timeout;
    return function debounced(...args) {
      const later = () => {
        timeout = null;
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll con fallback
  smoothScrollTo(target, offset = CONFIG.SCROLL_OFFSET) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    if (AppState.reducedMotion || !('scrollBehavior' in document.documentElement.style)) {
      window.scrollTo(0, targetPosition);
    } else {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Validación de email optimizada
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim()),

  // Escape HTML para prevenir XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  // Detección de móvil con caché
  isMobile() {
    if (!AppState.cache.has('isMobile')) {
      AppState.cache.set('isMobile', window.innerWidth <= 900);
    }
    return AppState.cache.get('isMobile');
  },

  // Prefetch de imágenes
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
};

// Language Manager optimizado
class LanguageManager {
  constructor() {
    this.pageMapping = {
      'index.html': 'en/index.html',
      'proyectos.html': 'en/projects.html',
      'about.html': 'en/about.html',
      'en/index.html': 'index.html',
      'en/projects.html': 'proyectos.html',
      'en/about.html': 'about.html'
    };
    this.init();
  }

  init() {
    this.detectLanguage();
    this.setupButtons();
  }

  detectLanguage() {
    const path = window.location.pathname;
    AppState.currentLanguage = path.includes('/en/') ? 'en' : 'es';
    
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== AppState.currentLanguage) {
      AppState.currentLanguage = savedLang;
    }
  }

  setupButtons() {
    const buttons = document.querySelectorAll('.lang-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      const lang = btn.dataset.lang;
      
      if (lang === AppState.currentLanguage) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeLanguage(lang);
      }, { passive: false });
    });
  }

  changeLanguage(targetLang) {
    if (targetLang === AppState.currentLanguage) return;

    try {
      localStorage.setItem('preferredLanguage', targetLang);
    } catch (e) {
      console.warn('No se pudo guardar preferencia de idioma');
    }

    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const fullCurrentPage = currentPath.includes('/en/') ? 'en/' + currentPage : currentPage;
    
    const targetPage = this.pageMapping[fullCurrentPage] || 'index.html';
    const hash = window.location.hash;

    window.location.href = targetPage + hash;
  }
}

// Intersection Manager optimizado
class IntersectionManager {
  constructor() {
    this.init();
  }

  init() {
    // Observer único para todas las animaciones
    const animationObserver = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: CONFIG.INTERSECTION_THRESHOLD,
        rootMargin: CONFIG.INTERSECTION_MARGIN
      }
    );
    
    AppState.observers.set('animations', animationObserver);
  }

  handleIntersection(entries) {
    // Procesar en batch para mejor rendimiento
    requestAnimationFrame(() => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        
        const target = entry.target;
        
        // Animaciones de entrada
        if (target.classList.contains('fade-in') || 
            target.classList.contains('slide-up') || 
            target.classList.contains('slide-left') || 
            target.classList.contains('slide-right')) {
          
          const delay = AppState.reducedMotion ? 0 : index * 50;
          setTimeout(() => target.classList.add('in-view'), delay);
          
          // Dejar de observar después de animar
          AppState.observers.get('animations').unobserve(target);
        }
        
        // Animación de skill bars
        if (target.classList.contains('skill-category')) {
          this.animateSkillBars(target);
          AppState.observers.get('animations').unobserve(target);
        }
        
        // Actualizar sección activa
        if (target.hasAttribute('id')) {
          AppState.currentSection = target.id;
          this.updateActiveLinks(target.id);
        }
      });
    });
  }

  observe(elements) {
    const observer = AppState.observers.get('animations');
    if (!observer) return;

    // Usar DocumentFragment para mejor rendimiento
    elements.forEach(el => observer.observe(el));
  }

  animateSkillBars(container) {
    const fills = container.querySelectorAll('.skill-fill:not(.animated)');
    
    fills.forEach((bar, index) => {
      const value = bar.dataset.skill;
      if (!value) return;
      
      bar.classList.add('animated');
      
      if (AppState.reducedMotion) {
        bar.style.width = value + '%';
      } else {
        setTimeout(() => {
          bar.style.width = value + '%';
        }, index * 200);
      }
    });
  }

  updateActiveLinks(sectionId) {
    // Caché de selectores
    if (!AppState.cache.has('navLinks')) {
      AppState.cache.set('navLinks', 
        document.querySelectorAll('#header nav a, .mobile-menu a, .sidebar-link, .sidebar-sublink')
      );
    }
    
    const links = AppState.cache.get('navLinks');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href?.includes('#')) {
        const linkSection = href.split('#')[1];
        link.classList.toggle('active', linkSection === sectionId);
      }
    });
  }
}

// Header Manager optimizado
class HeaderManager {
  constructor() {
    this.header = document.getElementById('header');
    this.lastScrollY = window.pageYOffset;
    this.ticking = false;
    this.init();
  }

  init() {
    if (!this.header) return;

    // Usar passive: true para mejor scroll performance
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.handleScroll());
        this.ticking = true;
      }
    }, { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.pageYOffset;
    
    // Añadir clase scrolled
    this.header.classList.toggle('scrolled', currentScrollY > 100);

    // Auto-hide en móvil
    if (Utils.isMobile() && currentScrollY > 200) {
      const direction = currentScrollY > this.lastScrollY ? '-100%' : '0';
      this.header.style.transform = `translateY(${direction})`;
    }

    this.lastScrollY = currentScrollY;
    AppState.scrollY = currentScrollY;
    this.ticking = false;
  }
}

// Mobile Menu Manager optimizado
class MobileMenuManager {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.menu = document.querySelector('.mobile-menu');
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    // Event delegation para mejor rendimiento
    this.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Cerrar al hacer click en links
    this.menu.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        this.closeMenu();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (AppState.isMobileMenuOpen && 
          !this.menu.contains(e.target) && 
          !this.toggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
        this.closeMenu();
        this.toggle.focus();
      }
    });

    // Cerrar en resize a desktop
    window.addEventListener('resize', Utils.debounce(() => {
      if (!Utils.isMobile() && AppState.isMobileMenuOpen) {
        this.closeMenu();
      }
      AppState.cache.delete('isMobile'); // Invalidar caché
    }, 250));
  }

  toggleMenu() {
    AppState.isMobileMenuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    AppState.isMobileMenuOpen = true;
    this.menu.style.display = 'flex';
    this.toggle.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    this.toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    // Mover focus al primer link
    const firstLink = this.menu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  closeMenu() {
    AppState.isMobileMenuOpen = false;
    this.menu.style.display = 'none';
    this.toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// Navigation Manager optimizado
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    // Event delegation en documento
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      Utils.smoothScrollTo(href);
      
      // Actualizar URL sin recargar
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    });

    // Scroll indicator
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      indicator.addEventListener('click', () => {
        const featured = document.querySelector('#proyectos-destacados');
        if (featured) {
          Utils.smoothScrollTo('#proyectos-destacados');
        } else {
          const firstSection = document.querySelector('section[id]:not(#banner)');
          if (firstSection) {
            Utils.smoothScrollTo(`#${firstSection.id}`);
          }
        }
      });
    }
  }
}

// Project Manager optimizado
class ProjectManager {
  constructor() {
    this.activeProcesses = new Set();
    this.init();
  }

  init() {
    // Event delegation
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggle-process');
      if (!toggle) return;
      
      e.preventDefault();
      this.toggleProcess(toggle);
    });
  }

  toggleProcess(toggle) {
    const processId = toggle.getAttribute('aria-controls');
    const process = document.getElementById(processId);
    if (!process) return;

    const isActive = this.activeProcesses.has(processId);
    
    if (isActive) {
      this.activeProcesses.delete(processId);
      toggle.classList.remove('active');
      process.style.display = 'none';
      process.classList.remove('show');
      process.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      this.activeProcesses.add(processId);
      toggle.classList.add('active');
      process.style.display = 'block';
      
      // Usar requestAnimationFrame para animación suave
      requestAnimationFrame(() => {
        process.classList.add('show');
        process.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
      });

      // Scroll suave al contenido expandido
      if (!AppState.reducedMotion) {
        setTimeout(() => {
          const rect = process.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            Utils.smoothScrollTo(process, CONFIG.SCROLL_OFFSET);
          }
        }, 300);
      }
    }

    // Actualizar icono
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }
}

// Notification Manager optimizado
class NotificationManager {
  constructor() {
    this.notification = document.getElementById('message-notification');
    this.queue = [];
    this.isShowing = false;
  }

  show(message, type = 'success') {
    this.queue.push({ message, type });
    if (!this.isShowing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (!this.queue.length) {
      this.isShowing = false;
      return;
    }
    
    this.isShowing = true;
    const { message, type } = this.queue.shift();
    
    await this.displayNotification(message, type);
    
    // Procesar siguiente en la cola
    this.processQueue();
  }

  async displayNotification(message, type) {
    if (!this.notification) return Promise.resolve();

    const config = {
      success: { icon: 'fa-check-circle', color: '#21585A' },
      error: { icon: 'fa-exclamation-circle', color: '#90403E' },
      warning: { icon: 'fa-exclamation-triangle', color: '#56475D' },
      info: { icon: 'fa-info-circle', color: '#21585A' }
    };

    const { icon, color } = config[type] || config.info;

    this.notification.innerHTML = `
      <i class="fas ${icon}" aria-hidden="true"></i>
      <span>${Utils.escapeHtml(message)}</span>
    `;
    
    this.notification.style.background = color;
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

// Contact Form Manager optimizado
class ContactFormManager {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.notification = new NotificationManager();
    this.validators = new Map();
    this.init();
  }

  init() {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll('input, textarea');
    
    // Event delegation con debounce
    inputs.forEach(input => {
      const debouncedUpdate = Utils.debounce(() => {
        this.updateSubmitButton();
        this.clearFieldError(input);
      }, 300);

      input.addEventListener('input', debouncedUpdate);
      input.addEventListener('blur', () => this.validateField(input));
    });
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  updateSubmitButton() {
    const button = this.form.querySelector('button[type="submit"]');
    if (!button) return;

    const formData = new FormData(this.form);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();
    
    const isValid = name?.length >= 2 && 
                    Utils.isValidEmail(email) && 
                    message?.length >= 10;
    
    button.disabled = !isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    let error = '';

    if (field.type === 'email' && field.required) {
      error = Utils.isValidEmail(value) ? '' : 'Email inválido';
    } else if (field.type === 'text' && field.required) {
      error = value.length >= 2 ? '' : 'Mínimo 2 caracteres';
    } else if (field.tagName === 'TEXTAREA' && field.required) {
      error = value.length >= 10 ? '' : 'Mínimo 10 caracteres';
    }

    error ? this.showFieldError(field, error) : this.clearFieldError(field);
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.style.borderColor = '#90403E';
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
    
    const error = field.parentNode.querySelector('.field-error');
    if (error) error.remove();
  }

  async handleSubmit() {
    const button = this.form.querySelector('button[type="submit"]');
    const buttonText = button.querySelector('.button-text');
    
    button.disabled = true;
    button.classList.add('loading');
    buttonText.textContent = 'Enviando...';
    
    try {
      // Simular envío (reemplazar con fetch real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.notification.show('¡Mensaje enviado correctamente! Te responderé pronto.');
      this.form.reset();
      this.updateSubmitButton();
      
    } catch (error) {
      console.error('Error:', error);
      this.notification.show('Error al enviar. Intenta nuevamente.', 'error');
    } finally {
      button.disabled = false;
      button.classList.remove('loading');
      buttonText.textContent = 'Enviar Mensaje';
    }
  }
}

// Interactivity Manager
class InteractivityManager {
  constructor() {
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    if (AppState.reducedMotion) return;

    document.addEventListener('click', (e) => {
      const button = e.target.closest('.button');
      if (!button) return;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }, { passive: true });
  }
}

// Portfolio App - Orquestador principal
class PortfolioApp {
  constructor() {
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

    // Remover preload
    setTimeout(() => {
      document.body.classList.remove('is-preload');
      AppState.isPreloaded = true;
    }, 100);
    
    // Inicializar componentes
    this.components = {
      language: new LanguageManager(),
      intersection: new IntersectionManager(),
      header: new HeaderManager(),
      mobileMenu: new MobileMenuManager(),
      navigation: new NavigationManager(),
      projects: new ProjectManager(),
      contactForm: new ContactFormManager(),
      interactivity: new InteractivityManager()
    };

    // Setup
    this.setupObservers();
    this.setupGlobalListeners();
    this.applyInitialAnimations();
    this.prefetchCriticalImages();

    console.log('✅ Portafolio cargado y optimizado');
  }

  setupObservers() {
    const elements = [
      ...document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right'),
      ...document.querySelectorAll('.skill-category'),
      ...document.querySelectorAll('section[id]')
    ];
    
    this.components.intersection.observe(elements);
  }

  setupGlobalListeners() {
    // Resize con debounce
    window.addEventListener('resize', Utils.debounce(() => {
      document.body.classList.toggle('mobile-device', Utils.isMobile());
      AppState.cache.delete('isMobile');
    }, 250));

    // Cambios en reduced motion
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => {
        AppState.reducedMotion = e.matches;
      });
  }

  applyInitialAnimations() {
    if (AppState.reducedMotion) return;
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.page-hero .fade-in, #banner .fade-in')
          .forEach((el, i) => {
            setTimeout(() => el.classList.add('in-view'), i * 100);
          });
      }, 200);
    });
  }

  prefetchCriticalImages() {
    // Prefetch de imágenes importantes
    const criticalImages = document.querySelectorAll('img[loading="eager"]');
    criticalImages.forEach(img => {
      if (!img.complete) {
        Utils.preloadImage(img.src).catch(() => {
          console.warn('Failed to preload:', img.src);
        });
      }
    });
  }
}

// Inicialización
const app = new PortfolioApp();