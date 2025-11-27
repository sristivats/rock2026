document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Draggable);

  // === Set up responsive breakpoints ===
  const mm = gsap.matchMedia();

  // --- Base setup (shared for all screen sizes) ---
  mm.add("(min-width: 1025px)", () => {
    setupVinyl({
      MIN_ANGLE: -20,
      MAX_ANGLE: -5,
      label: "Desktop >1024px",
    });
  });

  // --- Medium devices (Tablets / iPads) ---
  mm.add("(max-width: 1024px)", () => {
    setupVinyl({
      MIN_ANGLE: -25,
      MAX_ANGLE: -10,
      label: "Tablet ≤1024px",
    });
  });

  // --- Small devices (Phones) ---
  mm.add("(max-width: 430px)", () => {
    setupVinyl({
      MIN_ANGLE: -25,
      MAX_ANGLE: -5,
      label: "Mobile ≤430px",
    });
  });

  // === Shared vinyl logic ===
  function setupVinyl({ MIN_ANGLE, MAX_ANGLE, label }) {
    console.log(`Running setup for ${label}`);

    const tonearm = document.getElementById("tonearm");
    const tip = document.getElementById("tip");
    const playArea = document.querySelector(".play-area");
    const player = document.querySelector(".vinyl-player");
    const audio = document.getElementById("vinylAudio");

    // === Spin tween - always running ===
    const spin = gsap.to(player, {
      rotation: "+=360",
      duration: 4,
      ease: "none",
      repeat: -1,
      paused: false, // Start spinning immediately
      transformOrigin: "50% 50%",
    });
    spin.timeScale(1); // Always spinning at full speed

    // === Helper ===
    function isOverlapping(a, b) {
      const A = a.getBoundingClientRect();
      const B = b.getBoundingClientRect();
      return !(
        A.right < B.left ||
        A.left > B.right ||
        A.bottom < B.top ||
        A.top > B.bottom
      );
    }

    async function safePlayAudio() {
      if (!audio) return;
      try {
        await audio.play();
      } catch (err) {
        console.log("Audio play failed:", err);
      }
    }

    function safePauseAudio() {
      if (!audio) return;
      try {
        audio.pause();
      } catch (err) {}
    }

    // Check initial state and play audio if tonearm is already on play area
    function checkInitialState() {
      if (isOverlapping(tip, playArea)) {
        safePlayAudio();
      }
    }

    const draggable = Draggable.create(tonearm, {
      type: "rotation",
      inertia: false,
      onPress() {
        gsap.to(this.target, { scale: 1.02, duration: 0.12 });
        // Stop audio immediately when picking up the tonearm
        safePauseAudio();
      },
      onDrag() {
        let r = this.rotation;
        const clamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, r);
        if (clamped !== r) {
          gsap.set(this.target, { rotation: clamped });
          this.update();
          r = clamped;
        }
        // Don't play audio while dragging
      },
      onRelease() {
        gsap.to(this.target, { scale: 1, duration: 0.12 });
        const finalClamped = gsap.utils.clamp(
          MIN_ANGLE,
          MAX_ANGLE,
          this.rotation
        );
        gsap.set(this.target, { rotation: finalClamped });
        this.update();

        // Only play audio if dropped on the play-area
        if (isOverlapping(tip, playArea)) {
          safePlayAudio();
        } else {
          safePauseAudio();
        }
      },
    })[0];

    window.addEventListener("resize", () => {
      if (isOverlapping(tip, playArea)) {
        safePlayAudio();
      } else {
        safePauseAudio();
      }
    });

    // Set up audio
    if (audio) {
      audio.loop = true;
    }

    // Check initial state after a brief delay to ensure layout is ready
    setTimeout(checkInitialState, 100);
  }
});
