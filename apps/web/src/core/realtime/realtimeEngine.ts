import { connectSocket } from "./socketClient";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";

const INTERVAL_MIN = 1000;
const INTERVAL_MAX = 2000;

function randomInterval(): number {
  return Math.floor(Math.random() * (INTERVAL_MAX - INTERVAL_MIN + 1)) + INTERVAL_MIN;
}

/**
 * Starts the realtime engine. Returns a cleanup function.
 *
 * mock=true  → timer local que llama onTick cada 1-2s (simulación en cliente).
 * mock=false → conexión Socket.io con el backend; onTick se ignora porque los
 *              eventos del socket actualizan los stores directamente.
 */
export function startRealtimeEngine(onTick: () => void): () => void {
  if (!IS_MOCK) return connectSocket();

  let timer: ReturnType<typeof setTimeout>;

  function tick() {
    onTick();
    timer = setTimeout(tick, randomInterval());
  }

  timer = setTimeout(tick, randomInterval());
  return () => clearTimeout(timer);
}
