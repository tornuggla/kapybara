// Remove no-js class to enable CSS transitions/animations
document.documentElement.classList.remove('no-js');

// Detect mobile devices - only calculate once
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Optimized Utility functions
 */
const utils = {
  // DOM selection helpers
  get: selector => document.querySelector(selector),
  getAll: selector => document.querySelectorAll(selector),
  
  // Event handling with options
  on: (element, event, callback, options = {}) => {
    if (element) element.addEventListener(event, callback, options);
  },
  
  onAll: (elements, event, callback, options = {}) => {
    if (elements && elements.length) {
      elements.forEach(element => element.addEventListener(event, callback, options));
    }
  },
  
  // Performance optimization helpers
  debounce: (func, wait, immediate) => {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Enhanced smooth scrolling with native support check
  smoothScrollTo: (target, duration = 800) => {
    if (!target) return;
    
    // Native smooth scrolling when supported
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset,
        behavior: 'smooth'
      });
      return;
    }
    
    // Fallback for browsers without native smooth scrolling
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  },
  
  // Animation easing function
  easeInOutQuad: (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  },
  
  // Form validation helpers
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  // UI feedback helpers
  showError: (field, message) => {
    const errorElement = utils.get(`#${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      utils.get(`#${field}`).classList.add('error');
      
      // Reset and animate error message
      errorElement.style.opacity = '0';
      errorElement.style.transform = 'translateY(-5px)';
      errorElement.offsetHeight; // Trigger reflow
      
      errorElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      errorElement.style.opacity = '1';
      errorElement.style.transform = 'translateY(0)';
    }
  },
  
  clearErrors: () => {
    utils.getAll('.error-message').forEach(element => {
      element.textContent = '';
    });
    utils.getAll('input, textarea').forEach(element => {
      element.classList.remove('error');
    });
  },
  
  showFormStatus: (isSuccess, message) => {
    const statusElement = utils.get('#form-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = 'form-status';
      
      if (isSuccess) {
        statusElement.classList.add('success');
        statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
      } else {
        statusElement.classList.add('error');
        statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      }
    }
  },
  
  showToast: (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Icon based on type
    const iconMap = {
      'info': 'info-circle',
      'success': 'check-circle',
      'error': 'exclamation-circle',
      'warning': 'exclamation-triangle'
    };
    
    const icon = iconMap[type] || 'info-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    const container = utils.get('.toast-container');
    if (container) {
      container.appendChild(toast);
      toast.offsetHeight; // Trigger reflow
      
      // Show toast with animation
      setTimeout(() => toast.classList.add('show'), 10);
      
      // Hide and remove after duration
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.parentNode?.removeChild(toast), 300);
      }, duration);
    }
  },
  
  // Helper functions
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  isInViewport: (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

/**
 * Initialize the site right away - don't wait for DOMContentLoaded
 * This helps ensure the loading screen is removed properly
 */
// Remove loading screen first to ensure the site becomes visible
hideLoadingScreen();

// Then initialize everything else
document.addEventListener('DOMContentLoaded', () => {
  // Core components
  initNavigation();
  initSmoothScroll();
  initScrollEffects();
  initIntersectionObservers();
  initContactForm();
  createHeroBackground();
  
  // Initialize the logo animation
  initLogoAnimation();
  
  // Accessibility improvements
  addSkipLink();
  
  // Navigation tracking
  initSectionTracking();
  
  // Mobile-specific enhancements
  if (isMobile) {
    initMobileOptimizations();
  }
  
  // Touch interactions for all devices
  initTouchInteractions();

  initServiceModals();
});

/**
 * Enhanced loading screen functionality - separated from DOMContentLoaded
 * to ensure it runs even if there are other JS errors
 */
function hideLoadingScreen() {
  const loadingScreen = document.querySelector('.loading-screen');
  
  if (!loadingScreen) return;
  
  // Animate loading logo
  const loadingLogo = loadingScreen.querySelector('.loading-logo');
  if (loadingLogo) {
    loadingLogo.style.opacity = '0';
    loadingLogo.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      loadingLogo.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      loadingLogo.style.opacity = '1';
      loadingLogo.style.transform = 'scale(1)';
    }, 300);
  }
  
  // More reliable removal - use both load event and timeout
  const removeLoader = () => {
    // Add loaded class which hides it with CSS
    loadingScreen.classList.add('loaded');
    
    // Then actually remove it from DOM after animation
    setTimeout(() => {
      if (loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 500);
  };
  
  // Option 1: Remove on window load
  window.addEventListener('load', removeLoader);
  
  // Option 2: Fallback removal after timeout
  // This ensures it's removed even if the load event doesn't fire properly
  setTimeout(removeLoader, 2000);
}

/**
 * Create hero background with performance optimizations
 */
function createHeroBackground() {
  const heroBackground = utils.get('.hero-background');
  
  if (!heroBackground || isMobile) return;
}

/**
 * Enhanced navigation with better event delegation
 */
function initNavigation() {
  const hamburger = utils.get('.hamburger');
  const navMenu = utils.get('#nav-menu');
  const mobileOverlay = utils.get('.mobile-overlay');
  const navLinks = utils.getAll('.nav-links a');
  
  if (!hamburger || !navMenu) return;
  
  // Toggle mobile navigation
  utils.on(hamburger, 'click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    hamburger.classList.toggle('is-active');
    navMenu.classList.toggle('active');
    
    // Toggle mobile overlay
    if (mobileOverlay) {
      mobileOverlay.classList.toggle('active');
    }
    
    // Prevent body scrolling when menu is open
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  });
  
  // Handle closing mobile menu - event delegation
  const closeMenu = () => {
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      
      if (mobileOverlay) {
        mobileOverlay.classList.remove('active');
      }
    }
  };
  
  // Event listeners for closing menu
  utils.onAll(navLinks, 'click', closeMenu);
  if (mobileOverlay) utils.on(mobileOverlay, 'click', closeMenu);
  
  // Handle keyboard accessibility
  utils.on(document, 'keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  
  // Update active navigation items based on scroll - throttled
  const updateActiveNavItem = utils.throttle(() => {
    const scrollPosition = window.scrollY;
    const sections = utils.getAll('section[id]');
    
    // Find current section
    let currentSection = sections[0]?.id;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (scrollPosition >= sectionTop) {
        currentSection = section.id;
      }
    });
    
    // Update nav links efficiently
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.substring(1);
      link.classList.toggle('active', href === currentSection);
    });
  }, 100);
  
  // Initialize active state and add scroll listener
  //updateActiveNavItem();
  //window.addEventListener('scroll', updateActiveNavItem, { passive: true });
}

