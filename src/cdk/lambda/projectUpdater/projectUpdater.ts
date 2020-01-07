import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 } from "uuid";

interface PayloadData {
  projects: {
    client: string;
    description: string;
    startDate: string;
    endDate: string;
    skills: string[];
  }[]
}

interface SkillData {
  name: string;
  description: string;
}

interface ProjectData {
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: SkillData[];
}

export const handler = async (event: any) => {

  const projectTable = process?.env?.TABLE_NAME
  const data = parseData(event.payload);

  console.log(projectTable);
  if (projectTable) {

    const client = new DocumentClient();
    await client.batchWrite({
      RequestItems: {
        [projectTable]: data.map(project => ({
          PutRequest: {
            Item: {
              id: `project-${v4()}`,
              ...project
            }
          }
        })),
      }
    }).promise();
  }

  return data;
}

const parseData = (rawData: PayloadData): ProjectData[] => rawData.projects.reduce((projects, project) => {
  return [
    ...projects,
    {
      client: project.client,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      skills: [],
    }
  ];
}, [] as ProjectData[]);
