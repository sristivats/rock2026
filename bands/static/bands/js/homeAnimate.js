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

    // === Spin tween ===
    const spin = gsap.to(player, {
      rotation: "+=360",
      duration: 4,
      ease: "none",
      repeat: -1,
      paused: true,
      transformOrigin: "50% 50%",
    });
    spin.timeScale(0);

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
      } catch (err) {}
    }
    function safePauseAudio() {
      if (!audio) return;
      try {
        audio.pause();
      } catch (err) {}
    }

    let spinStartTween = null;
    function startSpinAndAudio() {
      if (spin.paused()) spin.play();
      if (spinStartTween) spinStartTween.kill();
      spinStartTween = gsap.to(spin, {
        timeScale: 1,
        duration: 0.35,
        ease: "power1.out",
        onStart: safePlayAudio,
      });
    }

    let spinStopTween = null;
    function stopSpinAndAudio() {
      if (spinStopTween) spinStopTween.kill();
      spinStopTween = gsap.to(spin, {
        timeScale: 0,
        duration: 0.45,
        ease: "power1.out",
        onComplete: () => {
          spin.pause();
          safePauseAudio();
        },
      });
    }

    let checking = false;
    function startCheckingLoop() {
      if (checking) return;
      checking = true;
      (function loop() {
        if (!checking) return;
        if (isOverlapping(tip, playArea)) startSpinAndAudio();
        else stopSpinAndAudio();
        requestAnimationFrame(loop);
      })();
    }
    function stopCheckingLoop() {
      checking = false;
    }

    const draggable = Draggable.create(tonearm, {
      type: "rotation",
      inertia: false,
      onPress() {
        gsap.to(this.target, { scale: 1.02, duration: 0.12 });
        startCheckingLoop();
      },
      onDrag() {
        let r = this.rotation;
        const clamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, r);
        if (clamped !== r) {
          gsap.set(this.target, { rotation: clamped });
          this.update();
          r = clamped;
        }
        if (isOverlapping(tip, playArea)) startSpinAndAudio();
        else stopSpinAndAudio();
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
        if (isOverlapping(tip, playArea)) startSpinAndAudio();
        else stopSpinAndAudio();
        stopCheckingLoop();
      },
    })[0];

    window.addEventListener("resize", () => {
      if (isOverlapping(tip, playArea)) startSpinAndAudio();
      else stopSpinAndAudio();
    });

    spin.pause();
    spin.timeScale(0);
    if (audio) {
      audio.loop = true;
    }
  }
});