/**
 * Enhanced smooth scrolling for anchor links
 */
function initSmoothScroll() {
  // Event delegation for all anchor links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!anchor) return;
    
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    const target = document.querySelector(targetId);
    
    if (target) {
      // Add animation to target
      target.classList.add('scroll-target');
      
      // Smooth scroll
      utils.smoothScrollTo(target, 800);
      
      // Remove animation class after scroll
      setTimeout(() => target.classList.remove('scroll-target'), 1000);
      
      // Update URL without page jump
      history.pushState(null, null, targetId);
    }
  });
  
  // Handle scroll hint
  const scrollHint = utils.get('.scroll-hint');
  if (scrollHint) {
    utils.on(scrollHint, 'click', () => {
      const aboutSection = utils.get('#about');
      if (aboutSection) utils.smoothScrollTo(aboutSection, 800);
    });
  }
}

/**
 * Optimized scroll effects with performance in mind
 */
function initScrollEffects() {
  const header = utils.get('header nav');
  const scrollProgress = utils.get('#scroll-progress');
  const logo = utils.get('.logo a');
  const sections = utils.getAll('section');
  
  // One throttled event handler for all scroll effects
  const handleScroll = utils.throttle(() => {
    const scrollPosition = window.scrollY;
    
    // Use requestAnimationFrame for visual updates
    requestAnimationFrame(() => {
      // Header appearance
      const isScrolled = scrollPosition > 10;
      header?.classList.toggle('scrolled', isScrolled);
      logo?.classList.toggle('scrolled', isScrolled);
      
      // Update scroll progress
      if (scrollProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollPosition / docHeight) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;
      }
      
      // Parallax effects - only for visible sections
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Get decorations only for visible sections
          const decorations = section.querySelectorAll('.decoration-dot');
          if (decorations.length) {
            decorations.forEach(dot => {
              const speed = 0.05;
              const yPos = rect.top * speed;
              dot.style.transform = `translateY(${yPos}px)`;
            });
          }
        }
      });
    });
  }, 16); // Throttle to ~60fps
  
  // Add scroll listener once
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial call to set up the UI
  handleScroll();
}

/**
 * Optimized intersection observers for animations
 */
