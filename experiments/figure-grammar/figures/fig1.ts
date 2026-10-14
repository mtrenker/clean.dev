import type { Figure } from "../types.ts";

export const fig1: Figure = {
  id: "fig-1", number: 1, title: "Where the work waits", note: "Numbers are illustrative.",
  flows: [{
    stations: [
      { name: "Ideas",       queue: { count: 48 },                          capacity: { label: "unlimited" } },
      { name: "Refinement",  queue: { count: 12 },                          capacity: { count: 1, label: "1 product owner" } },
      { name: "Development", queue: { count: 9, state: "in-progress" },     capacity: { count: 5, label: "5 developers" } },
      { name: "Review",      queue: { count: 14 },                          capacity: { count: 1, label: "1 senior reviewer" }, constraint: true },
      { name: "Release",     queue: { count: 0 },                           capacity: { label: "every 2 weeks" } },
    ],
    end: "arrow",
  }],
  caption: "Adding two developers here feeds the review queue. The constraint is review capacity, so more developers make the system slower, not faster, until review is relieved.",
  text: "Work flows from Ideas through Refinement, Development and Review to Release. The longest queue sits in front of Review, where 14 changes wait for one senior reviewer. Development has 9 changes in progress for 5 developers. Adding developers increases the review queue; the constraint is review capacity.",
  sentence: {
    model: "review-queue",
    inputs: {
      developers: { value: 5, min: 1, max: 20, label: "developers" },
      reviewers:  { value: 1, min: 1, max: 10, label: "senior reviewers" },
      added:      { value: 2, min: 0, max: 20, label: "developers added" },
    },
  },
};
