// Mounts the NIC decoder into every [data-nic-decoder] element: the tool page and posts that embed it
// with <div data-nic-decoder></div> in Markdown. Runs entirely in the browser; nothing is sent or stored.
import { decodeNic, ageOn, weekday, MONTHS, type Nic } from "../lib/nic";

const FIELD = "rounded-lg border bg-card/60 p-3";
let uid = 0;

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

  const item = (label: string, value: string, extra = "") => {
    const div = document.createElement("div");
    div.className = FIELD + extra;
    const dt = document.createElement("dt");
    dt.className = "font-mono text-xs text-muted-foreground";
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.className = "mt-0.5 font-medium";
    dd.textContent = value;
    div.append(dt, dd);
    return div;
  };

  function show(r: Nic) {
    const dob = `${weekday(r)}, ${r.day} ${MONTHS[r.month - 1]} ${r.year}`;
    const age = ageOn(r);
    out.replaceChildren(
      item("Date of birth", dob, " sm:col-span-2"),
      item("Age", `${age} ${age === 1 ? "year" : "years"}`),
      item("Gender", r.gender),
      item("Format", r.format === "old" ? "Old (9 digits + letter)" : "New (12 digits)"),
      item("Day number", `${String(r.dayNumber).padStart(3, "0")}${r.gender === "Female" ? " (day + 500)" : ""}`),
      item(
        r.format === "old" ? "New format" : "Old format",
        r.converted ?? (r.year >= 2000 ? "None: born in 2000 or later, so new format only" : "None: serial doesn't fit the old format"),
        " sm:col-span-2 font-mono",
      ),
    );
    out.hidden = false;
    msg.textContent = "";
    msg.className = "min-h-5 text-sm";
  }

  function run(final: boolean) {
    const value = input.value.trim();
    if (!value) {
      out.hidden = true;
      msg.textContent = "";
      return;
    }
    const r = decodeNic(value);
    if ("error" in r) {
      out.hidden = true;
      // While typing, only complain once the input is long enough to be a full number.
      if (final || value.replace(/\s+/g, "").length >= 10) {
        msg.textContent = r.error;
        msg.className = "min-h-5 text-sm text-(--danger)";
      } else msg.textContent = "";
      return;
    }
    show(r);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(true);
  });
  input.addEventListener("input", () => run(false));
}

document.querySelectorAll<HTMLElement>("[data-nic-decoder]").forEach(mount);