function initIntersectionObservers() {
  // Only initialize if browser supports Intersection Observer
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    utils.getAll('section, .service, .highlight').forEach(item => {
      item.classList.add('fade-in');
    });
    return;
  }
  
  // Create observers with optimized options and reuse them for similar elements
  
  // 1. Sections fade-in animation
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        section.classList.add('fade-in');
        
        // Add staggered animations for children - more efficient with querySelectorAll
        const children = section.querySelectorAll('h2, .section-intro, .btn');
        children.forEach((child, index) => {
          setTimeout(() => child.classList.add('fade-in'), 200 * index);
        });
      }
    });
  }, { threshold: 0.1 });
  
  // 2. Service cards with staggered animation
  const serviceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const service = entry.target;
        const delay = service.dataset.delay || 0;
        
        // Staggered animation
        setTimeout(() => {
          service.classList.add('fade-in');
          
          // Animate icon after card appears
          const icon = service.querySelector('i');
          if (icon) {
            setTimeout(() => icon.classList.add('animated'), 300);
          }
        }, 150 * delay);
        
        serviceObserver.unobserve(service);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  
  // 3. Highlight effects
  const highlightObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('highlight-visible');
        highlightObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });
  
  // Apply observers to elements - using querySelectorAll once is more efficient
  utils.getAll('section').forEach(section => sectionObserver.observe(section));
  utils.getAll('.service').forEach(service => serviceObserver.observe(service));
  utils.getAll('.highlight').forEach(highlight => highlightObserver.observe(highlight));
}

// Rest of the functions (contactForm, skipLink, sectionTracking, etc.) would follow here...
// I've omitted them to keep this code focused on the loading fix.
// You would need to include all the remaining functions from the original script.

/**
 * Optimized contact form with improved validation
 */
function initContactForm() {
  const form = utils.get('#contact-form');
  if (!form) return;

  const submitButton = form.querySelector('.form-btn');
  const submitText = submitButton.querySelector('.submit-text');
  const status = utils.get('#form-status');

  // Live field animation
  form.addEventListener('focus', function(e) {
    const input = e.target.closest('input, textarea');
    if (!input) return;
    const group = input.closest('.form-group');
    if (group) group.classList.add('focused');
  }, true);

  form.addEventListener('blur', function(e) {
    const input = e.target.closest('input, textarea');
    if (!input) return;
    const group = input.closest('.form-group');
    if (group) {
      group.classList.remove('focused');
      group.classList.toggle('has-value', input.value.trim() !== '');
    }
  }, true);

  form.addEventListener('input', function(e) {
    const input = e.target.closest('input, textarea');
    if (!input) return;
    const group = input.closest('.form-group');
    if (group) {
      group.classList.toggle('has-value', input.value.trim() !== '');
    }
  }, true);

  // Validation
  function validateInput(input) {
    if (!input) return 'Invalid input';

    const id = input.id;
    const value = input.value.trim();

    const validationRules = {
      'name': {
        check: () => value.length >= 2,
        errorMsg: 'Namnet måste innehålla minst 2 tecken'
      },
      'email': {
        check: () => utils.isValidEmail(value),
        errorMsg: 'Vänligen ange en giltig e-postadress'
      },
      'subject': {
        check: () => value.length >= 3,
        errorMsg: 'Ämnet måste innehålla minst 3 tecken'
      },
      'message': {
        check: () => value.length >= 10,
        errorMsg: 'Meddelandet måste innehålla minst 10 tecken'
      }
    };

    if (!value) return `Vänligen ange ${id === 'email' ? 'din e-post' : 'ett ' + id}`;

    const rule = validationRules[id];
    if (rule && !rule.check()) return rule.errorMsg;

    return null;
  }

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    utils.clearErrors();

    const fields = {
      name: utils.get('#name'),
      email: utils.get('#email'),
      subject: utils.get('#subject'),
      message: utils.get('#message')
    };

    let isValid = true;
    for (const [id, field] of Object.entries(fields)) {
      const error = validateInput(field);
      if (error) {
        utils.showError(id, error);
        isValid = false;
      }
    }

    if (!isValid) {
      utils.showToast('Vänligen fyll i alla obligatoriska fält', 'error');
      return;
    }

    const formData = new FormData(form);

    // Show sending state
    submitButton.disabled = true;
    submitText.textContent = 'Skickar...';
    status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        utils.showToast('Tack! Ditt meddelande har skickats.', 'success');
        status.textContent = 'Tack för ditt meddelande! Vi återkommer snart.';
        status.classList.add('visible');

        // Form animation
        form.classList.add('success-animate');
        setTimeout(() => {
          form.classList.remove('success-animate');
        }, 2000);

        // Button animation
        submitButton.classList.add('success-animate');
        setTimeout(() => {
          submitButton.classList.remove('success-animate');
        }, 1500);

        // Button text change
        submitText.textContent = 'Meddelande skickat!';
        setTimeout(() => {
          submitText.textContent = 'Skicka meddelande';
        }, 3000);

      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitText.textContent = 'Skicka meddelande';
      utils.showToast('Ett fel uppstod. Försök igen senare.', 'error');
      status.textContent = 'Ett fel uppstod. Vänligen försök igen.';
    } finally {
      submitButton.disabled = false;
    }
  });
}

