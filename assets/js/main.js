(function($) {
    // Preload
    setTimeout(function() {
        $('body').removeClass('is-preload');
    }, 100);

    // Smooth scrolling
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(e) {
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && 
            location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

            if (target.length) {
                e.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 70
                }, 800, 'easeInOutExpo');
            }
        }
    });

    // Header scroll
    $(window).on('scroll', function() {
        $('#header').toggleClass('scrolled', $(this).scrollTop() > 50);
    });

    // Toggle proceso de desarrollo
    $('body').on('click', '.toggle-process', function(e) {
        e.preventDefault();
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up')
            .closest('.project-content').find('.development-process').toggleClass('active');
    });

    // Ripple effect
    $('.ripple-btn').on('click', function (e) {
        const btn = $(this);
        const ripple = $('<span></span>').addClass('ripple');
        const x = e.pageX - btn.offset().left;
        const y = e.pageY - btn.offset().top;

        ripple.css({ top: y, left: x });
        btn.append(ripple);

        setTimeout(() => ripple.remove(), 600);
    });

    // Form
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        var $feedback = $('#form-feedback');
        $feedback.removeClass('error success').text('Enviando mensaje...').fadeIn();

        setTimeout(() => {
            $feedback.addClass('success').text('¡Mensaje enviado con éxito!');
            $(this).trigger('reset');

            setTimeout(() => $feedback.fadeOut(), 5000);
        }, 1500);
    });

    // Form field focus
    $('.contact-form input, .contact-form textarea')
        .on('focus', function() {
            $(this).prev('label').css('color', 'var(--secondary)');
        })
        .on('blur', function() {
            $(this).prev('label').css('color', '');
        });

    // Scroll animation
    function scrollAnimation() {
        const elements = $('[data-scroll]');
        const windowHeight = $(window).height() * 0.8;

        elements.each(function() {
            const elementPosition = $(this).offset().top;
            const scrollPosition = $(window).scrollTop() + windowHeight;

            if (scrollPosition > elementPosition) {
                $(this).attr('data-scroll', 'in');
            }
        });
    }

    $(window).on('load scroll', scrollAnimation);

    // Partículas.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS.load('particles-js', 'particles.json');
    }

    // Touch detection
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    if (isTouchDevice()) {
        $('html').addClass('touch-device');
        $('.skill-category, .improved-project').css('transform', 'none');
        $('input, textarea, select').attr({
            autocorrect: 'off',
            autocapitalize: 'off',
            spellcheck: 'false'
        });
    }

    // Precarga imágenes
    function preloadImages() {
        const images = [
            'images/tu-foto.jpg',
            'images/titulo-overhaul.jpg',
            'images/titulo-espiritus.jpg',
            'images/titulo-napi.jpg',
            'images/proyecto-universitario.jpg'
        ];

        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    $(document).ready(preloadImages);
})(jQuery);
