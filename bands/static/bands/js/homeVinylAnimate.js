gsap.registerPlugin(ScrollTrigger);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  
  // Create the scroll animation
  const vinylTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.heading',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2, // Smooth scrubbing effect (higher = smoother but slower)
      pin: false,
      anticipatePin: 1,
      // markers: true, // Uncomment for debugging
    }
  });

  // Animate the entire vinyl container
  vinylTimeline.to('.vinyl', {
    scale: 0.4,
    y: -200,
    opacity: 0,
    ease: 'power2.inOut',
    duration: 1
  });

  // Add staggered animations for individual vinyl elements for more depth
  vinylTimeline.to('.vinyl-board', {
    y: -150,
    scale: 0.5,
    opacity: 0,
    ease: 'power2.inOut',
  }, '<'); // '<' means start at the same time as previous animation

  vinylTimeline.to('.vinyl-player', {
    y: -180,
    scale: 0.45,
    opacity: 0,
    ease: 'power2.inOut',
  }, '<0.05'); // Start slightly after

  vinylTimeline.to('.vinyl-disk', {
    y: -200,
    scale: 0.3,
    rotation: -180,
    opacity: 0,
    ease: 'power2.inOut',
  }, '<0.05');

  vinylTimeline.to('.vinyl-tonearm', {
    y: -190,
    scale: 0.35,
    rotation: -35,
    opacity: 0,
    ease: 'power2.inOut',
  }, '<-0.05');

  // Optional: Fade out the heading text as well
  vinylTimeline.to('.main1 h1', {
    y: -100,
    opacity: 0.3,
    ease: 'power2.inOut',
  }, '<0.1');

  // Performance optimization: Reduce calculations during scroll
  ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: 150
  });

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  // Optional: Add smooth scroll behavior
  gsap.to(window, {
    scrollTo: { autoKill: false },
    ease: 'power2.inOut'
  });
});

// Optional: Add resize handler for responsive behavior
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});