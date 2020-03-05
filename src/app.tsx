import React from "react";
import { render } from "react-dom";

import { Root } from "./components/Root";

const container = document.createElement('div');

render(<Root />, document.body.appendChild(container));
