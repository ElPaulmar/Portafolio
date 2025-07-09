(function($) {
    // Preload
    setTimeout(function() {
        $('body').removeClass('is-preload');
    }, 100);
    
    // Efecto Parallax
    function setupParallax() {
        const banner = document.getElementById('banner');
        const parallaxBg = document.querySelector('.parallax-background');
        
        if (banner && parallaxBg) {
            window.addEventListener('scroll', function() {
                const scrollPosition = window.pageYOffset;
                parallaxBg.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
            });
        }
    }
    
    // Intersection Observer para animaciones
    function setupAnimations() {
        const animateElements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animateElements.forEach(el => observer.observe(el));
    }
    
    // Header scroll effect
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        
        // Header effect
        if (scrollTop > 50) {
            $('#header').addClass('scrolled');
        } else {
            $('#header').removeClass('scrolled');
        }
        
        // Scroll progress
        var scrollPercent = (scrollTop / ($(document).height() - $(this).height())) * 100;
        $('body').css('--scroll-progress', scrollPercent + '%');
    });
    
    // Smooth scrolling for anchor links
    $('body').on('click', 'a[href^="#"]', function(e) {
        if ($(this).attr('href') !== '#') {
            e.preventDefault();
            var target = $(this.getAttribute('href'));
            if (target.length) {
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 70
                }, 800, 'easeInOutExpo');
            }
        }
    });
    
    // Toggle development process
    $('body').on('click', '.toggle-process', function(e) {
        e.preventDefault();
        var $this = $(this);
        $this.find('i').toggleClass('fa-chevron-down fa-chevron-up')
            .closest('.project-content').find('.development-process').toggleClass('active');
    });
    
    // Form handling
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        var $feedback = $('#form-feedback');
        $feedback.removeClass('error success').text('Enviando mensaje...').fadeIn();
        
        setTimeout(function() {
            $feedback.addClass('success').text('¡Mensaje enviado con éxito!');
            $(this).trigger('reset');
        }.bind(this), 1500);
    });
    
    // Form field focus effects
    $('.contact-form input, .contact-form textarea')
        .on('focus', function() {
            $(this).parent().find('label').css('color', 'var(--secondary)');
        })
        .on('blur', function() {
            $(this).parent().find('label').css('color', '');
        });
    
    // Inicialización cuando el DOM está listo
    $(document).ready(function() {
        setupParallax();
        setupAnimations();
    });
    
    // Volver a ejecutar animaciones al cambiar de tamaño de pantalla
    $(window).on('resize', function() {
        setupAnimations();
    });
})(jQuery);