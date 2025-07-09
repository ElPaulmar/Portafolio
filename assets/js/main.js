(function($) {
    // Preload
    setTimeout(function() {
        $('body').removeClass('is-preload');
    }, 100);
    
    // Header scroll effect
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        
        // Header effect
        $('#header').css({
            'background-color': scrollTop > 50 
                ? 'rgba(58, 50, 38, 0.98)' 
                : 'rgba(58, 50, 38, 0.95)',
            'box-shadow': scrollTop > 50 
                ? '0 2px 10px rgba(0,0,0,0.1)' 
                : 'none'
        });
        
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
})(jQuery);