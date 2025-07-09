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

  // Activar animaciones iniciales
  $window.on('load', function() {
    window.setTimeout(function() {
      $body.removeClass('is-preload');
    }, 100);
  });

  // Scroll suave para anclas
  $('a[href^="#"]').on('click', function(event) {
    var target = $($(this).attr('href'));
    if (target.length) {
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top - 50
      }, 600);
    }
  });

})(jQuery);