import React from 'react';
import { withKnobs, text, date, number } from "@storybook/addon-knobs";
import faker from "faker";

import { ProjectList, ProjectItem, ProjectItemProps } from './Projects';

export default { title: 'Components | CV', decorators: [withKnobs] };

export const projectList = () => {

  const props: ProjectItemProps = {
    client: text("Client", faker.company.companyName()),
    position: text("Position", "Senior React Developer"),
    date: "2020-01-01 - 2020-03-31",
  };

  const wordCount = number("Description Word Cound", 120);
  const description = faker.lorem.sentence(wordCount);

  return (
    <ProjectList>
      <ProjectItem {...props}>
        {description}
      </ProjectItem>

      <ProjectItem {...props}>
        {description}
      </ProjectItem>
    </ProjectList>
  );
};
