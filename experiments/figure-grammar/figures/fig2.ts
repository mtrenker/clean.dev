import type { Figure } from "../types.ts";

export const fig2: Figure = {
  id: "fig-2", number: 2, title: "Two ways to work with agents",
  flows: [
    {
      label: "Fleet",
      stations: [
        { name: "Large plan" },
        { name: "split into tasks",               queue: { count: 4 } },
        { name: "agents in\nseparate workspaces",  queue: { count: 1, state: "in-progress" }, lanes: { count: 4, more: true } },
        { name: "code appears" },
        { name: "dashboard" },
      ],
      end: { stop: "no understanding" },
      noConstraint: "The essay marks no station. The row ends in lost understanding.",
    },
    {
      label: "Now",
      stations: [
        { name: "Issue" },
        { name: "one small task",   queue: { count: 1 } },
        { name: "worktree",         queue: { count: 1, state: "in-progress" }, capacity: { count: 3, label: "orchestrator / implementer / reviewer" } },
        { name: "pull request" },
        { name: "review by Martin", queue: { count: 1 }, capacity: { count: 1 }, constraint: true },
        { name: "merge" },
      ],
      end: "arrow",
    },
  ],
  pull: true,
  caption: "The bottleneck is still me. That's fine. I have to live with the code after the agents move on.",
  text: "In the fleet workflow, a large plan is split into tasks and sent to agents in separate workspaces; code appears quickly and a dashboard shows activity, but understanding is lost. In the current workflow, one groomed issue becomes one small task, worked in a worktree by an orchestrator, an implementer and a reviewer, then crosses as a pull request into review by Martin before it is merged. The constraint is review by Martin, by design.",
};
