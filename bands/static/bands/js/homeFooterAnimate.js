gsap.registerPlugin(ScrollTrigger);

// Use matchMedia for responsive animations
// This ensures the animation adapts if the user resizes the window or uses a mobile device
let mm = gsap.matchMedia();

mm.add(
  {
    // Define conditions
    isDesktop: "(min-width: 800px)",
    isMobile: "(max-width: 799px)",
  },
  (context) => {
    // Extract conditions
    let { isDesktop, isMobile } = context.conditions;

    // --- Configuration based on device ---
    const settings = {
      // Mobile needs smaller movements (y) and less aggressive scaling to remain visible.
      headingY: isDesktop ? 100 : 50,
      imageY: isDesktop ? 200 : 100,
      imageScale: isDesktop ? 0.5 : 0.85, // Don't shrink too much on mobile (0.85 vs 0.5)
      scrubTime: isDesktop ? 2 : 1, // Snappier response on mobile touch (1s vs 2s)
    };

    // --- 1. Set Initial States ---

    // Headings: Start lower, smaller, and invisible
    gsap.set(".contact h2", {
      y: settings.headingY,
      scale: 0.8,
      opacity: 0,
    });

    // Background Image: Starts lower and smaller
    gsap.set(".contact-img2", {
      y: settings.imageY,
      scale: settings.imageScale,
      opacity: 0,
    });

    // Main Contact Card: Starts lower and smaller
    gsap.set(".contact-div", {
      y: settings.imageY,
      scale: settings.imageScale,
      opacity: 0,
    });

    // Footer: Starts below, slides up
    gsap.set(".footer", {
      y: settings.imageY, // Sync with images for consistency
      opacity: 0,
    });

    // --- 2. Create Timeline ---
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact",
        start: "top 80%",
        end: "bottom bottom",
        scrub: settings.scrubTime,
      },
    });

    // --- 3. Animation Sequence ---
    contactTimeline
      // 1. Headings Pop Up (Start at 0% of timeline)
      .to(
        ".contact h2",
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)", // The "jumpy" effect
        },
        0
      )

      // 2. Background Image Pops Up (Start at 40% of timeline)
      .to(
        ".contact-img2",
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2)", // A bit more bounce
        },
        0.4
      )

      // 3. Contact Card Pops Up (Start at 45% of timeline)
      .to(
        ".contact-div",
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2)", // Matching bounce
        },
        0.45
      )

      // 4. Footer Slides Up (Start at 85% of timeline)
      .to(
        ".footer",
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        0.85
      );
  }
);