/**
 * Mobile optimizations combined into one function
 */
function initMobileOptimizations() {
  // Connection quality check
  checkConnection();
  
  // Swipeable services
  setupSwipeableServices();
  
  // Touch enhancements
  initVibrationFeedback();
  initFastClick();
  
  // Image optimizations
  optimizeImagesForMobile();
}

/**
 * Check connection quality and optimize accordingly
 */
function checkConnection() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    // Function to handle connection changes
    const handleConnectionChange = () => {
      const isSlowConnection = connection.saveData || 
                              ['slow-2g', '2g'].includes(connection.effectiveType);
      
      if (isSlowConnection) {
        document.documentElement.classList.add('reduced-motion');
        
        const heroBackground = utils.get('.hero-background');
        if (heroBackground) {
          heroBackground.classList.add('simplified');
        }
        
        utils.showToast('Låghastighetläge aktiverat för bättre prestanda', 'info');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    };
    
    // Initial check
    handleConnectionChange();
    
    // Monitor changes
    if (connection.addEventListener) {
      connection.addEventListener('change', handleConnectionChange);
    }
  }
}

/**
 * Optimized swipeable services setup
 */
function setupSwipeableServices() {
  const servicesGrid = utils.get('.services-grid');
  const services = utils.getAll('.service');
  
  if (!servicesGrid || !services.length) return;
  
  // Touch handling variables
  let startX, currentX, isDragging = false;
  const threshold = 50;
  
  // Touch event handlers
  servicesGrid.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    servicesGrid.style.transition = 'none';
  }, { passive: true });
  
  servicesGrid.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Get dimensions once
    const containerWidth = servicesGrid.offsetWidth;
    const contentWidth = servicesGrid.scrollWidth;
    const maxScroll = contentWidth - containerWidth;
    const currentScroll = servicesGrid.scrollLeft;
    
    // Apply scroll with edge resistance
    if ((currentScroll <= 0 && diffX > 0) || (currentScroll >= maxScroll && diffX < 0)) {
      servicesGrid.scrollLeft = currentScroll - diffX * 0.2; // Resistance
    } else {
      servicesGrid.scrollLeft = currentScroll - diffX;
    }
    
    startX = currentX;
  }, { passive: true });
  
  servicesGrid.addEventListener('touchend', () => {
    isDragging = false;
    servicesGrid.style.transition = '';
  }, { passive: true });
  
  // Create pagination dots
  const dotsContainer = utils.get('.swipe-dots');
  if (dotsContainer) {
    // Create dots with fragment for performance
    const fragment = document.createDocumentFragment();
    
    services.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'swipe-dot';
      
      if (index === 0) {
        dot.classList.add('active');
      }
      
      // Add click functionality to dots
      dot.addEventListener('click', () => {
        // Get service width once
        const service = services[0];
        const serviceWidth = service.offsetWidth + 
          parseInt(getComputedStyle(service).marginRight || 0);
          
        servicesGrid.scrollTo({
          left: serviceWidth * index,
          behavior: 'smooth'
        });
      });
      
      fragment.appendChild(dot);
    });
    
    // Append all dots at once for performance
    dotsContainer.appendChild(fragment);
    
    // Update dots on scroll - throttled for performance
    servicesGrid.addEventListener('scroll', utils.throttle(() => {
      // Calculate active index efficiently
      const scrollPosition = servicesGrid.scrollLeft;
      const serviceWidth = services[0].offsetWidth + 
        parseInt(getComputedStyle(services[0]).marginRight || 0);
      const activeIndex = Math.round(scrollPosition / serviceWidth);
      
      // Update dots with minimal DOM operations
      dotsContainer.querySelectorAll('.swipe-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    }, 100), { passive: true });
  }
}

/**
 * Add vibration feedback for touch interactions
 */
function initVibrationFeedback() {
  if (!('vibrate' in navigator)) return;
  
  // Use event delegation for efficiency
  document.addEventListener('touchstart', e => {
    const target = e.target.closest('button, .btn, .service, .nav-links a, .social-links a');
    if (target) {
      navigator.vibrate(10); // Short vibration
    }
  }, { passive: true });
  
  // Special vibration for form submission
  const contactForm = utils.get('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      navigator.vibrate([15, 10, 15]); // Pattern vibration
    });
  }
}

