(function($) {
  // Preload
  setTimeout(() => $('body').removeClass('is-preload'), 100);

  // Smooth scroll
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(e) {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: target.offset().top - 70 }, 800, 'easeInOutExpo');
      }
    }
  });

  // Header scroll effect
  $(window).on('scroll', () => {
    $('#header').toggleClass('scrolled', $(this).scrollTop() > 50);
  });

  // Toggle process
  $('body').on('click', '.toggle-process', function(e) {
    e.preventDefault();
    $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up');
    $(this).closest('.tarjeta-proyecto').find('.development-process').slideToggle().toggleClass('active');
  });

  // Contact form
  $('#contact-form').on('submit', function(e) {
    e.preventDefault();
    const $feedback = $('#form-feedback');
    $feedback.removeClass('error success').text('Enviando mensaje...').fadeIn();

    setTimeout(() => {
      $feedback.addClass('success').text('¡Mensaje enviado con éxito!');
      this.reset();
      setTimeout(() => $feedback.fadeOut(), 5000);
    }, 1500);
  });

  // Focus label color
  $('.contact-form input, .contact-form textarea')
    .on('focus', function() {
      $(this).siblings('label').css('color', 'var(--accent)');
    })
    .on('blur', function() {
      $(this).siblings('label').css('color', '');
    });

  // Scroll animation
  function scrollAnimation() {
    $('[data-scroll]').each(function() {
      const trigger = $(window).scrollTop() + $(window).height() * 0.8;
      if (trigger > $(this).offset().top) {
        $(this).attr('data-scroll', 'in');
      }
    });
  }

  $(window).on('load scroll', scrollAnimation);

  // Ripple effect
  $('.ripple').on('click', function(e) {
    const circle = $('<span class="ripple-circle"></span>');
    $(this).append(circle);
    const x = e.clientX - $(this).offset().left;
    const y = e.clientY - $(this).offset().top;
    circle.css({ left: x, top: y }).addClass('ripple-animate');
    setTimeout(() => circle.remove(), 600);
  });

  // Parallax card effect
  $('.parallax-card').on('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    $(this).css('transform', `rotateX(${-y / 20}deg) rotateY(${x / 20}deg)`);
  }).on('mouseleave', function() {
    $(this).css('transform', 'rotateX(0) rotateY(0)');
  });

  // Particles
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles(count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    function updateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      });
      requestAnimationFrame(updateParticles);
    }

    resizeCanvas();
    createParticles(100);
    updateParticles();
    $(window).on('resize', resizeCanvas);
  }

})(jQuery);
