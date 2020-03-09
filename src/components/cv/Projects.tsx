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
    "client" auto
    "position" auto
    "date" auto
    "description" auto
  ;

  gap: 4px;

  .position {
    margin: 0;
    font-size: 16px;
    grid-area: position;
  }

  .client {
    margin: 0;
    font-size: 16px;
    grid-area: client;
  }

  .date {
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
      <h3 className="client">{client}</h3>
      <h4 className="position">{position}</h4>
      <time className="date">{date}</time>
      <p className="description">
        {children}
      </p>
    </li>
  );
}
