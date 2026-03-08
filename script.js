document.documentElement.classList.remove('no-js');
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const utils = {
 get: selector => document.querySelector(selector),
 getAll: selector => document.querySelectorAll(selector),
 on: (element, event, callback, options = {}) => {
 if (element) element.addEventListener(event, callback, options);
 },
 onAll: (elements, event, callback, options = {}) => {
 if (elements && elements.length) {
 elements.forEach(element => element.addEventListener(event, callback, options));
 }
 },
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
 smoothScrollTo: (target, duration = 800) => {
 if (!target) return;
 if ('scrollBehavior' in document.documentElement.style) {
 window.scrollTo({
 top: target.getBoundingClientRect().top + window.pageYOffset,
 behavior: 'smooth'
 });
 return;
 }
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
 easeInOutQuad: (t, b, c, d) => {
 t /= d / 2;
 if (t < 1) return c / 2 * t * t + b;
 t--;
 return -c / 2 * (t * (t - 2) - 1) + b;
 },
 isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
 showError: (field, message) => {
 const errorElement = utils.get(`#${field}-error`);
 if (errorElement) {
 errorElement.textContent = message;
 utils.get(`#${field}`).classList.add('error');
 errorElement.style.opacity = '0';
 errorElement.style.transform = 'translateY(-5px)';
 errorElement.offsetHeight; 
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
 toast.offsetHeight; 
 setTimeout(() => toast.classList.add('show'), 10);
 setTimeout(() => {
 toast.classList.remove('show');
 setTimeout(() => toast.parentNode?.removeChild(toast), 300);
 }, duration);
 }
 },
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
document.addEventListener('DOMContentLoaded', () => {
 initNavigation();
 initSmoothScroll();
 initScrollEffects();
 initIntersectionObservers();
 initContactForm();
 createHeroBackground();
 initLogoAnimation();
 addSkipLink();
 initSectionTracking();
 fixHeroButtonNavigation();
 if (isMobile) {
 initMobileOptimizations();
 }
 initTouchInteractions();
 initServiceModals();
});
function createHeroBackground() {
 const heroBackground = utils.get('.hero-background');
 if (!heroBackground || isMobile) return;
}
function initNavigation() {
 const hamburger = utils.get('.hamburger');
 const navMenu = utils.get('#nav-menu');
 const mobileOverlay = utils.get('.mobile-overlay');
 const navLinks = utils.getAll('.nav-links a');
 if (!hamburger || !navMenu) {
 console.warn('Navigation elements not found');
 return;
 }
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
 hamburger.addEventListener('click', () => {
 const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
 hamburger.setAttribute('aria-expanded', !isExpanded);
 hamburger.classList.toggle('is-active');
 navMenu.classList.toggle('active');
 if (mobileOverlay) {
 mobileOverlay.classList.toggle('active');
 }
 document.body.style.overflow = isExpanded ? '' : 'hidden';
 });
 navLinks.forEach(link => {
 link.addEventListener('click', (e) => {
 closeMenu();
 const href = link.getAttribute('href');
 if (href && href.startsWith('#')) {
 e.preventDefault();
 const targetElement = document.querySelector(href);
 if (targetElement) {
 setTimeout(() => {
 utils.smoothScrollTo(targetElement, 800);
 }, 100);
 }
 }
 });
 });
 if (mobileOverlay) {
 mobileOverlay.addEventListener('click', closeMenu);
 }
 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape') closeMenu();
 });
 const updateActiveNavItem = utils.throttle(() => {
 const scrollPosition = window.scrollY;
 const sections = utils.getAll('section[id]');
 let currentSection = sections[0]?.id;
 sections.forEach(section => {
 const sectionTop = section.offsetTop - 150;
 if (scrollPosition >= sectionTop) {
 currentSection = section.id;
 }
 });
 navLinks.forEach(link => {
 const href = link.getAttribute('href')?.substring(1);
 link.classList.toggle('active', href === currentSection);
 });
 }, 100);
 updateActiveNavItem();
 window.addEventListener('scroll', updateActiveNavItem, { passive: true });
}
function initSmoothScroll() {
 document.addEventListener('click', (e) => {
 const anchor = e.target.closest('a[href^="#"]:not([href="#"])');
 if (!anchor) return;
 e.preventDefault();
 const targetId = anchor.getAttribute('href');
 const target = document.querySelector(targetId);
 if (target) {
 target.classList.add('scroll-target');
 utils.smoothScrollTo(target, 800);
 setTimeout(() => target.classList.remove('scroll-target'), 1000);
 history.pushState(null, null, targetId);
 }
 });
 const scrollHint = utils.get('.scroll-hint');
 if (scrollHint) {
 scrollHint.addEventListener('click', () => {
 const aboutSection = utils.get('#about');
 if (aboutSection) utils.smoothScrollTo(aboutSection, 800);
 });
 }
}
function initScrollEffects() {
 const header = utils.get('header nav');
 const scrollProgress = utils.get('#scroll-progress');
 const logo = utils.get('.logo a');
 const sections = utils.getAll('section');
 const handleScroll = utils.throttle(() => {
 const scrollPosition = window.scrollY;
 requestAnimationFrame(() => {
 const isScrolled = scrollPosition > 10;
 header?.classList.toggle('scrolled', isScrolled);
 logo?.classList.toggle('scrolled', isScrolled);
 if (scrollProgress) {
 const docHeight = document.documentElement.scrollHeight - window.innerHeight;
 const scrollPercent = (scrollPosition / docHeight) * 100;
 scrollProgress.style.width = `${scrollPercent}%`;
 }
 sections.forEach(section => {
 const rect = section.getBoundingClientRect();
 if (rect.top < window.innerHeight && rect.bottom > 0) {
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
 }, 16); 
 window.addEventListener('scroll', handleScroll, { passive: true });
 handleScroll();
}
function initIntersectionObservers() {
 if (!('IntersectionObserver' in window)) {
 utils.getAll('section, .service, .highlight').forEach(item => {
 item.classList.add('fade-in');
 });
 return;
 }
 const sectionObserver = new IntersectionObserver(entries => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 const section = entry.target;
 section.classList.add('fade-in');
 const children = section.querySelectorAll('h2, .section-intro, .btn');
 children.forEach((child, index) => {
 setTimeout(() => child.classList.add('fade-in'), 200 * index);
 });
 }
 });
 }, { threshold: 0.1 });
 const serviceObserver = new IntersectionObserver(entries => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 const service = entry.target;
 const delay = service.dataset.delay || 0;
 setTimeout(() => {
 service.classList.add('fade-in');
 const icon = service.querySelector('i');
 if (icon) {
 setTimeout(() => icon.classList.add('animated'), 300);
 }
 }, 150 * delay);
 serviceObserver.unobserve(service);
 }
 });
 }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
 const highlightObserver = new IntersectionObserver(entries => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 entry.target.classList.add('highlight-visible');
 highlightObserver.unobserve(entry.target);
 }
 });
 }, { threshold: 0.7 });
 utils.getAll('section').forEach(section => sectionObserver.observe(section));
 utils.getAll('.service').forEach(service => serviceObserver.observe(service));
 utils.getAll('.highlight').forEach(highlight => highlightObserver.observe(highlight));
}
function initContactForm() {
 const form = utils.get('#contact-form');
 if (!form) return;
 const submitButton = form.querySelector('.form-btn');
 const submitText = submitButton.querySelector('.submit-text');
 const status = utils.get('#form-status');
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
 form.classList.add('success-animate');
 setTimeout(() => {
 form.classList.remove('success-animate');
 }, 2000);
 submitButton.classList.add('success-animate');
 setTimeout(() => {
 submitButton.classList.remove('success-animate');
 }, 1500);
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
function initMobileOptimizations() {
 checkConnection();
 initMobileTouchFixes();
 initVibrationFeedback();
 optimizeImagesForMobile();
}
function checkConnection() {
 if ('connection' in navigator) {
 const connection = navigator.connection;
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
 handleConnectionChange();
 if (connection.addEventListener) {
 connection.addEventListener('change', handleConnectionChange);
 }
 }
}
function initMobileTouchFixes() {
 console.log('Initializing mobile touch fixes');
 initServiceModals();
}
function initVibrationFeedback() {
 if (!('vibrate' in navigator)) return;
 document.addEventListener('touchstart', e => {
 const target = e.target.closest('button, .btn, .service, .nav-links a, .social-links a');
 if (target) {
 navigator.vibrate(10); 
 }
 }, { passive: true });
 const contactForm = utils.get('#contact-form');
 if (contactForm) {
 contactForm.addEventListener('submit', () => {
 navigator.vibrate([15, 10, 15]); 
 });
 }
}
function initFastClick() {
 const fastClickElements = utils.getAll('a.btn, button.btn, .nav-links a');
 fastClickElements.forEach(element => {
 element.style.touchAction = 'manipulation';
 });
 console.log('Simplified FastClick initialized');
}
function optimizeImagesForMobile() {
 if ('loading' in HTMLImageElement.prototype) {
 utils.getAll('img').forEach(img => {
 img.loading = 'lazy';
 });
 } else {
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
function initTouchInteractions() {
 initRippleEffect();
}
function initRippleEffect() {
 document.addEventListener('click', e => {
 const target = e.target.closest('.ripple');
 if (!target) return;
 const ripple = document.createElement('span');
 ripple.classList.add('ripple-effect');
 const rect = target.getBoundingClientRect();
 const rippleX = e.clientX - rect.left;
 const rippleY = e.clientY - rect.top;
 const size = Math.max(rect.width, rect.height) * 2;
 ripple.style.cssText = `
 width: ${size}px;
 height: ${size}px;
 left: ${rippleX - size/2}px;
 top: ${rippleY - size/2}px;
 `;
 target.appendChild(ripple);
 setTimeout(() => {
 if (ripple.parentNode === target) {
 target.removeChild(ripple);
 }
 }, 600);
 });
}
function initTouchGestures() {
 let lastTap = 0;
 document.addEventListener('touchend', e => {
 const currentTime = new Date().getTime();
 const tapLength = currentTime - lastTap;
 if (tapLength < 300 && tapLength > 0) {
 if (['BODY', 'HTML'].includes(e.target.tagName)) {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 utils.showToast('Återgår till toppen', 'info');
 }
 }
 lastTap = currentTime;
 });
}
function addSkipLink() {
 const skipLink = utils.get('.skip-link');
 if (!skipLink) return;
 utils.on(skipLink, 'click', e => {
 e.preventDefault();
 const target = document.querySelector(skipLink.getAttribute('href'));
 if (target) {
 target.tabIndex = -1;
 target.focus();
 utils.smoothScrollTo(target, 600);
 target.classList.add('skip-target');
 setTimeout(() => target.classList.remove('skip-target'), 2000);
 }
 });
}
function initSectionTracking() {
 const sections = utils.getAll('section[id]');
 const navLinks = utils.getAll('.nav-links a');
 const mobileNavLinks = utils.getAll('.mobile-bottom-nav a');
 if (!sections.length) return;
 const sectionVisibility = {};
 sections.forEach(section => {
 sectionVisibility[section.id] = 0;
 });
 const updateNavLinks = (sectionId) => {
 const updateLinkSet = (links) => {
 links.forEach(link => {
 const href = link.getAttribute('href')?.substring(1);
 if (href === sectionId) {
 link.classList.add('active');
 } else {
 link.classList.remove('active');
 }
 });
 };
 updateLinkSet(navLinks);
 if (mobileNavLinks.length) {
 updateLinkSet(mobileNavLinks);
 }
 };
 const observerOptions = {
 root: null, 
 rootMargin: '-80px 0px -20% 0px', 
 threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
 };
 const sectionObserver = new IntersectionObserver((entries) => {
 entries.forEach(entry => {
 const { id } = entry.target;
 sectionVisibility[id] = entry.intersectionRatio;
 });
 if (window.scrollY < 100) {
 updateNavLinks('home');
 return;
 }
 if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
 updateNavLinks(sections[sections.length - 1].id);
 return;
 }
 let maxVisibility = 0;
 let activeSectionId = null;
 for (const [id, visibility] of Object.entries(sectionVisibility)) {
 if (visibility > maxVisibility) {
 maxVisibility = visibility;
 activeSectionId = id;
 }
 }
 if (activeSectionId) {
 updateNavLinks(activeSectionId);
 }
 }, observerOptions);
 sections.forEach(section => {
 sectionObserver.observe(section);
 });
 setTimeout(() => {
 if (window.scrollY < 100) {
 updateNavLinks('home');
 } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
 updateNavLinks(sections[sections.length - 1].id);
 }
 }, 100);
 navLinks.forEach(link => {
 link.addEventListener('click', (e) => {
 const targetId = link.getAttribute('href')?.substring(1);
 if (targetId) {
 updateNavLinks(targetId);
 }
 });
 });
 if (mobileNavLinks.length) {
 mobileNavLinks.forEach(link => {
 link.addEventListener('click', (e) => {
 const targetId = link.getAttribute('href')?.substring(1);
 if (targetId) {
 updateNavLinks(targetId);
 }
 });
 });
 }
}
function fixHeroButtonNavigation() {
 const heroButtons = utils.getAll('.hero-buttons .btn');
 heroButtons.forEach(button => {
 button.addEventListener('click', (e) => {
 const href = button.getAttribute('href');
 if (href && href.startsWith('#')) {
 e.preventDefault();
 const targetSection = utils.get(href);
 if (targetSection) {
 utils.smoothScrollTo(targetSection, 800);
 setTimeout(() => {
 const sectionId = href.substring(1);
 utils.getAll('.nav-links a').forEach(link => {
 const linkHref = link.getAttribute('href')?.substring(1);
 link.classList.toggle('active', linkHref === sectionId);
 });
 }, 800);
 }
 }
 });
 });
}
function initServiceModals() {
 const servicesGrid = utils.get('.services-grid');
 const services = utils.getAll('.service');
 if (!services.length && !servicesGrid) return;
 let modalContainer = utils.get('.modal-container');
 if (!modalContainer) {
 modalContainer = document.createElement('div');
 modalContainer.className = 'modal-container';
 document.body.appendChild(modalContainer);
 }
 let touchStartY = 0;
 let touchStartX = 0;
 let touchStartTime = 0;
 let touchStartTarget = null;
 let isDragging = false;
 if (servicesGrid) {
 servicesGrid.addEventListener('touchstart', (e) => {
 const service = e.target.closest('.service');
 if (!service) return; 
 touchStartY = e.touches[0].clientY;
 touchStartX = e.touches[0].clientX;
 touchStartTime = Date.now();
 touchStartTarget = service;
 isDragging = false;
 }, { passive: true });
 servicesGrid.addEventListener('touchmove', (e) => {
 if (!touchStartTarget) return; 
 if (!isDragging) {
 const touchMoveY = e.touches[0].clientY;
 const touchMoveX = e.touches[0].clientX;
 const deltaY = Math.abs(touchMoveY - touchStartY);
 const deltaX = Math.abs(touchMoveX - touchStartX);
 if (deltaY > 10 || deltaX > 10) {
 isDragging = true;
 }
 }
 }, { passive: true });
 servicesGrid.addEventListener('touchend', (e) => {
 if (!touchStartTarget) return;
 const touchEndTime = Date.now();
 const touchDuration = touchEndTime - touchStartTime;
 const touchEndY = e.changedTouches[0].clientY;
 const touchEndX = e.changedTouches[0].clientX;
 const deltaY = Math.abs(touchEndY - touchStartY);
 const deltaX = Math.abs(touchEndX - touchStartX);
 if (!isDragging && deltaY < 20 && deltaX < 20 && touchDuration < 300) {
 const service = touchStartTarget;
 const title = service.querySelector('h3').textContent;
 const icon = service.querySelector('i').className;
 let serviceType = 'primary';
 const serviceIndex = Array.from(services).indexOf(service);
 if (serviceIndex % 2 !== 0) {
 serviceType = 'secondary';
 }
 showServiceModal(title, icon, getServiceContent(title), serviceType);
 }
 touchStartTarget = null;
 }, { passive: true });
 servicesGrid.addEventListener('click', (e) => {
 const service = e.target.closest('.service');
 if (!service || isMobile) return; 
 const title = service.querySelector('h3').textContent;
 const icon = service.querySelector('i').className;
 let serviceType = 'primary';
 const serviceIndex = Array.from(services).indexOf(service);
 if (serviceIndex % 2 !== 0) {
 serviceType = 'secondary';
 }
 showServiceModal(title, icon, getServiceContent(title), serviceType);
 });
 }
 const footerServiceLinks = utils.getAll('.footer-col:nth-child(2) a');
 if (footerServiceLinks && footerServiceLinks.length) {
 footerServiceLinks.forEach((link, index) => {
 const newLink = link.cloneNode(true);
 link.parentNode.replaceChild(newLink, link);
 newLink.addEventListener('click', function(e) {
 e.preventDefault();
 e.stopPropagation(); 
 const serviceTitle = this.textContent.trim();
 const serviceType = index % 2 === 0 ? 'primary' : 'secondary';
 const iconClass = getIconClassForService(serviceTitle);
 showServiceModal(serviceTitle, iconClass, getServiceContent(serviceTitle), serviceType);
 return false;
 });
 });
 }
 function getIconClassForService(title) {
 const iconMap = {
 'Projektledning': 'fas fa-diagram-project',
 'Processutveckling': 'fas fa-cogs',
 'Affärsutveckling': 'fas fa-chart-line',
 'Strategisk rådgivning': 'fas fa-lightbulb',
 'Teknisk support': 'fas fa-headset',
 'Digitalisering': 'fas fa-digital-tachograph'
 };
 return iconMap[title] || 'fas fa-briefcase';
 }
 function showServiceModal(title, iconClass, content, type = 'primary') {
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
 modalContainer.innerHTML = modalHTML;
 const modal = modalContainer.querySelector('.modal');
 const closeBtn = modal.querySelector('.modal-close');
 const contactBtn = modal.querySelector('.modal-footer .btn');
 closeBtn.addEventListener('click', closeModal);
 contactBtn.addEventListener('click', (e) => {
 e.preventDefault();
 const contactSection = utils.get('#contact');
 closeModal();
 setTimeout(() => {
 if (contactSection) {
 utils.smoothScrollTo(contactSection, 800);
 }
 }, 400);
 });
 modal.addEventListener('click', (e) => {
 if (e.target === modal) closeModal();
 });
 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape') closeModal();
 });
 setTimeout(() => {
 modal.classList.add('active');
 document.body.style.overflow = 'hidden'; 
 }, 10);
 function closeModal() {
 modal.classList.remove('active');
 document.body.style.overflow = ''; 
 setTimeout(() => {
 modalContainer.innerHTML = '';
 }, 300);
 document.removeEventListener('keydown', closeModal);
 }
 }
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
 return serviceContents[serviceTitle] || `
 <p>Detaljerad information om denna tjänst kommer snart. Kontakta oss gärna för mer information.</p>
 `;
 }
}
function initLogoAnimation() {
 const logo = utils.get('.logo a');
 if (!logo) return;
 const logoText = logo.textContent;
 logo.setAttribute('data-text', logoText);
 const particlesDiv = document.createElement('div');
 particlesDiv.className = 'particles';
 for (let i = 0; i < 5; i++) {
 const particle = document.createElement('div');
 particle.className = 'particle';
 particlesDiv.appendChild(particle);
 }
 logo.appendChild(particlesDiv);
 logo.addEventListener('mouseenter', () => {
 const logoRect = logo.getBoundingClientRect();
 const particles = logo.querySelectorAll('.particle');
 particles.forEach((particle, index) => {
 const angle = (index / particles.length) * Math.PI * 2;
 const radius = 15 + Math.random() * 15;
 const x = (logoRect.width / 2) + Math.cos(angle) * radius;
 const y = (logoRect.height / 2) + Math.sin(angle) * radius;
 particle.style.left = `${x}px`;
 particle.style.top = `${y}px`;
 });
 });
}
(function() {
 window.onbeforeunload = function() {
 if (!window.location.hash) {
 window.scrollTo(0, 0);
 }
 };
 window.addEventListener('load', function() {
 if (!window.location.hash) {
 setTimeout(function() {
 window.scrollTo(0, 0);
 }, 0);
 } else {
 const targetElement = document.querySelector(window.location.hash);
 if (targetElement) {
 setTimeout(function() {
 if (typeof utils !== 'undefined' && utils.smoothScrollTo) {
 utils.smoothScrollTo(targetElement);
 } else {
 targetElement.scrollIntoView({ behavior: 'smooth' });
 }
 }, 100);
 }
 }
 });
 if ('scrollRestoration' in history) {
 history.scrollRestoration = 'manual';
 }
})();