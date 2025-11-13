// Responsive GSAP + ScrollTrigger setup
gsap.registerPlugin(ScrollTrigger);

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const vinylEl = document.querySelector(".vinyl");
  if (!vinylEl) return; // guard

  // Create a matchMedia object for breakpoint-specific timelines
  const mm = gsap.matchMedia();

  // Define breakpoints: mobile (<430), tablet (430-1023), desktop (>=1024)
  mm.add({
    // Mobile small screens
    "(max-width: 429px)": function () {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".heading", // keep your trigger; adjust if needed
          start: "top top",
          end: "bottom 20%",
          scrub: 1.2,
          pin: false,
          anticipatePin: 1,
          // markers: true
        },
      });

      tl.to(".vinyl", {
        scale: 0.55,
        y: -120,
        opacity: 0,
        ease: "power2.inOut",
        duration: 1,
      });
      tl.to(
        ".vinyl-board",
        { y: -90, scale: 0.6, opacity: 0, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        ".vinyl-player",
        { y: -100, scale: 0.6, opacity: 0, ease: "power2.inOut" },
        "<0.05"
      );
      tl.to(
        ".vinyl-disk",
        {
          y: -120,
          scale: 0.5,
          rotation: -140,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".vinyl-tonearm",
        {
          y: -110,
          scale: 0.5,
          rotation: -25,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".main1 h1",
        { y: -80, opacity: 0.3, ease: "power2.inOut" },
        "<0.1"
      );

      // return cleanup function when media query no longer matches
      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },

    // Tablet / medium screens
    "(min-width: 430px) and (max-width: 1023px)": function () {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".heading",
          start: "bottom 75%",
          end: "bottom 20%",
          scrub: 1.2,
          pin: false,
          anticipatePin: 1,
          // markers: true
        },
      });

      tl.to(".vinyl", {
        scale: 0.45,
        y: -160,
        opacity: 0,
        ease: "power2.inOut",
        duration: 1,
      });
      tl.to(
        ".vinyl-board",
        { y: -120, scale: 0.55, opacity: 0, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        ".vinyl-player",
        { y: -140, scale: 0.5, opacity: 0, ease: "power2.inOut" },
        "<0.05"
      );
      tl.to(
        ".vinyl-disk",
        {
          y: -160,
          scale: 0.35,
          rotation: -160,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".vinyl-tonearm",
        {
          y: -150,
          scale: 0.4,
          rotation: -30,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".main1 h1",
        { y: -90, opacity: 0.3, ease: "power2.inOut" },
        "<0.1"
      );

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },

    // Desktop large screens
    "(min-width: 1024px)": function () {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".heading",
          start: "bottom 75%",
          end: "bottom 20%",
          scrub: 1.2,
          pin: false,
          anticipatePin: 1,
          // markers: true
        },
      });

      tl.to(".vinyl", {
        scale: 0.4,
        y: -200,
        opacity: 0,
        ease: "power2.inOut",
        duration: 1,
      });
      tl.to(
        ".vinyl-board",
        { y: -150, scale: 0.5, opacity: 0, ease: "power2.inOut" },
        "<"
      );
      tl.to(
        ".vinyl-player",
        { y: -180, scale: 0.45, opacity: 0, ease: "power2.inOut" },
        "<0.05"
      );
      tl.to(
        ".vinyl-disk",
        {
          y: -200,
          scale: 0.3,
          rotation: -180,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".vinyl-tonearm",
        {
          y: -190,
          scale: 0.35,
          rotation: -35,
          opacity: 0,
          ease: "power2.inOut",
        },
        "<0.05"
      );
      tl.to(
        ".main1 h1",
        { y: -100, opacity: 0.3, ease: "power2.inOut" },
        "<0.1"
      );

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },
  });

  // Refresh ScrollTrigger after all images/fonts load to ensure layout is correct
  window.addEventListener("load", () => {
    ScrollTrigger.refresh(true);
  });

  // Also refresh on simple resize (matchMedia handles re-creating match-specific timelines)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  });
});
