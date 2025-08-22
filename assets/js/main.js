document.addEventListener("DOMContentLoaded", () => {
  /* ==============================
     SMOOTH SCROLL PARA ANCLAS
  ============================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ==============================
     TOGGLE DE PROCESO DE PROYECTOS
  ============================== */
  const toggles = document.querySelectorAll(".toggle-process");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      const process = toggle.nextElementSibling;
      if (process) process.style.display = toggle.classList.contains("active") ? "block" : "none";
    });
  });

  /* ==============================
     ANIMACIÓN DE ELEMENTOS AL SCROLL
  ============================== */
  const scrollElements = document.querySelectorAll(".fade-in, .slide-up, .slide-left, .slide-right");
  const elementInView = (el, offset = 0) => {
    const top = el.getBoundingClientRect().top;
    return top <= (window.innerHeight || document.documentElement.clientHeight) - offset;
  };
  const displayScrollElement = el => el.classList.add("in-view");
  const hideScrollElement = el => el.classList.remove("in-view");

  const handleScrollAnimation = () => {
    scrollElements.forEach(el => {
      elementInView(el, 100) ? displayScrollElement(el) : hideScrollElement(el);
    });
  };
  window.addEventListener("scroll", handleScrollAnimation);
  handleScrollAnimation(); // inicial

  /* ==============================
     MICROINTERACCIONES BOTONES
  ============================== */
  const buttons = document.querySelectorAll(".button");
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => btn.classList.add("hovered"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("hovered"));
  });

  /* ==============================
     EFECTO PARALLAX EN TARJETAS
  ============================== */
  const parallaxCards = document.querySelectorAll(".improved-project");
  parallaxCards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) translateZ(0)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0) rotateX(0) translateZ(0)";
    });
  });

  // ================= RIPPLE EFFECT =================
  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      circle.classList.add('ripple');
      this.appendChild(circle);

      // Calcular tamaño y posición del ripple
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = e.clientX - rect.left - size / 2 + 'px';
      circle.style.top = e.clientY - rect.top - size / 2 + 'px';

      // Remover ripple después de la animación
      circle.addEventListener('animationend', () => circle.remove());
    });
  });

});