/**
 * Optimized fast click implementation to reduce tap delay on mobile
 */
function initFastClick() {
  // Use event delegation for efficiency
  document.addEventListener('touchend', e => {
    // Only process relevant interactive elements
    const target = e.target.closest('a, button, .btn, .service');
    if (!target) return;
    
    e.preventDefault();
    
    if (target.tagName === 'A' && target.getAttribute('href')) {
      const href = target.getAttribute('href');
      
      if (href.startsWith('#')) {
        // Handle in-page navigation
        const targetElement = document.querySelector(href);
        if (targetElement) {
          utils.smoothScrollTo(targetElement, 800);
        }
      } else {
        // Handle external navigation
        window.location.href = href;
      }
    } else {
      // Trigger click for other elements
      target.click();
    }
  }, { passive: false });
}

/**
 * Optimize images for mobile with native and fallback lazy loading
 */
function optimizeImagesForMobile() {
  if ('loading' in HTMLImageElement.prototype) {
    // Use native lazy loading
    utils.getAll('img').forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    // Fallback with Intersection Observer
    const lazyImages = utils.getAll('img[data-src]');
    if (!lazyImages.length) return;
    
    const lazyImageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.removeAttribute('data-src');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    
    lazyImages.forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  }
}

/**
 * Enhanced touch interactions
 */
function initTouchInteractions() {
  initRippleEffect();
  initTouchGestures();
}

/**
 * Optimized ripple effect for touch feedback
 */
