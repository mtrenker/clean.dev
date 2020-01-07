import { handler } from "./projectUpdater";

describe("ProjectUpdater Function", () => {
  it("says yay", async () => {
    expect(await handler()).toBe('YAY!');
  })
})
