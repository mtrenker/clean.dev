import { handler } from "./projectUpdater";

const testData = {
  projects: [
    {
      client: "Demo Company A",
      description: "Created a thing for a month",
      startDate: "2000-01-01",
      endDate: "2000-02-01",
      skills: [
        "git",
        "jira",
        "agile",
        "scrum",
        "react",
        "typescript"
      ]
    },
  ]
};

const event = {
  payload: testData
}

describe("ProjectUpdater Function", () => {
  it("says yay", async () => {
    const parsedData = [{
      client: testData.projects[0].client,
      description: testData.projects[0].description,
      endDate: testData.projects[0].endDate,
      startDate: testData.projects[0].startDate,
      skills: []
    }]
    expect(await handler(event)).toEqual(parsedData);
  })
})
