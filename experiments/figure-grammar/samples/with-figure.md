---
title: Where the work waits
status: fixture
---

Software organizations are factories. Most have one bottleneck, and it is rarely the developers.

A delivery system with five stations. Numbers are illustrative.

```figure
{
  "id": "fig-1", "number": 1, "title": "Where the work waits", "note": "Numbers are illustrative.",
  "flows": [{
    "stations": [
      { "name": "Ideas",       "queue": { "count": 48 },                          "capacity": { "label": "unlimited" } },
      { "name": "Refinement",  "queue": { "count": 12 },                          "capacity": { "count": 1, "label": "1 product owner" } },
      { "name": "Development", "queue": { "count": 9, "state": "in-progress" },   "capacity": { "count": 5, "label": "5 developers" } },
      { "name": "Review",      "queue": { "count": 14 },                          "capacity": { "count": 1, "label": "1 senior reviewer" }, "constraint": true },
      { "name": "Release",     "queue": { "count": 0 },                           "capacity": { "label": "every 2 weeks" } }
    ],
    "end": "arrow"
  }],
  "caption": "Adding two developers here feeds the review queue. The constraint is review capacity, so more developers make the system slower, not faster, until review is relieved.",
  "sentence": {
    "model": "review-queue",
    "inputs": {
      "developers": { "value": 5, "min": 1, "max": 20, "label": "developers" },
      "reviewers":  { "value": 1, "min": 1, "max": 10, "label": "senior reviewers" },
      "added":      { "value": 2, "min": 0, "max": 20, "label": "developers added" }
    }
  }
}
```

I join teams as a technical lead or solutions architect and stay close to the code, because that is where the factory tells the truth.
