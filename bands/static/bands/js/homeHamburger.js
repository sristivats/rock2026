// Get elements
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.hamburger-menu');
const overlay = document.querySelector('.menu-overlay');
const closeBtn = document.querySelector('.close-btn');
const menuLinks = document.querySelectorAll('.menu-nav a');

// Open menu
hamburger.addEventListener('click', () => {
  menu.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('menu-open');
});

// Close menu function
function closeMenu() {
  menu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('menu-open');
}

// Close menu when clicking close button
closeBtn.addEventListener('click', closeMenu);

// Close menu when clicking overlay
overlay.addEventListener('click', closeMenu);

// Close menu when clicking a menu link
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});