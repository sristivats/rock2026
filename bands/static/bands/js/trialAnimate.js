// gsap.to(".vinyl-tonearm", {
//   rotation: 360,
//   duration: 5, // seconds for one full rotation
//   ease: "none", // keeps constant speed (no acceleration)
//   repeat: -1, // infinite loop
//   transformOrigin: "13.2% 82%", // ensures rotation from center
// });

//-------------------------------------------------------

// document.addEventListener("DOMContentLoaded", () => {
//   gsap.registerPlugin(Draggable);

//   const MIN_ANGLE = -20;   // set your left limit
//   const MAX_ANGLE = -5;    // set your right limit

//   Draggable.create(".vinyl-tonearm", {
//     type: "rotation",
//     inertia: false,

//     onPress() {
//       gsap.to(this.target, { scale: 1.02, duration: 0.15 });
//     },

//     onRelease() {
//       gsap.to(this.target, { scale: 1, duration: 0.15 });

//       // clamp final rotation after release
//       const clamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, this.rotation);
//       gsap.set(this.target, { rotation: clamped });
//       this.update(); // update Draggable's internal rotation
//     },

//     onDrag() {
//       let r = this.rotation;

//       // clamp during drag
//       if (r < MIN_ANGLE || r > MAX_ANGLE) {
//         r = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, r);
//         gsap.set(this.target, { rotation: r });
//         this.update();
//       }

//       console.log("Angle:", r);
//     }
//   });
// });

// -----------------------------

// document.addEventListener("DOMContentLoaded", () => {
//   gsap.registerPlugin(Draggable);

//   // TUNE these angles to match the physical arc of your tonearm
//   const MIN_ANGLE = -20;   // left-most limit (degrees)
//   const MAX_ANGLE = -5;    // right-most limit (degrees)

//   const tonearm = document.getElementById("tonearm");
//   const tip = document.getElementById("tip");
//   const playArea = document.querySelector(".play-area");
//   const player = document.querySelector(".vinyl-player"); // will rotate

//   // spinning tween for the player (paused initially)
//   const spin = gsap.to(player, {
//     rotation: "+=360",
//     duration: 2,          // one full revolution in 2s -> tune for RPM
//     ease: "none",
//     repeat: -1,
//     paused: true,
//     transformOrigin: "50% 50%"
//   });

//   // helper: bounding-box overlap
//   function isOverlapping(a, b) {
//     const A = a.getBoundingClientRect();
//     const B = b.getBoundingClientRect();
//     return !(A.right < B.left || A.left > B.right || A.bottom < B.top || A.top > B.bottom);
//   }

//   // smooth start/stop using timeScale ramping
//   function startSpin() {
//     // if it was paused, make sure to play then accelerate
//     if (spin.paused()) spin.play();
//     gsap.to(spin, { timeScale: 1, duration: 0.35, ease: "power1.out" });
//   }
//   function stopSpin() {
//     // ramp down then pause to avoid an abrupt jump
//     gsap.to(spin, {
//       timeScale: 0,
//       duration: 0.45,
//       ease: "power1.out",
//       onComplete: () => {
//         // keep it visually at the stopped angle and then pause timeline
//         spin.pause();
//       }
//     });
//   }

//   // continuous overlap check while interacting
//   let checking = false;
//   function startCheckingLoop() {
//     if (checking) return;
//     checking = true;
//     (function loop() {
//       if (!checking) return;
//       if (isOverlapping(tip, playArea)) startSpin();
//       else stopSpin();
//       requestAnimationFrame(loop);
//     })();
//   }
//   function stopCheckingLoop() {
//     checking = false;
//   }

//   // Create Draggable with rotation and clamping
//   const draggable = Draggable.create(tonearm, {
//     type: "rotation",
//     inertia: false,
//     onPress() {
//       gsap.to(this.target, { scale: 1.02, duration: 0.12 });
//       startCheckingLoop();
//     },
//     onDrag() {
//       // clamp rotation in real-time so it never visually crosses the limit
//       let r = this.rotation;
//       const clamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, r);
//       if (clamped !== r) {
//         gsap.set(this.target, { rotation: clamped });
//         this.update(); // important to sync Draggable state
//         r = clamped;
//       }

//       // quick overlap test on every drag frame
//       if (isOverlapping(tip, playArea)) startSpin();
//       else stopSpin();
//     },
//     onRelease() {
//       gsap.to(this.target, { scale: 1, duration: 0.12 });

//       // ensure final rotation is clamped
//       const finalClamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, this.rotation);
//       gsap.set(this.target, { rotation: finalClamped });
//       this.update();

//       // final overlap check
//       if (isOverlapping(tip, playArea)) startSpin();
//       else stopSpin();

//       stopCheckingLoop();
//     }
//   })[0];

//   // Also re-evaluate when window resized (positions change)
//   window.addEventListener("resize", () => {
//     if (isOverlapping(tip, playArea)) startSpin();
//     else stopSpin();
//   });

