import React, { HTMLProps, FC } from 'react';

export const Select: FC<HTMLProps<HTMLSelectElement>> = ({ children }) => (<select>{children}</select>);
