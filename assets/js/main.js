(function($) {

    var $window = $(window),
        $body = $('body'),
        $header = $('#header'),
        $banner = $('#banner');

    // Breakpoints
    breakpoints({
        xlarge: '(max-width: 1680px)',
        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small: '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });

    // Remove preload class on page load
    $window.on('load', function() {
        setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Header scroll effect
    $window.on('scroll', function() {
        if ($window.scrollTop() > 50) {
            $header.css({
                'background-color': 'rgba(62, 54, 63, 0.98)',
                'box-shadow': '0 2px 10px rgba(0,0,0,0.1)'
            });
        } else {
            $header.css({
                'background-color': 'rgba(62, 54, 63, 0.95)',
                'box-shadow': 'none'
            });
        }
    });

    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        if ($(this).attr('href') === '#') return;
        
        e.preventDefault();
        var target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 800, 'easeInOutExpo');
        }
    });

    // Toggle development process
    $('.toggle-process').on('click', function(e) {
        e.preventDefault();
        var $this = $(this),
            $process = $this.closest('.project-content').find('.development-process');
        
        $process.toggleClass('active');
        $this.find('i').toggleClass('fa-chevron-down fa-chevron-up');
    });

})(jQuery);