//   // initial state
//   stopSpin();
// });

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Draggable);

  // Rotation limits — tune for your art
  const MIN_ANGLE = -20;
  const MAX_ANGLE = -5;

  const tonearm = document.getElementById("tonearm");
  const tip = document.getElementById("tip");
  const playArea = document.querySelector(".play-area");
  const player = document.querySelector(".vinyl-player"); // element that will spin
  const audio = document.getElementById("vinylAudio");

  // === Spin tween (paused initially). We use timeScale ramping for smooth start/stop ===
  const spin = gsap.to(player, {
    rotation: "+=360",
    duration: 5,      // 1 revolution per 2s — change to adjust RPM
    ease: "none",
    repeat: -1,
    paused: true,
    transformOrigin: "50% 50%",
    timeScale: 0      // start "stopped"
  });

  // Helper: bounding-box overlap
  function isOverlapping(a, b) {
    const A = a.getBoundingClientRect();
    const B = b.getBoundingClientRect();
    return !(A.right < B.left || A.left > B.right || A.bottom < B.top || A.top > B.bottom);
  }

  // Audio control: attempt to play, handle promise for autoplay policies
  async function safePlayAudio() {
    if (!audio) return;
    try {
      // audio.play() returns a promise — browsers may reject if not a user gesture
      await audio.play();
    } catch (err) {
      // play() might be blocked by autoplay policies — that'll be allowed once user interacts.
      // We'll ignore the error here (user drag is the gesture that should enable it).
      // Optionally you could show a UI prompt asking user to "Tap to enable audio".
      // console.warn("Audio play prevented:", err);
    }
  }

  function safePauseAudio() {
    if (!audio) return;
    try {
      audio.pause();
    } catch (err) {
      // ignore
    }
  }

  // Start spin + audio: ramp timeScale to 1 and ensure audio plays
  let spinStartTween = null;
  function startSpinAndAudio() {
    // If spin is paused, ensure it's playing so timeScale changes take effect
    if (spin.paused()) spin.play();

    // Cancel any previous tween and ramp timeScale to 1
    if (spinStartTween) spinStartTween.kill();
    spinStartTween = gsap.to(spin, {
      timeScale: 1,
      duration: 0.35,
      ease: "power1.out",
      onStart: () => {
        // Trigger audio play (user gesture should exist while dragging)
        safePlayAudio();
      }
    });
  }

  // Stop spin + audio: ramp timeScale to 0, then pause spin and pause audio
  let spinStopTween = null;
  function stopSpinAndAudio() {
    // Cancel any previous stop tween
    if (spinStopTween) spinStopTween.kill();

    spinStopTween = gsap.to(spin, {
      timeScale: 0,
      duration: 0.45,
      ease: "power1.out",
      onComplete: () => {
        // Pause the spin timeline to prevent continuous playback when timeScale is 0
        spin.pause();
        // Pause audio and keep currentTime so resume restarts from same point
        safePauseAudio();
      }
    });
  }

  // Short loop-checker used during interaction
  let checking = false;
  function startCheckingLoop() {
    if (checking) return;
    checking = true;
    (function loop() {
      if (!checking) return;
      if (isOverlapping(tip, playArea)) {
        startSpinAndAudio();
      } else {
        stopSpinAndAudio();
      }
      requestAnimationFrame(loop);
    })();
  }
  function stopCheckingLoop() {
    checking = false;
  }

  // === Create Draggable with rotation and clamping ===
  const draggable = Draggable.create(tonearm, {
    type: "rotation",
    inertia: false,
    onPress() {
      gsap.to(this.target, { scale: 1.02, duration: 0.12 });
      // Start checking — this pointer action counts as user gesture for autoplay policies
      startCheckingLoop();
    },
    onDrag() {
      // clamp rotation in real-time
      let r = this.rotation;
      const clamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, r);
      if (clamped !== r) {
        gsap.set(this.target, { rotation: clamped });
        this.update();
        r = clamped;
      }

      // quick overlap check while dragging
      if (isOverlapping(tip, playArea)) startSpinAndAudio();
      else stopSpinAndAudio();
    },
    onRelease() {
      gsap.to(this.target, { scale: 1, duration: 0.12 });

      // clamp after release
      const finalClamped = gsap.utils.clamp(MIN_ANGLE, MAX_ANGLE, this.rotation);
      gsap.set(this.target, { rotation: finalClamped });
      this.update();

      // final overlap check
      if (isOverlapping(tip, playArea)) startSpinAndAudio();
      else stopSpinAndAudio();

      stopCheckingLoop();
    }
  })[0];

  // Re-evaluate on resize
  window.addEventListener("resize", () => {
    if (isOverlapping(tip, playArea)) startSpinAndAudio();
    else stopSpinAndAudio();
  });

  // Optional: maintain audio currentTime in localStorage across reloads (uncomment if wanted)
  /*
  // load last stored time
  const KEY = "vinylAudioTime";
  if (localStorage.getItem(KEY)) {
    try { audio.currentTime = Number(localStorage.getItem(KEY)); } catch(e) {}
  }
  // save time periodically
  setInterval(() => {
    if (audio && !isNaN(audio.currentTime)) {
      localStorage.setItem(KEY, audio.currentTime);
    }
  }, 1000);
  */

  // Ensure initial stopped state
  spin.pause();
  spin.timeScale(0);
  if (audio) {
    audio.loop = true;
    // audio.pause(); // paused by default
  }
});
