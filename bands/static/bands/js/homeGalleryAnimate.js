// gallery-animations.js
// Requires: GSAP + ScrollTrigger loaded before this script
gsap.registerPlugin(ScrollTrigger);

// Ensure gallery has a positioned parent so absolutely-positioned imgs behave
const galleryEl = document.querySelector(".gallery");
if (galleryEl) {
  const galleryStyle = getComputedStyle(galleryEl).position;
  if (galleryStyle === "static") {
    galleryEl.style.position = "relative";
  }
}

// helper: return only images that are rendered (display != 'none')
function getVisibleGalleryImages() {
  return Array.from(document.querySelectorAll(".gallery img")).filter(img => {
    return getComputedStyle(img).display !== "none";
  });
}

// helper to safely get element by id & check visibility
function getIfVisible(id) {
  const el = document.getElementById(id);
  return el && getComputedStyle(el).display !== "none" ? el : null;
}

// Hover effects (only on devices that support hover)
function attachHoverEffects() {
  // return early on touch devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return [];

  const handlers = [];
  getVisibleGalleryImages().forEach(img => {
    const enter = () => {
      gsap.to(img, { scale: 1.05, zIndex: 10, duration: 0.28, ease: "power2.out" });
    };
    const leave = () => {
      gsap.to(img, { scale: 1, zIndex: 1, duration: 0.28, ease: "power2.out" });
    };
    img.addEventListener("mouseenter", enter);
    img.addEventListener("mouseleave", leave);
    handlers.push({ img, enter, leave });
  });
  return handlers;
}
function detachHoverEffects(handlers) {
  if (!handlers || !handlers.length) return;
  handlers.forEach(h => {
    h.img.removeEventListener("mouseenter", h.enter);
    h.img.removeEventListener("mouseleave", h.leave);
  });
}

// Use GSAP matchMedia to maintain separate setups for desktop / mobile
const mm = gsap.matchMedia();

// Add desktop (>= 431px)
mm.add("(min-width: 431px)", () => {
  // distances / offsets for desktop (keeps your original feeling)
  const UP = -150;
  const DOWN = 150;
  const LEFT = -150;

  // initial states for visible images
  const visibleImgs = getVisibleGalleryImages();
  gsap.set(visibleImgs, { autoAlpha: 0, scale: 0.8, clearProps: "transform" });

  // Build timeline (keeps your exact sequence + timings)
  const galleryTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".gallery",
      start: "top 20%",
      end: "bottom 0%",
      toggleActions: "play none none reverse",
      scrub: false,
    }
  });

  // Step 1 (first wave)
  const img4 = getIfVisible("img4"), img5 = getIfVisible("img5"),
        img2 = getIfVisible("img2"), img3 = getIfVisible("img3");

  if (img4) galleryTL.fromTo(img4,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 0.1);

  if (img5) galleryTL.fromTo(img5,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 0.15);

  if (img2) galleryTL.fromTo(img2,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 0.2);

  if (img3) galleryTL.fromTo(img3,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 0.25);

  // Step 2 (second wave)
  const img6 = getIfVisible("img6"), img7 = getIfVisible("img7"),
        img1 = getIfVisible("img1"), img9 = getIfVisible("img9"),
        img8 = getIfVisible("img8");

  if (img6) galleryTL.fromTo(img6,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 1.5);

  if (img7) galleryTL.fromTo(img7,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 1.55);

  if (img1) galleryTL.fromTo(img1,
    { x: LEFT, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { x: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 1.6);

  if (img9) galleryTL.fromTo(img9,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 1.65);

  if (img8) galleryTL.fromTo(img8,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" }, 1.7);

  // attach hover handlers (desktop only)
  const hoverHandlers = attachHoverEffects();

  // cleanup when this media query is revoked
  return () => {
    galleryTL.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
    detachHoverEffects(hoverHandlers);
    gsap.set(visibleImgs, { clearProps: "all" });
  };
});

// Add mobile (<= 430px)
mm.add("(max-width: 430px)", () => {
  // reduced distances & slightly compressed timing for mobile
  const UP = -100;
  const DOWN = 100;
  const LEFT = -100;

  const visibleImgs = getVisibleGalleryImages();
  gsap.set(visibleImgs, { autoAlpha: 0, scale: 0.8, clearProps: "transform" });

  const galleryTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".gallery",
      // start a bit later on smaller screens so heading placement is better
      start: "top 50%",
      end: "bottom 0%",
      toggleActions: "play none none reverse",
      scrub: false,
    }
  });

  // same sequence but tighter offsets
  const img4 = getIfVisible("img4"), img5 = getIfVisible("img5"),
        img2 = getIfVisible("img2"), img3 = getIfVisible("img3");

  if (img4) galleryTL.fromTo(img4,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.05);

  if (img5) galleryTL.fromTo(img5,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.1);

  if (img2) galleryTL.fromTo(img2,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.15);

  if (img3) galleryTL.fromTo(img3,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.2);

  // Second wave - slightly earlier than desktop
  const img6 = getIfVisible("img6"), img7 = getIfVisible("img7"),
        img1 = getIfVisible("img1"), img9 = getIfVisible("img9"),
        img8 = getIfVisible("img8");

  if (img6) galleryTL.fromTo(img6,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.9);

  if (img7) galleryTL.fromTo(img7,
    { y: UP, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 0.95);

  if (img1) galleryTL.fromTo(img1,
    { x: LEFT, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { x: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 1.0);

  if (img9) galleryTL.fromTo(img9,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: 5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 1.05);

  // img8 is display:none on mobile in your CSS - getIfVisible will skip it
  if (img8) galleryTL.fromTo(img8,
    { y: DOWN, autoAlpha: 0, scale: 0.8, rotation: -5 },
    { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 1.1);

  // Mobile: skip hover (touch) so don't attach hover handlers
  const hoverHandlers = []; // no hover

  return () => {
    galleryTL.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
    detachHoverEffects(hoverHandlers);
    gsap.set(visibleImgs, { clearProps: "all" });
  };
});

// Optional: a global cleanup on page unload
window.addEventListener("beforeunload", () => {
  mm.revert(); // kill all matchMedia contexts/ScrollTriggers
});
