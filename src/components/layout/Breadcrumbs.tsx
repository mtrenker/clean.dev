import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';

export const Breadcrumbs: FC = () => {
  const { pathname } = useLocation();
  return (
    <div>{pathname}</div>
  );
};
