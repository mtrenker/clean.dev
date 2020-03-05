import React, { FC } from "react";
import Helmet from "react-helmet";
import { Header } from "../components/layout/Header";

export const Frontpage: FC = () => (
  <>
    <Header>
      <Helmet>
        <title>Frontpage</title>
      </Helmet>
    </Header>
    <main>
      <h1> Welcome</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Animi maxime rerum, optio veniam dolore impedit mollitia facere unde nobis.
        Nam voluptate maxime enim vero numquam repellendus magnam rem hic ipsum?
      </p>
    </main>
  </>
)
