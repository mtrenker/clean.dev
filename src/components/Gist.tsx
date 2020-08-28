import React, { FC } from 'react';

interface GistProps {
  title: string;
  gist: string;
}

export const Gist: FC<GistProps> = ({ gist, title }) => (
  <div>
    <h1>{title}</h1>
    <p>{gist}</p>
  </div>
);
