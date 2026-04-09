// Sound manager — mirrors The Talos Principle terminal audio naming convention.
// Drop matching files into /public/sounds/ and they play automatically.
// Supported formats: .wav (tried first), .ogg (fallback).
// All play() calls fail silently if the file is missing.

const BASE = "/sounds/";

// Round-robin pool so rapid calls don't cut each other off
type Pool = { els: HTMLAudioElement[]; idx: number };
const pools: Record<string, Pool> = {};

function makePool(name: string, size = 3): Pool {
  const els = Array.from({ length: size }, () => {
    const el = new Audio(`${BASE}${name}.wav`);
    el.addEventListener("error", () => {
      el.src = `${BASE}${name}.ogg`;
    }, { once: true });
    return el;
  });
  return { els, idx: 0 };
}

function getPool(name: string, size = 3): Pool {
  if (!pools[name]) pools[name] = makePool(name, size);
  return pools[name];
}

function play(name: string, size = 3): void {
  const pool = getPool(name, size);
  const el = pool.els[pool.idx % pool.els.length];
  pool.idx++;
  el.currentTime = 0;
  el.play().catch(() => {});
}

// Preload on module load so first play has no delay
const SOUND_NAMES = [
  "TerminalTypingUser",
  "TerminalTypingReturnKey",
  "TerminalDocumentOpen",
  "TerminalDocumentClose",
  "TerminalNotification",
  "TerminalPowerOn",
  "TerminalPowerOff",
  "TerminalSystemLoading",
  "TerminalSystemBoot",
  "TerminalEndOfConversation",
];
SOUND_NAMES.forEach((n) => getPool(n, n === "TerminalTypingUser" ? 8 : 3));

export const SFX = {
  // Fired for each regular character typed by the player
  typing:            () => play("TerminalTypingUser", 8),
  // Fired when Enter is pressed to submit a command
  enter:             () => play("TerminalTypingReturnKey"),
  // Fired when a file is opened (TYPE command) or write mode starts
  documentOpen:      () => play("TerminalDocumentOpen"),
  // Fired when a file is saved/closed (write mode ends)
  documentClose:     () => play("TerminalDocumentClose"),
  // Fired on SSH connect, auth success, or any important notification
  notification:      () => play("TerminalNotification"),
  // Fired at the very start of the boot sequence
  powerOn:           () => play("TerminalPowerOn"),
  // Fired on EXIT command
  powerOff:          () => play("TerminalPowerOff"),
  // Fired during the loading phase of the boot sequence
  systemLoading:     () => play("TerminalSystemLoading"),
  // Fired when the boot sequence completes and the prompt appears
  systemBoot:        () => play("TerminalSystemBoot"),
  // Fired when disconnecting from an SSH server
  endOfConversation: () => play("TerminalEndOfConversation"),
};
