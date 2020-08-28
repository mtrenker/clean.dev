import React from 'react';
import { Asset } from 'contentful';
import { BLOCKS, Block, Inline } from '@contentful/rich-text-types';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../components/blueprints/ChangePassword';
import { Projects } from '../components/blueprints/Projects';
import { TimeTracking } from '../components/blueprints/TimeTracking';
import { Blog } from '../components/blueprints/Blog';
import { Gist } from '../components/Gist';

const BLUEPRINTS = {
  PROJECTS: 'projects',
  TIME_TRACKING: 'time-tracking',
  BLOG: 'blog',
  CHANGE_PASSWORD: 'change-password',
} as const;

const COMPONENTS = {
  GIST: 'gist',
} as const;

interface AssetBlock extends Block {
  data: {
    asset: Asset
  }
}

const renderAsset = (assetBlock: Block | Inline) => {
  const { data: { asset: { fields: { title, file } } } } = assetBlock as AssetBlock;

  return <img src={file.url} alt={title} />;
};

export const mapWidgets = (): RenderNode => ({
  [BLUEPRINTS.BLOG]: () => <Blog />,
  [BLUEPRINTS.CHANGE_PASSWORD]: () => <ChangePassword />,
  [BLUEPRINTS.TIME_TRACKING]: () => <TimeTracking />,
  [BLUEPRINTS.PROJECTS]: () => <Projects />,
  [COMPONENTS.GIST]: ({ data: { gist, title } }) => <Gist gist={gist} title={title} />,
  [BLOCKS.EMBEDDED_ASSET]: renderAsset,
});
