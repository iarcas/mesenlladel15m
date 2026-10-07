// Interaction-driven audio: a short clip plays when you hover/tap a tweet,
// instead of the original's always-on ambient layers + unstoppable timer.
// Much lighter (no indefinite background playback to manage or runaway).

const TRACK_COUNT = 16;
const MIN_GAP_MS = 350; // avoid overlapping clips when sweeping across bubbles fast

export function createAudioController() {
  let enabled = false; // matches the switch's initial OFF position; start() flips it on with a real click behind it
  let current = null;
  let lastPlayAt = 0;

  function stopCurrent() {
    if (current) {
      current.pause();
      current.src = "";
      current = null;
    }
  }

  function playClip() {
    stopCurrent();
    const n = Math.floor(Math.random() * TRACK_COUNT) + 1;
    current = new Audio(`/audio/${n}.mp3`);
    current.volume = 0.7;
    current.play().catch(() => {});
  }

  return {
    get running() {
      return enabled;
    },
    start() {
      enabled = true;
      lastPlayAt = performance.now();
      playClip(); // doubles as the browser-autoplay "unlock" gesture + confirmation blip
    },
    stop() {
      enabled = false;
      stopCurrent();
    },
    playForTweet() {
      if (!enabled) return;
      const now = performance.now();
      if (now - lastPlayAt < MIN_GAP_MS) return;
      lastPlayAt = now;
      playClip();
    },
  };
}
