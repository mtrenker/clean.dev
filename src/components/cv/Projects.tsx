import React, { FC } from "react";
import { css } from "@emotion/core";
import { useTranslation } from "react-i18next";

export interface ProjectItemProps {
  client: string;
  position: string;
  date: string;
}

// const listStyle = css`
//   display: grid;

// `;

export const ProjectList: FC = ({ children }) => (
  <ul>
    {children}
  </ul>
);

const itemStyle = css`
  font-family: "Roboto";
  display: grid;

  grid-template:
    "position" max-content
    "client" auto
    "date" auto
    "description" auto
  ;

  gap: 4px;

  h3 {
    margin: 0;
    font-size: 16px;
    grid-area: position;
  }

  h4 {
    margin: 0;
    font-size: 16px;
    grid-area: client;
  }

  time {
    font-size: 16px;
    grid-area: date;
  }

  p {
    font-size: 16px;
    grid-area: description;
  }

  @media(min-width: 768px) {
    grid-template:
      "position client date" auto
      "description description description" auto
      / 1fr 1fr 2fr
    ;
  }
`;

export const ProjectItem: FC<ProjectItemProps> = ({ client, position, date, children }) => {
  return (
    <li css={itemStyle}>
      <h3>{position}</h3>
      <h4>{client}</h4>
      <time>{date}</time>
      <p>
        {children}
      </p>
    </li>
  );
}
