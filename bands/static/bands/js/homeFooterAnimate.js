gsap.registerPlugin(ScrollTrigger);

// Set initial states (hidden/off-screen)
gsap.set(".contact h2", {
  y: -200,
  opacity: 0,
});

gsap.set(".contact-img2", {
  y: -300,
  opacity: 0,
});

gsap.set(".contact-div", {
  y: -300,
  opacity: 0,
});

gsap.set(".footer", {
  y: 200,
  opacity: 0,
});

// Create timeline for the contact section
const contactTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".contact",
    start: "top 80%",
    end: "bottom bottom",
    // toggleActions: "play reverse play reverse",
    scrub: 2,
    // markers: true, // Uncomment for debugging
  },
});

// Animation sequence based on scroll progress
contactTimeline
  // 1. Heading drops at 12% scroll progress
  .to(
    ".contact h2",
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(0)",
    },
    0
  ) // Start at 12% of timeline

  // 2. Background image (contact-img2) drops at 40%
  .to(
    ".contact-img2",
    {
      y: 0,
      opacity: 1,
      duration: 0.25,
      ease: "back.out(1.5)",
    },
    0.4
  ) // Start at 40% of timeline

  // 3. Front image (contact-div) drops slightly after
  .to(
    ".contact-div",
    {
      y: 0,
      opacity: 1,
      duration: 0.25,
      ease: "back.out(1.5)",
    },
    0.45
  ) // Start at 45% of timeline

  // 4. Footer pops up at 85%
  .to(
    ".footer",
    {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    },
    0.85
  ); // Start at 85% of timeline