function initRippleEffect() {
  // Use event delegation for all ripple elements
  document.addEventListener('touchstart', e => {
    const target = e.target.closest('.ripple');
    if (!target) return;
    
    e.preventDefault();
    
    // Remove existing ripples
    target.querySelectorAll('.ripple-effect').forEach(ripple => ripple.remove());
    
    // Create ripple with optimized calculations
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = target.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Apply styles
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${touchX - size/2}px;
      top: ${touchY - size/2}px;
    `;
    
    target.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode === target) {
        target.removeChild(ripple);
      }
    }, 600);
  }, { passive: false });
  
  // Prevent ghost clicks on interactive elements
  document.addEventListener('touchend', e => {
    const target = e.target.closest('.ripple');
    if (!target) return;
    
    // Let browser handle links and buttons normally
    if (['A', 'BUTTON'].includes(target.tagName)) return;
    
    e.preventDefault();
  }, { passive: false });
}

/**
 * Add advanced touch gestures
 */
function initTouchGestures() {
  // Double-tap to scroll to top
  let lastTap = 0;
  
  document.addEventListener('touchend', e => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      if (['BODY', 'HTML'].includes(e.target.tagName)) {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        utils.showToast('Återgår till toppen', 'info');
      }
    }
    
    lastTap = currentTime;
  });
}

/**
 * Add skip to content link for accessibility
 */
function addSkipLink() {
  const skipLink = utils.get('.skip-link');
  if (!skipLink) return;
  
  utils.on(skipLink, 'click', e => {
    e.preventDefault();
    const target = document.querySelector(skipLink.getAttribute('href'));
    
    if (target) {
      // Make focusable and focus
      target.tabIndex = -1;
      target.focus();
      
      // Scroll to target
      utils.smoothScrollTo(target, 600);
      
      // Show focus indicator temporarily
      target.classList.add('skip-target');
      setTimeout(() => target.classList.remove('skip-target'), 2000);
    }
  });
}

/**
 * Track sections for better navigation
 */
/**
 * Track sections for better navigation - FIXED VERSION
 */
function initSectionTracking() {
  const sections = utils.getAll('section[id]');
  const navLinks = utils.getAll('.nav-links a');
  const mobileNavLinks = utils.getAll('.mobile-bottom-nav a');
  
  if (!sections.length) return;
  
  // Store section positions for performance
  const sectionPositions = new Map();
  
  // Function to recalculate section positions
  const updateSectionPositions = () => {
    sections.forEach(section => {
      sectionPositions.set(section.id, {
        top: section.offsetTop - 100,
        bottom: section.offsetTop + section.offsetHeight - 100
      });
    });
  };
  
  // Initial call and update on resize
  updateSectionPositions();
  window.addEventListener('resize', utils.debounce(updateSectionPositions, 100));
  
  // Update active navigation links - throttled
  const updateActiveLinks = utils.throttle(() => {
    const scrollPosition = window.scrollY;
    let activeSection = null;
    
    // Get the contact section specifically
    const contactSection = sections[sections.length - 1];
    const contactId = contactSection.id;
    const contactPosition = sectionPositions.get(contactId);
    
    // Check if we're viewing the contact section either:
    // 1. We're within the contact section's vertical boundaries, OR
    // 2. We're at the bottom of the page
    const isInContactSection = contactPosition && 
      scrollPosition >= contactPosition.top && 
      scrollPosition < contactPosition.bottom;
    
    const isAtBottom = scrollPosition + window.innerHeight >= document.body.offsetHeight - 150;
    
    // Determine active section with improved logic
    if (isInContactSection || isAtBottom) {
      // If in contact section or at bottom, always highlight contact
      activeSection = contactId;
    } 
    else if (scrollPosition < 100) {
      // Special case for top of page
      activeSection = 'home';
    } 
    else {
      // Check other sections (excluding contact which we've already handled)
      for (const [id, position] of sectionPositions.entries()) {
        if (id !== contactId && scrollPosition >= position.top && scrollPosition < position.bottom) {
          activeSection = id;
          break;
        }
      }
      
      // If no section was found active but we've scrolled significantly
      // find the nearest section based on position
      if (!activeSection && scrollPosition > 100) {
        let closestSection = null;
        let closestDistance = Infinity;
        
        for (const [id, position] of sectionPositions.entries()) {
          // Calculate distance to section
          const distanceToTop = Math.abs(scrollPosition - position.top);
          const distanceToBottom = Math.abs(scrollPosition - position.bottom);
          const minDistance = Math.min(distanceToTop, distanceToBottom);
          
          if (minDistance < closestDistance) {
            closestDistance = minDistance;
            closestSection = id;
          }
        }
        
        activeSection = closestSection;
      }
    }
    
    // Update all navigation links efficiently
    const updateNavLinks = (links) => {
      links.forEach(link => {
        const href = link.getAttribute('href')?.substring(1);
        link.classList.toggle('active', href === activeSection);
      });
    };
    
    updateNavLinks(navLinks);
    updateNavLinks(mobileNavLinks);
    
    // For debugging (remove in production)
    // console.log(`Scroll: ${scrollPosition}, Active: ${activeSection}, In Contact: ${isInContactSection}, At Bottom: ${isAtBottom}`);
  }, 100);
  
  // Initialize and add scroll listener
  updateActiveLinks();
  window.addEventListener('scroll', updateActiveLinks, { passive: true });
}

/**
 * Initialize service modals for clickable service cards and footer links
 */
function initServiceModals() {
  const services = utils.getAll('.service');
  
  // Only proceed if we have services
  if (!services.length) return;
  
  // Create modal container if it doesn't exist
  let modalContainer = utils.get('.modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    document.body.appendChild(modalContainer);
  }
  
  // Make entire service cards clickable
  services.forEach((service, index) => {
    // Add click handler to entire service card
    utils.on(service, 'click', (e) => {
      // Get service data
      const title = service.querySelector('h3').textContent;
      const icon = service.querySelector('i').className;
      const serviceType = index % 2 === 0 ? 'primary' : 'secondary';
      
      // Show modal with service details
      showServiceModal(title, icon, getServiceContent(title), serviceType);
    });
  });
  
  // Add event listeners to footer service links as well
  const footerServiceLinks = utils.getAll('.footer-col:nth-child(2) a');
  footerServiceLinks.forEach((link, index) => {
    utils.on(link, 'click', (e) => {
      e.preventDefault();
      
      // Get service title from the link text
      const serviceTitle = link.textContent.trim();
      
      // Determine service type (alternate between primary/secondary)
      const serviceType = index % 2 === 0 ? 'primary' : 'secondary';
      
      // Determine icon class based on service title
      const iconClass = getIconClassForService(serviceTitle);
      
      // Show modal with service details
      showServiceModal(serviceTitle, iconClass, getServiceContent(serviceTitle), serviceType);
    });
  });
  
  // Helper function to get icon class based on service title
  function getIconClassForService(title) {
    // Map service titles to their corresponding icon classes
    const iconMap = {
      'Projektledning': 'fas fa-diagram-project',
      'Processutveckling': 'fas fa-cogs',
      'Affärsutveckling': 'fas fa-chart-line',
      'Strategisk rådgivning': 'fas fa-lightbulb',
      'Teknisk support': 'fas fa-headset',
      'Digitalisering': 'fas fa-digital-tachograph'
    };
    
    return iconMap[title] || 'fas fa-briefcase'; // Default icon as fallback
  }
  
  // Function to show the modal
  function showServiceModal(title, iconClass, content, type = 'primary') {
    // Create modal HTML
    const modalHTML = `
      <div class="modal service-modal ${type}">
        <div class="modal-content">
          <button class="modal-close" aria-label="Stäng">
            <i class="fas fa-times"></i>
          </button>
          <div class="modal-header">
            <i class="${iconClass}"></i>
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer">
            <a href="#contact" class="btn btn-${type === 'primary' ? 'secondary' : ''} ripple">Kontakta oss</a>
          </div>
        </div>
      </div>
    `;
    
    // Insert modal into container
    modalContainer.innerHTML = modalHTML;
    
    // Get modal elements
    const modal = modalContainer.querySelector('.modal');
    const closeBtn = modal.querySelector('.modal-close');
    const contactBtn = modal.querySelector('.modal-footer .btn');
    
    // Add event listeners
    utils.on(closeBtn, 'click', closeModal);
    utils.on(contactBtn, 'click', (e) => {
      closeModal();
      // Smooth scroll to contact section after a small delay
      setTimeout(() => {
        const contactSection = utils.get('#contact');
        if (contactSection) utils.smoothScrollTo(contactSection, 800);
      }, 300);
    });
    
    // Close on click outside modal content
    utils.on(modal, 'click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Close on ESC key
    utils.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
    
    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }, 10);
    
    // Add ripple effect to buttons
    initRippleEffect();
    
    // Function to close modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
      
      // Remove modal after animation completes
      setTimeout(() => {
        modalContainer.innerHTML = '';
      }, 300);
      
      // Remove document event listener
      document.removeEventListener('keydown', closeModal);
    }
  }
  
  // Function to get content for each service
  // Replace these with your actual service descriptions
  function getServiceContent(serviceTitle) {
    const serviceContents = {
      'Projektledning': `
        <p>Vi levererar professionell projektledning som säkerställer att era projekt genomförs effektivt och framgångsrikt. Med vår hjälp kan ni:</p>
        <ul>
          <li>Tydligt definiera mål och förväntningar</li>
          <li>Skapa realistiska tidsplaner och budgetar</li>
          <li>Identifiera och hantera risker proaktivt</li>
          <li>Koordinera team och resurser effektivt</li>
          <li>Säkerställa leverans av hög kvalitet inom utsatt tid</li>
        </ul>
        <p>Vår metodik bygger på både agila och traditionella projektledningsmetoder, anpassade efter ert projekts specifika behov och mål.</p>
        <p>Vi har omfattande erfarenhet av att leda projekt inom olika branscher och kan snabbt anpassa oss till er organisations struktur och processer.</p>
      `,
      'Processutveckling': `
        <p>Vår processutveckling hjälper er att optimera verksamhetens flöden för ökad effektivitet och kvalitet. Vi erbjuder:</p>
        <ul>
          <li>Detaljerad kartläggning av nuvarande processer</li>
          <li>Identifiering av flaskhalsar och ineffektivitet</li>
          <li>Analys av värdeskapande vs icke-värdeskapande aktiviteter</li>
          <li>Framtagning av optimerade processflöden</li>
          <li>Implementationsstöd och förändringsledning</li>
          <li>Mätning och uppföljning för kontinuerlig förbättring</li>
        </ul>
        <p>Vi använder beprövade metoder som Lean, Six Sigma och BPM (Business Process Management) för att skapa hållbara och anpassade lösningar för er verksamhet.</p>
        <p>Vårt mål är att skapa processer som både ökar produktiviteten och förbättrar arbetsmiljön för era medarbetare.</p>
      `,
      'Affärsutveckling': `
        <p>Vår affärsutveckling hjälper er identifiera nya möjligheter för tillväxt och skapa strategier för långsiktig framgång.</p>
        <ul>
          <li>Marknadsanalys och konkurrentkartläggning</li>
          <li>Identifiering av tillväxtmöjligheter</li>
          <li>Utveckling av affärsmodeller</li>
          <li>Strategi för produktutveckling och innovation</li>
          <li>Partnerskap och samarbeten</li>
          <li>Internationalisering och nya marknader</li>
        </ul>
        <p>Vi kombinerar strategiskt tänkande med praktisk implementering för att säkerställa att idéer omvandlas till konkreta resultat.</p>
        <p>Vår approach är alltid skräddarsydd efter er specifika situation, bransch och målsättningar.</p>
      `,
      'Strategisk rådgivning': `
        <p>Vår strategiska rådgivning hjälper er att fatta välgrundade beslut baserade på djupgående analys och branschinsikter.</p>
        <ul>
          <li>Strategiutveckling och planering</li>
          <li>Omvärldsanalys och framtidsspaning</li>
          <li>Beslutsstöd för ledningsgrupper</li>
          <li>Ledarskapsutveckling</li>
          <li>Förändringsledning</li>
          <li>Prioritering och resursallokering</li>
        </ul>
        <p>Vi fungerar som ett strategiskt bollplank för er ledning och bidrar med både perspektiv och konkreta verktyg för beslutsfattande.</p>
        <p>Vår rådgivning är alltid oberoende, faktabaserad och anpassad till er specifika situation och utmaningar.</p>
      `,
      'Teknisk support': `
        <p>Vår tekniska support säkerställer att era system fungerar optimalt för maximal produktivitet och minimala driftstörningar.</p>
        <ul>
          <li>Systemoptimering och prestandaförbättring</li>
          <li>Felsökning och problemlösning</li>
          <li>Implementation av säkerhetslösningar</li>
          <li>Integration mellan system och plattformar</li>
          <li>Backup- och återställningslösningar</li>
          <li>Användarsupport och utbildning</li>
        </ul>
        <p>Vi har bred kompetens inom olika tekniska miljöer och kan snabbt sätta oss in i er specifika IT-infrastruktur.</p>
        <p>Vår support kan erbjudas både som löpande tjänst eller som punktinsatser vid särskilda behov eller projekt.</p>
      `,
      'Digitalisering': `
        <p>Vår digitaliseringstjänst hjälper er att utnyttja digitala möjligheter för ökad effektivitet och konkurrenskraft.</p>
        <ul>
          <li>Digital strategi och roadmap</li>
          <li>Kartläggning av digitaliseringsmöjligheter</li>
          <li>Implementation av digitala verktyg och plattformar</li>
          <li>Automatisering av manuella processer</li>
          <li>Digital kundupplevelse och gränssnitt</li>
          <li>Dataanalys och insiktsarbete</li>
        </ul>
        <p>Vi kombinerar teknisk expertis med djup förståelse för affärsprocesser för att säkerställa att digitaliseringen skapar verkligt värde.</p>
        <p>Vår approach är pragmatisk och fokuserad på lösningar som ger konkreta resultat, inte teknik för teknikens skull.</p>
      `
    };
    
    // Return content for the specific service or a default message
    return serviceContents[serviceTitle] || `
      <p>Detaljerad information om denna tjänst kommer snart. Kontakta oss gärna för mer information.</p>
    `;
  }
}

// Add this function to your optimized script.js file
function initLogoAnimation() {
  const logo = utils.get('.logo a');
  if (!logo) return;
  
  // Store the text content for the color sweep effect
  const logoText = logo.textContent;
  logo.setAttribute('data-text', logoText);
  
  // Setup the particles container
  const particlesDiv = document.createElement('div');
  particlesDiv.className = 'particles';
  
  // Add particles
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particlesDiv.appendChild(particle);
  }
  
  // Add the particles container
  logo.appendChild(particlesDiv);
  
  // Add dynamic particle positions on hover
  logo.addEventListener('mouseenter', () => {
    const logoRect = logo.getBoundingClientRect();
    const particles = logo.querySelectorAll('.particle');
    
    // Position particles around the logo
    particles.forEach((particle, index) => {
      // Create a more distributed particle effect
      const angle = (index / particles.length) * Math.PI * 2;
      const radius = 15 + Math.random() * 15;
      const x = (logoRect.width / 2) + Math.cos(angle) * radius;
      const y = (logoRect.height / 2) + Math.sin(angle) * radius;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
    });
  });
}

// Ensure page loads at the top on refresh while respecting intentional anchors
(function() {
  // Store the current scroll position before page refresh
  window.onbeforeunload = function() {
    // Only modify scroll behavior if there's no hash in the URL
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  };

  // Handle scroll on page load
  window.addEventListener('load', function() {
    // If there's no hash in the URL (no specific section targeted)
    if (!window.location.hash) {
      // Use setTimeout to ensure this happens after any browser scroll restoration
      setTimeout(function() {
        window.scrollTo(0, 0);
      }, 0);
    } else {
      // If there is a hash, ensure smooth scrolling to that section
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        setTimeout(function() {
          // Use your existing smooth scroll function if available
          if (typeof utils !== 'undefined' && utils.smoothScrollTo) {
            utils.smoothScrollTo(targetElement);
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  });

  // For browsers that support the 'scrollRestoration' property
  if ('scrollRestoration' in history) {
    // Prevent the browser from automatically restoring scroll position
    history.scrollRestoration = 'manual';
  }
})();