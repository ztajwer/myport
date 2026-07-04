/* main.js - Core UI and Interaction Logic */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation & Page Transitions
  const navLinks = document.querySelectorAll('.nav-link');
  const navActionBtns = document.querySelectorAll('.nav-action-btn');
  const pageSections = document.querySelectorAll('.page-section');
  const navMenu = document.getElementById('nav-menu');
  const mobileToggle = document.getElementById('mobile-toggle');

  const switchSection = (targetSectionId) => {
    // Hide all sections & deactivate links
    pageSections.forEach(section => {
      section.classList.remove('active');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      // Scroll to top
      window.scrollTo(0, 0);
      // Dispatch resize event (essential for hidden 3D canvases to calculate their sizes)
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }

    // Activate corresponding link
    const activeLink = document.querySelector(`.nav-link[data-section="${targetSectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Close mobile menu if open
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      const icon = mobileToggle.querySelector('i');
      icon.className = 'fa-solid fa-bars';
    }
  };

  // Click handler for navigation items
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      switchSection(sectionId);
      // Update hash in URL
      history.pushState(null, null, `#${sectionId}`);
    });
  });

  // Click handler for internal CTA buttons (e.g. "View Work", "Let's Connect")
  navActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionId = btn.getAttribute('data-section');
      switchSection(sectionId);
    });
  });

  // Handle mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // Handle URL hash on initial load
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    switchSection(initialHash);
  }

  // 2. Custom Cursor and Spotlight Glow
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  const cursorGlow = document.getElementById('cursor-glow');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Direct cursor dot tracking
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    // Spotlight glow custom CSS properties
    cursorGlow.style.setProperty('--mouse-x', `${mouseX}px`);
    cursorGlow.style.setProperty('--mouse-y', `${mouseY}px`);
  });

  // Smooth lerp (physics) for outline cursor follower
  const animateOutline = () => {
    const lerpFactor = 0.15; // Speed of tracking outline
    outlineX += (mouseX - outlineX) * lerpFactor;
    outlineY += (mouseY - outlineY) * lerpFactor;

    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateOutline);
  };
  animateOutline();

  // Hover states for interactive elements (expand cursor)
  const hoverables = document.querySelectorAll('a, button, .project-card, .tech-item, input, textarea');
  hoverables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    item.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // 3. Dark/Light Theme Switching
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Read saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark-theme';
  document.body.className = savedTheme;

  themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('theme', 'light-theme');
    } else {
      document.body.classList.replace('light-theme', 'dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  });

  // 4. Projects Category Filter
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 5. Image Carousel (Neuro-Magic Project)
  const carousel = document.getElementById('neuro-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach((slide, idx) => {
        slide.classList.remove('active');
        if (idx === index) {
          slide.classList.add('active');
        }
      });
    };

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });
  }

  // 6. Interactive 3D Card Tilt Effect
  const cards = document.querySelectorAll('.project-card, .tech-category, .contact-info-card, .contact-form-card, .stat-card, .home-ai-section, .service-card, .home-youtube-section, .yt-video-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // mouse position inside card
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate rotation angles based on cursor offset from card center (-10 to 10 deg)
      const rotX = ((y - height / 2) / (height / 2)) * -10;
      const rotY = ((x - width / 2) / (width / 2)) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly reset transformations on cursor exit
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.4s ease';
    });

    card.addEventListener('mouseenter', () => {
      // Disable transition while mouse is moving inside
      card.style.transition = 'none';
    });
  });
  // 7. Success Modal & Normal Contact Form submit (FormSubmit.co ajax integration)
  const contactForm = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const successModalClose = document.getElementById('success-modal-close');

  if (contactForm && successModal) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalBtnHtml = submitBtn.innerHTML;
      
      // Show loading indicator
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';
      
      const formData = {
        name: document.getElementById('form-name').value.trim(),
        email: document.getElementById('form-email').value.trim(),
        message: document.getElementById('form-message').value.trim()
      };

      try {
        // Submit dynamically using FormSubmit.co ajax endpoint
        const response = await fetch('https://formsubmit.co/ajax/zimaltajwer@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (response.ok || result.success === "true") {
          // Open custom success modal card
          successModal.classList.add('open');
          // Clear inputs
          contactForm.reset();
        } else {
          alert('Failed to send message: ' + (result.message || 'Please try again.'));
        }
      } catch (err) {
        console.error('FormSubmit Error:', err);
        alert('Connection error. Failed to send message.');
      } finally {
        // Restore submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });

    // Success Modal Close actions
    if (successModalClose) {
      successModalClose.addEventListener('click', () => {
        successModal.classList.remove('open');
      });
    }

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('open');
      }
    });
  }
});
