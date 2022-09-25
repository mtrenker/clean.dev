import React from "react";
import { DecoratorFn } from "@storybook/react";
import { Layout } from "../common/components/Layout";

export const LayoutDecorator: DecoratorFn = (Story) => (
  <Layout>
    <div className="container mx-auto mt-10">
      <Story />
    </div>
  </Layout>
);
