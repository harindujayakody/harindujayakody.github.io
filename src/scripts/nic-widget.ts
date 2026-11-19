// Mounts the NIC decoder into every [data-nic-decoder] element: the tool page and posts that embed it
// with <div data-nic-decoder></div> in Markdown. Runs entirely in the browser; nothing is sent or stored.
import { decodeNic, ageOn, weekday, MONTHS, type Nic } from "../lib/nic";

const FIELD = "rise rounded-lg border bg-card/60 p-3";
const DIGITS = "0123456789";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let uid = 0;

const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
const poolFor = (c: string) => (/\d/.test(c) ? DIGITS : /[A-Z]/.test(c) ? UPPER : /[a-z]/.test(c) ? LOWER : "");

// Lottery-style reveal: every letter and digit spins, then they lock in from left to right.
// Spaces and punctuation stay put so the shape of the value is visible while it rolls.
function roll(el: HTMLElement, final: string, delay: number, alive: () => boolean) {
  if (reduceMotion.matches) {
    el.textContent = final;
    return;
  }
  const duration = 900;
  const start = performance.now() + delay;
  let lastTick = 0;
  const spin = (locked: number) => [...final].map((c, i) => (i < locked || !poolFor(c) ? c : pick(poolFor(c)))).join("");
  el.textContent = spin(0); // never blank, even before the first frame
  const frame = (now: number) => {
    if (!alive()) return;
    const t = (now - start) / duration;
    if (t >= 1) {
      el.textContent = final;
      return;
    }
    // Change characters about 20 times a second: fast enough to read as spinning, slow enough not to flicker.
    if (now - lastTick > 50) {
      lastTick = now;
      const locked = t <= 0 ? 0 : Math.floor((1 - (1 - t) ** 3) * final.length); // ease-out: slows down as it settles
      el.textContent = spin(locked);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function mount(root: HTMLElement) {
  const id = `nic-${++uid}`;
  root.innerHTML = `
    <form class="flex flex-col gap-3 rounded-xl border bg-card/70 p-5" novalidate>
      <label for="${id}" class="font-mono text-xs text-muted-foreground">NIC number · old (9 digits + V/X) or new (12 digits)</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input id="${id}" name="nic" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="16"
          placeholder="e.g. 199512300000 or 951230000V" aria-describedby="${id}-msg"
          class="h-11 min-w-0 flex-1 rounded-lg border bg-background/60 px-3 font-mono text-base tracking-wide outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-[3px] focus:ring-ring/40" />
        <button type="submit" class="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">Find details</button>
      </div>
      <p id="${id}-msg" class="min-h-5 text-sm" role="status" aria-live="polite"></p>
      <dl class="grid gap-2 sm:grid-cols-2" hidden data-out></dl>
      <p class="text-xs text-muted-foreground">Decoded in your browser. The number is never sent anywhere or saved.</p>
    </form>`;

  const form = root.querySelector("form")!;
  const input = root.querySelector("input")!;
  const msg = root.querySelector<HTMLElement>(`#${id}-msg`)!;
  const out = root.querySelector<HTMLElement>("[data-out]")!;

  let reveal = 0; // bumps on every submit or edit so an older roll stops

  const item = (label: string, value: string, index: number, extra = "") => {
    const div = document.createElement("div");
    div.className = FIELD + extra;
    div.style.setProperty("--d", `${index * 90}ms`);
    const dt = document.createElement("dt");
    dt.className = "font-mono text-xs text-muted-foreground";
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.className = "mt-0.5 font-medium tabular-nums";
    const id = reveal;
    roll(dd, value, index * 90, () => id === reveal);
    div.append(dt, dd);
    return div;
  };

  const setMsg = (text: string, className: string) => {
    msg.textContent = text;
    msg.className = className;
  };

  function show(r: Nic) {
    const dob = `${weekday(r)}, ${r.day} ${MONTHS[r.month - 1]} ${r.year}`;
    const age = ageOn(r);
    const ageText = `${age} ${age === 1 ? "year" : "years"}`;
    out.replaceChildren(
      item("Date of birth", dob, 0, " sm:col-span-2"),
      item("Age", ageText, 1),
      item("Gender", r.gender, 2),
      item("Format", r.format === "old" ? "Old (9 digits + letter)" : "New (12 digits)", 3),
      item("Day number", `${String(r.dayNumber).padStart(3, "0")}${r.gender === "Female" ? " (day + 500)" : ""}`, 4),
      item(
        r.format === "old" ? "New format" : "Old format",
        r.converted ?? (r.year >= 2000 ? "None: born in 2000 or later, so new format only" : "None: serial doesn't fit the old format"),
        5,
        " sm:col-span-2 font-mono",
      ),
    );
    out.hidden = false;
    // The rolling text isn't announced; screen readers get the result in one sentence instead.
    setMsg(`Born ${dob}. ${r.gender}, ${ageText} old.`, "sr-only");
  }

  function clear() {
    reveal++;
    out.hidden = true;
    out.replaceChildren();
    setMsg("", "min-h-5 text-sm");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clear();
    const value = input.value.trim();
    if (!value) return setMsg("Enter a NIC number first.", "min-h-5 text-sm text-(--danger)");
    const r = decodeNic(value);
    if ("error" in r) return setMsg(r.error, "min-h-5 text-sm text-(--danger)");
    show(r);
  });
  // Results belong to the number that was submitted, so editing it clears them.
  input.addEventListener("input", () => {
    if (!out.hidden || msg.textContent) clear();
  });
}

document.querySelectorAll<HTMLElement>("[data-nic-decoder]").forEach(mount);
