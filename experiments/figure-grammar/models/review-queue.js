// The review-queue model behind Figure 1's live sentence.
// Plain ESM with JSDoc types so Node (build.ts, check.ts) and the browser (live.js) import the same file.

/**
 * @typedef {{ developers: number, reviewers: number, added: number }} Inputs
 * @typedef {{ waiting: number, waiting2: number }} Outputs
 * @typedef {{ text: string } | { input: keyof Inputs } | { output: keyof Outputs }} Segment
 */

/** Changes one developer finishes in a week. */
export const PER_DEVELOPER = 4;
/** Changes one senior reviewer clears in a week. */
export const PER_REVIEWER = 6;

/** The model stated in words, printed under the sentence. */
export const note =
  "Illustrative model: each developer finishes four changes a week, one senior reviewer clears six. The figure shows one week.";

/**
 * @param {Inputs} inputs plain numbers, not the { value, min, max } records from the figure data
 * @returns {Outputs}
 */
export function compute({ developers, reviewers, added }) {
  const cleared = reviewers * PER_REVIEWER;
  return {
    waiting: Math.max(0, developers * PER_DEVELOPER - cleared),
    waiting2: Math.max(0, (developers + added) * PER_DEVELOPER - cleared),
  };
}

/** @param {number} n @param {string} one @param {string} many */
const plural = (n, one, many) => (n === 1 ? one : many);

/**
 * The sentences, one Segment[] per paragraph. Owns plurals and the zero cases.
 * Inputs appear in the same order in every call, so live.js can keep the input elements in place.
 * @param {Inputs} inputs
 * @param {Outputs} [outputs] computed from inputs when omitted
 * @returns {Segment[][]}
 */
export function lines(inputs, outputs = compute(inputs)) {
  const { developers, reviewers, added } = inputs;
  const { waiting, waiting2 } = outputs;
  /** @type {Segment[]} */
  const first = [
    { text: "A team of " }, { input: "developers" },
    { text: ` ${plural(developers, "developer", "developers")} and ` }, { input: "reviewers" },
    { text: ` ${plural(reviewers, "senior reviewer", "senior reviewers")} has ` },
    ...(waiting === 0
      ? [{ text: "no changes waiting for review." }]
      : [{ output: "waiting" }, { text: ` ${plural(waiting, "change", "changes")} waiting for review.` }]),
  ];
  /** @type {Segment[]} */
  const second = [
    { text: "Add " }, { input: "added" },
    { text: ` ${plural(added, "developer", "developers")} and ` },
    ...(waiting2 === 0
      ? [{ text: "the review queue stays clear." }]
      : [{ output: "waiting2" }, { text: ` ${plural(waiting2, "change waits", "changes wait")}.` }]),
  ];
  return [first, second];
}
