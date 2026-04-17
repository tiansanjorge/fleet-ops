const INTERVAL_MIN = 1000;
const INTERVAL_MAX = 2000;

function randomInterval(): number {
  return (
    Math.floor(Math.random() * (INTERVAL_MAX - INTERVAL_MIN + 1)) + INTERVAL_MIN
  );
}

/**
 * Starts the realtime simulation engine.
 * Calls `onTick` every 1-2 seconds.
 * Returns a cleanup function to stop the engine.
 *
 * Designed to be swappable: replace this function with a WebSocket
 * implementation later without touching consumers.
 */
export function startRealtimeEngine(onTick: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;

  function tick() {
    onTick();
    timer = setTimeout(tick, randomInterval());
  }

  timer = setTimeout(tick, randomInterval());

  return () => clearTimeout(timer);
}
