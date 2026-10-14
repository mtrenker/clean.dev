// Progressive enhancement for the live sentence; without it the sentence is complete static text.
// Contract with render.ts: .live[data-model] holds <p>s with var.v.in[data-input data-label data-min data-max]
// and span.v.out[data-output]; the result <p> has aria-live. The model is models/<data-model>.js.

const reduce = matchMedia("(prefers-reduced-motion: reduce)");

const css = `
.live input.v.in {
  font: inherit; font-weight: 600; letter-spacing: inherit; color: inherit;
  font-variant-numeric: lining-nums tabular-nums;
  background: none; border: 0; border-radius: 0; padding: 0; margin: 0;
  text-align: center; vertical-align: baseline;
  appearance: textfield; -moz-appearance: textfield;
  transition: text-decoration-thickness 180ms ease-out;
}
.live input.v.in::-webkit-inner-spin-button,
.live input.v.in::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.live input.v.in:focus-visible { outline: 2px solid currentColor; outline-offset: 0.08em; }
.live input.v.in.nudged { text-decoration-thickness: 0.2em; }
.live .v.out { display: inline-block; position: relative; overflow: clip; vertical-align: bottom; line-height: inherit; }
.live .v.out > .was { position: absolute; inset: 0; text-align: inherit; }
.live .v.out.step { font-weight: 800; }
`;

/** Replace each var.in with a number input that keeps the static numeral's look. */
function enhanceInput(v) {
  const input = document.createElement("input");
  const max = Number(v.dataset.max ?? 99);
  input.type = "number";
  input.inputMode = "numeric";
  input.min = v.dataset.min ?? "0";
  input.max = String(max);
  input.step = "1";
  input.defaultValue = input.value = v.textContent.trim();
  input.className = v.className;
  input.dataset.input = v.dataset.input;
  input.setAttribute("aria-label", v.dataset.label ?? v.dataset.input);
  // tabular numerals: one ch per digit of the current value. The results already reflow the
  // sentence when they change width, so reserving room at the inputs only added visible air.
  fit(input);
  v.replaceWith(input);
  return input;
}

/** Size an input to its digits. */
function fit(input) {
  input.style.width = `${Math.max(1, input.value.length)}ch`;
}

/** Roll the new numeral up from below while the old one leaves upward; or step the weight. */
function mark(span, was) {
  if (reduce.matches) {
    span.classList.add("step");
    setTimeout(() => span.classList.remove("step"), 600);
    return;
  }
  const now = document.createElement("span");
  now.textContent = span.textContent;
  const old = document.createElement("span");
  old.className = "was";
  old.setAttribute("aria-hidden", "true");
  old.textContent = was;
  span.replaceChildren(now, old);
  now.style.display = "inline-block";
  const timing = { duration: 180, easing: "ease-out" };
  now.animate([{ transform: "translateY(100%)" }, { transform: "none" }], timing);
  const settle = () => { if (now.isConnected) span.textContent = now.textContent; }; // back to plain text, exact baseline
  old.animate([{ transform: "none" }, { transform: "translateY(-100%)" }], timing).finished.then(settle, settle);
}

/** Re-render one paragraph from its segments without moving the input elements (moving would drop focus). */
function renderParagraph(p, segments, inputs, outputs) {
  const previous = {};
  for (const el of p.querySelectorAll("[data-output]")) previous[el.dataset.output] = el.dataset.value ?? el.textContent;
  for (const node of [...p.childNodes]) if (!(node instanceof HTMLInputElement)) node.remove();
  let cursor = p.firstChild;
  for (const seg of segments) {
    if ("input" in seg) {
      const el = inputs[seg.input];
      if (el !== cursor) p.insertBefore(el, cursor); // only if the model reorders inputs
      cursor = el.nextSibling;
      continue;
    }
    let node;
    if ("output" in seg) {
      node = document.createElement("span");
      node.className = "v out";
      node.dataset.output = seg.output;
      node.textContent = node.dataset.value = String(outputs[seg.output]);
      const was = previous[seg.output];
      if (was !== undefined && was !== node.textContent) queueMicrotask(() => mark(node, was));
    } else {
      node = document.createTextNode(seg.text);
    }
    p.insertBefore(node, cursor);
  }
}

async function enhance(root) {
  const model = await import(new URL(`./models/${root.dataset.model}.js`, import.meta.url).href);
  const paragraphs = [...root.querySelectorAll(":scope > p:not(.live-model)")];
  // swapping var for input is a mutation inside the live region; mute the region while it happens
  const regions = paragraphs.filter((p) => p.hasAttribute("aria-live"));
  const politeness = regions.map((p) => p.getAttribute("aria-live"));
  regions.forEach((p) => p.setAttribute("aria-live", "off"));
  const inputs = {};
  for (const v of root.querySelectorAll("var.v.in[data-input]")) inputs[v.dataset.input] = enhanceInput(v);
  requestAnimationFrame(() => requestAnimationFrame(() => regions.forEach((p, i) => {
    p.setAttribute("aria-live", politeness[i]);
    p.setAttribute("aria-atomic", "true"); // announce the whole sentence, not the changed text node
  })));

  const update = (edited) => {
    // edited is null only for the first pass, which aligns static text (plurals) with the model;
    // a paragraph whose text already matches is left alone so the live region does not speak on load
    const values = {};
    for (const [name, el] of Object.entries(inputs)) {
      const n = el.valueAsNumber;
      if (!Number.isInteger(n) || n < Number(el.min) || n > Number(el.max)) return; // mid-typing; wait
      values[name] = n;
    }
    Object.values(inputs).forEach(fit);
    const outputs = model.compute(values);
    model.lines(values, outputs).forEach((segments, i) => {
      const p = paragraphs[i];
      if (!p) return;
      const text = segments.map((s) => s.text ?? (s.input ? "" : outputs[s.output])).join("");
      if (edited || text !== p.textContent) renderParagraph(p, segments, inputs, outputs);
    });
    if (edited && !reduce.matches) {
      edited.classList.add("nudged");
      setTimeout(() => edited.classList.remove("nudged"), 240);
    }
  };

  for (const el of Object.values(inputs)) {
    el.addEventListener("input", () => update(el));
    el.addEventListener("change", () => {
      // clamp what was typed out of range, then render
      const n = Math.round(el.valueAsNumber);
      const fixed = Number.isNaN(n) ? Number(el.defaultValue) : Math.min(Number(el.max), Math.max(Number(el.min), n));
      if (String(fixed) !== el.value) { el.value = String(fixed); update(el); }
    });
  }
  update(null); // align the static text with the model (plurals) without marking anything
}

if (document.querySelector(".live[data-model]")) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  for (const root of document.querySelectorAll(".live[data-model]")) {
    enhance(root).catch((err) => console.error("live sentence stays static:", err));
  }
}
