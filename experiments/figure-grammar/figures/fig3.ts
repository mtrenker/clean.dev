// Derived from Martin's brief "What Factorio taught me about agile bottlenecks":
// "approval layers and dependencies become invisible queues", "bottlenecks move, but rituals stay fixed".
import type { Figure } from "../types.ts";

export const fig3: Figure = {
  id: "fig-3", number: 3, title: "The bottleneck moves", note: "Numbers are illustrative.",
  flows: [
    {
      label: "Before",
      stations: [
        { name: "Ideas",       queue: { count: 48 },                      capacity: { label: "unlimited" } },
        { name: "Refinement",  queue: { count: 12 },                      capacity: { count: 1, label: "1 product owner" } },
        { name: "Development", queue: { count: 9, state: "in-progress" }, capacity: { count: 5, label: "5 developers" } },
        { name: "Review",      queue: { count: 14 },                      capacity: { count: 1, label: "1 senior reviewer" }, constraint: true },
        { name: "Release",     queue: { count: 0 },                       capacity: { label: "every 2 weeks" } },
      ],
      end: "arrow",
    },
    {
      label: "After a second reviewer",
      stations: [
        { name: "Ideas",       queue: { count: 48 },                      capacity: { label: "unlimited" } },
        { name: "Refinement",  queue: { count: 12 },                      capacity: { count: 1, label: "1 product owner" } },
        { name: "Development", queue: { count: 9, state: "in-progress" }, capacity: { count: 5, label: "5 developers" } },
        { name: "Review",      queue: { count: 3 },                       capacity: { count: 2, label: "2 senior reviewers" } },
        { name: "Release",     queue: { count: 11 },                      capacity: { label: "every 2 weeks" }, constraint: true },
      ],
      end: "arrow",
    },
  ],
  caption: "Bottlenecks move, but rituals stay fixed. Relieve review and the work waits for the release train.",
};
