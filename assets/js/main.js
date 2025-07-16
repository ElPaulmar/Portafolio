(function($) {
  setTimeout(() => {
    $('body').removeClass('is-preload');
  }, 100);

  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(e) {
    if (
      location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      location.hostname === this.hostname
    ) {
      let target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        e.preventDefault();
        $('html, body').stop().animate(
          { scrollTop: target.offset().top - 50 },
          800,
          'easeInOutExpo'
        );
      }
    }
  });

  $(window).on('scroll', function() {
    $('[data-scroll]').each(function() {
      if ($(window).scrollTop() + $(window).height() * 0.8 > $(this).offset().top) {
        $(this).addClass('in-view');
      }
    });
  });

  $('#contact-form').on('submit', function(e) {
    e.preventDefault();
    const $feedback = $('#form-feedback');
    $feedback.removeClass('error success').text('Enviando mensaje...').fadeIn();
    setTimeout(() => {
      $feedback.addClass('success').text('¡Mensaje enviado con éxito!');
      $('#contact-form').trigger('reset');
      setTimeout(() => {
        $feedback.fadeOut();
      }, 5000);
    }, 1500);
  });

  // Ripple effect on button
  $('.ripple-button').on('click', function(e) {
    const btn = $(this);
    const x = e.pageX - btn.offset().left;
    const y = e.pageY - btn.offset().top;
    const ripple = $('<span class="ripple-effect"></span>').css({
      left: x,
      top: y,
    });
    btn.append(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

})(jQuery);
