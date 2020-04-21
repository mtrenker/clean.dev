import React from 'react';
import { render } from 'react-dom';
import 'typeface-roboto';

import { Root } from './components/Root';

const container = document.createElement('div');

render(<Root />, document.body.appendChild(container));
