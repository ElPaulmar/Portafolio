(function($) {
    // Preload
    setTimeout(function() {
        $('body').removeClass('is-preload');
    }, 100);
    
    // Smooth scrolling for all anchor links
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
    
    // Header scroll effect
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('#header').addClass('scrolled');
        } else {
            $('#header').removeClass('scrolled');
        }
    });
    
    // Toggle development process
    $('body').on('click', '.toggle-process', function(e) {
        e.preventDefault();
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up')
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
})(jQuery);