document.addEventListener("DOMContentLoaded", () => {
  
  /* ==============================
     PRELOADER
  ============================== */
  setTimeout(() => {
    document.body.classList.remove('is-preload');
  }, 100);

  /* ==============================
     HEADER SCROLL EFFECT
  ============================== */
  const header = document.getElementById('header');
  let lastScrollY = window.scrollY;

  const handleHeaderScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Ocultar header al hacer scroll down, mostrar al hacer scroll up
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = 'translateX(-50%) translateY(-100%)';
    } else {
      header.style.transform = 'translateX(-50%) translateY(0)';
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleHeaderScroll);

  /* ==============================
     MENÚ MÓVIL
  ============================== */
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  let mobileMenuOpen = false;

  const toggleMobileMenu = () => {
    mobileMenuOpen = !mobileMenuOpen;
    mobileMenu.style.display = mobileMenuOpen ? 'flex' : 'none';
    mobileMenuToggle.innerHTML = mobileMenuOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  };

  mobileMenuToggle.addEventListener('click', toggleMobileMenu);

  // Cerrar menú móvil al hacer clic en un enlace
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenuOpen) {
        toggleMobileMenu();
      }
    });
  });

  // Cerrar menú móvil al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (mobileMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      toggleMobileMenu();
    }
  });

  /* ==============================
     SMOOTH SCROLL PARA ANCLAS
  ============================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href");
      const target = document.querySelector(targetId);
      
      if (target) {
        const headerHeight = document.getElementById('header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  /* ==============================
     SCROLL INDICATOR
  ============================== */
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const proyectosSection = document.getElementById('proyectos');
      if (proyectosSection) {
        proyectosSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ==============================
     TOGGLE DE PROCESO DE PROYECTOS
  ============================== */
  const toggles = document.querySelectorAll(".toggle-process");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      const process = toggle.parentElement.nextElementSibling;
      
      if (process && process.classList.contains('development-process')) {
        if (toggle.classList.contains("active")) {
          process.style.display = "block";
          process.classList.add('show');
          toggle.querySelector('i').style.transform = 'rotate(180deg)';
        } else {
          process.style.display = "none";
          process.classList.remove('show');
          toggle.querySelector('i').style.transform = 'rotate(0deg)';
        }
      }
    });
  });

  /* ==============================
     ANIMACIÓN DE ELEMENTOS AL SCROLL
  ============================== */
  const scrollElements = document.querySelectorAll(".fade-in, .slide-up, .slide-left, .slide-right");
  
  const elementInView = (el, offset = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    const elementBottom = el.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return elementTop <= viewportHeight - offset && elementBottom >= 0;
  };
  
  const displayScrollElement = el => {
    if (!el.classList.contains('in-view')) {
      el.classList.add("in-view");
    }
  };
  
  const hideScrollElement = el => {
    if (el.classList.contains('in-view')) {
      el.classList.remove("in-view");
    }
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach(el => {
      elementInView(el, 100) ? displayScrollElement(el) : hideScrollElement(el);
    });
  };

  window.addEventListener("scroll", handleScrollAnimation);
  handleScrollAnimation(); // Ejecutar al cargar

  /* ==============================
     ANIMACIÓN DE BARRAS DE HABILIDADES
  ============================== */
  const animateSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-fill');
    
    skillBars.forEach(bar => {
      const skillValue = bar.getAttribute('data-skill');
      const skillContainer = bar.closest('.skill-category');
      
      if (elementInView(skillContainer, 150)) {
        setTimeout(() => {
          bar.style.width = skillValue + '%';
        }, 200);
      }
    });
  };

  window.addEventListener('scroll', animateSkillBars);
  setTimeout(animateSkillBars, 500); // Ejecutar al cargar con delay

  /* ==============================
     MICROINTERACCIONES BOTONES
  ============================== */
  const buttons = document.querySelectorAll(".button");
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      btn.classList.add("hovered");
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("hovered");
    });

    // Efecto ripple mejorado
    btn.addEventListener('click', function (e) {
      // Prevenir múltiples ripples
      const existingRipple = this.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      const circle = document.createElement('span');
      circle.classList.add('ripple');
      this.appendChild(circle);

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = x + 'px';
      circle.style.top = y + 'px';

      // Remover ripple después de la animación
      circle.addEventListener('animationend', () => {
        if (circle.parentNode) {
          circle.remove();
        }
      });
    });
  });

  /* ==============================
     EFECTO PARALLAX EN TARJETAS
  ============================== */
  const parallaxCards = document.querySelectorAll(".improved-project");
  
  parallaxCards.forEach(card => {
    card.addEventListener("mousemove", e => {
      if (window.innerWidth > 768) { // Solo en desktop
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(0)`;
      }
    });
    
    card.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) {
        card.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateZ(0)";
      }
    });
  });

  /* ==============================
     FORMULARIO DE CONTACTO
  ============================== */
  const contactForm = document.getElementById('contact-form');
  const notification = document.getElementById('message-notification');

  const showNotification = (message, type = 'success') => {
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    notification.style.background = type === 'success' ? 'var(--accent-color)' : '#e74c3c';
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (formData) => {
    const errors = [];
    
    if (!formData.get('name') || formData.get('name').trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!formData.get('email') || !validateEmail(formData.get('email'))) {
      errors.push('Por favor ingresa un email válido');
    }
    
    if (!formData.get('message') || formData.get('message').trim().length < 10) {
      errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    return errors;
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const errors = validateForm(formData);
      
      if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
      }

      // Simular envío (aquí conectarías con tu backend)
      const submitButton = contactForm.querySelector('input[type="submit"]');
      const originalText = submitButton.value;
      
      submitButton.value = 'Enviando...';
      submitButton.disabled = true;
      
      try {
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Aquí irían los datos a tu servidor
        const formDataObj = {
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          timestamp: new Date().toISOString()
        };
        
        console.log('Datos del formulario:', formDataObj);
        
        showNotification('¡Mensaje enviado correctamente! Te responderé pronto.');
        contactForm.reset();
        
      } catch (error) {
        showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'error');
      } finally {
        submitButton.value = originalText;
        submitButton.disabled = false;
      }
    });

    // Validación en tiempo real
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });
      
      input.addEventListener('input', () => {
        clearFieldError(input);
      });
    });
  }

  const validateField = (field) => {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
      case 'text':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Mínimo 2 caracteres';
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          isValid = false;
          errorMessage = 'Email inválido';
        }
        break;
      default:
        if (field.tagName === 'TEXTAREA' && value.length < 10) {
          isValid = false;
          errorMessage = 'Mínimo 10 caracteres';
        }
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    } else {
      clearFieldError(field);
    }

    return isValid;
  };

  const showFieldError = (field, message) => {
    clearFieldError(field);
    field.style.borderColor = '#e74c3c';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
  };

  const clearFieldError = (field) => {
    field.style.borderColor = '';
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  };

  /* ==============================
     ANIMACIÓN DE ELEMENTOS AL SCROLL
  ============================== */
  const scrollElements = document.querySelectorAll(".fade-in, .slide-up, .slide-left, .slide-right");
  
  const elementInView = (el, offset = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    const elementBottom = el.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return elementTop <= viewportHeight - offset && elementBottom >= 0;
  };
  
  const displayScrollElement = el => {
    if (!el.classList.contains('in-view')) {
      el.classList.add("in-view");
    }
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el, index) => {
      if (elementInView(el, 100)) {
        // Añadir delay escalonado para elementos múltiples
        setTimeout(() => {
          displayScrollElement(el);
        }, index * 100);
      }
    });
  };

  window.addEventListener("scroll", handleScrollAnimation);
  handleScrollAnimation(); // Ejecutar al cargar

  /* ==============================
     ANIMACIÓN DE BARRAS DE HABILIDADES
  ============================== */
  const animateSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-fill');
    
    skillBars.forEach((bar, index) => {
      const skillValue = bar.getAttribute('data-skill');
      const skillContainer = bar.closest('.skill-category');
      
      if (elementInView(skillContainer, 150) && bar.style.width === '0px' || !bar.style.width) {
        setTimeout(() => {
          bar.style.width = skillValue + '%';
        }, index * 200); // Delay escalonado
      }
    });
  };

  window.addEventListener('scroll', animateSkillBars);
  setTimeout(animateSkillBars, 1000); // Ejecutar al cargar con delay

  /* ==============================
     EFECTO TYPING PARA HERO TEXT
  ============================== */
  const typeWriter = (element, text, speed = 50) => {
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
  };

  // Activar efecto typing después de un delay
  setTimeout(() => {
    const heroTitle = document.querySelector('.hero-text h2');
    if (heroTitle) {
      const originalText = heroTitle.textContent;
      typeWriter(heroTitle, originalText, 80);
    }
  }, 1000);

  /* ==============================
     CONTADOR ANIMADO PARA AÑOS DE EXPERIENCIA
  ============================== */
  const animateCounter = (element, start, end, duration) => {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };

  // Buscar elementos que contengan años y animarlos
  const yearElements = document.querySelectorAll('.skill-years');
  yearElements.forEach(el => {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (match) {
      const years = parseInt(match[1]);
      el.addEventListener('animationstart', () => {
        setTimeout(() => {
          animateCounter(el, 0, years, 2000);
        }, 500);
      });
    }
  });

  /* ==============================
     LAZY LOADING PARA IMÁGENES
  ============================== */
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loading');
        
        img.addEventListener('load', () => {
          img.classList.remove('loading');
          img.style.opacity = '1';
        });
        
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    imageObserver.observe(img);
  });

  /* ==============================
     NAVEGACIÓN ACTIVA
  ============================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#header nav a, .mobile-menu a');

  const updateActiveNavigation = () => {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveNavigation);

  /* ==============================
     EASTER EGGS Y DETALLES
  ============================== */
  
  // Konami Code Easter Egg
  let konamiCode = [];
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
      konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      // Easter egg activado
      document.body.style.filter = 'hue-rotate(180deg)';
      showNotification('🎮 ¡Código Konami activado! Eres un verdadero gamer.');
      
      setTimeout(() => {
        document.body.style.filter = '';
      }, 5000);
      
      konamiCode = [];
    }
  });

  // Efecto de partículas en el hero
  const createParticle = () => {
    const banner = document.getElementById('banner');
    const particle = document.createElement('div');
    
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 4 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(255, 255, 255, 0.1)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '100%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1';
    
    banner.appendChild(particle);
    
    const animationDuration = Math.random() * 3000 + 2000;
    
    particle.animate([
      { transform: 'translateY(0) translateX(0)', opacity: 0 },
      { transform: `translateY(-${window.innerHeight}px) translateX(${Math.random() * 200 - 100}px)`, opacity: 1 },
      { transform: `translateY(-${window.innerHeight * 1.5}px) translateX(${Math.random() * 300 - 150}px)`, opacity: 0 }
    ], {
      duration: animationDuration,
      easing: 'linear'
    }).onfinish = () => {
      if (particle.parentNode) {
        particle.remove();
      }
    };
  };

  // Crear partículas periódicamente
  setInterval(createParticle, 800);

  /* ==============================
     PERFORMANCE OPTIMIZATIONS
  ============================== */
  
  // Throttle para eventos de scroll
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Aplicar throttle a eventos costosos
  window.addEventListener('scroll', throttle(() => {
    handleScrollAnimation();
    animateSkillBars();
    updateActiveNavigation();
    handleHeaderScroll();
  }, 16)); // ~60fps

  /* ==============================
     INICIALIZACIÓN FINAL
  ============================== */
  
  // Aplicar animaciones iniciales
  setTimeout(() => {
    const heroElements = document.querySelectorAll('#banner .fade-in');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('in-view');
      }, index * 200);
    });
  }, 500);

  // Precargar imágenes importantes
  const preloadImages = [
    'images/tu-foto.jpg',
    'images/título-overhaul.jpg',
    'images/título-espíritus.jpg',
    'images/título-napi.jpg',
    'images/título-sponji.jpg'
  ];

  preloadImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  /* ==============================
     DETECCIÓN DE DISPOSITIVO
  ============================== */
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouch = 'ontouchstart' in window;

  if (isMobile || isTouch) {
    document.body.classList.add('mobile-device');
    
    // Desactivar efectos parallax en móviles
    parallaxCards.forEach(card => {
      card.style.transform = 'none !important';
    });
  }

  /* ==============================
     MODO OSCURO (OPCIONAL)
  ============================== */
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.style.setProperty('--bg-white', '#1a1a1a');
      document.documentElement.style.setProperty('--bg-light', '#2a2a2a');
      document.documentElement.style.setProperty('--text-dark', '#e0e0e0');
    }
  };

  prefersDark.addEventListener('change', (e) => {
    applyTheme(e.matches);
  });

  // Aplicar tema inicial
  applyTheme(prefersDark.matches);

  console.log('🎮 Portafolio de Paulo Marques cargado correctamente!');
  console.log('💡 Tip: Prueba el código Konami para un easter egg');
});