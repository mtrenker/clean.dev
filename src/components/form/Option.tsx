import React, { FC, HTMLProps } from 'react';

export const Option: FC<HTMLProps<HTMLOptionElement>> = ({ children }) => (<option>{children}</option>);
