(function($) {
  setTimeout(() => $('body').removeClass('is-preload'), 100);

  // Smooth scroll
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
          { scrollTop: target.offset().top - 70 },
          800,
          'swing'
        );
      }
    }
  });

  // Scroll animation
  function scrollAnimation() {
    const elements = $('[data-scroll]');
    const trigger = $(window).scrollTop() + $(window).height() * 0.8;
    elements.each(function () {
      if ($(this).offset().top < trigger) {
        $(this).attr('data-scroll', 'in');
      }
    });
  }

  $(window).on('load scroll', scrollAnimation);

  // Ripple effect
  $('.ripple').on('click', function (e) {
    let $btn = $(this),
      offset = $btn.offset(),
      x = e.pageX - offset.left,
      y = e.pageY - offset.top;

    let $ripple = $('<span class="ripple-effect">');
    $ripple
      .css({ top: y, left: x })
      .appendTo($btn)
      .on('animationend webkitAnimationEnd', function () {
        $(this).remove();
      });
  });

  // Form submission
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();
    const $feedback = $('#form-feedback');
    $feedback.removeClass('error success').text('Enviando...').fadeIn();

    setTimeout(() => {
      $feedback.addClass('success').text('¡Mensaje enviado!');
      $(this).trigger('reset');
      setTimeout(() => $feedback.fadeOut(), 4000);
    }, 1500);
  });

  // Partículas
  tsParticles.load("particles-js", {
    preset: "links",
    background: { color: "#1F4D5B" },
    fullScreen: { enable: false },
  });

})(jQuery);
