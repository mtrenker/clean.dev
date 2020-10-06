/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import React from 'react';
import { Asset, Entry } from 'contentful';
import { BLOCKS, Block, Inline } from '@contentful/rich-text-types';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../components/blueprints/ChangePassword';
import { Projects } from '../components/blueprints/Projects';
import { TimeTracking } from '../components/blueprints/TimeTracking';
import { Blog } from '../components/blueprints/Blog';

enum BLUEPRINTS {
  PROJECTS = 'projects',
  TIME_TRACKING = 'time-tracking',
  BLOG = 'blog',
  CHANGE_PASSWORD = 'change-password',
}

interface AssetBlock extends Block {
  data: {
    asset: Asset
  }
}

interface Blueprint {
  name: BLUEPRINTS;
}

const renderBlueprint = (entry: Entry<Blueprint>): JSX.Element => {
  switch (entry.fields.name) {
    case BLUEPRINTS.TIME_TRACKING:
      return <TimeTracking />;
    case BLUEPRINTS.BLOG:
      return <Blog />;
    case BLUEPRINTS.CHANGE_PASSWORD:
      return <ChangePassword />;
    case BLUEPRINTS.PROJECTS:
      return <Projects />;
    default:
      return <p>YO NOTHING</p>;
  }
};

const renderAsset = (assetBlock: Block | Inline) => {
  const { data: { asset: { fields: { title, file } } } } = assetBlock as AssetBlock;

  return <img src={file.url} alt={title} />;
};

const renderEntry = (assetBlock: Block | Inline): JSX.Element => {
  const target = assetBlock.data?.target as Entry<Blueprint>;
  const contentType = target.sys.contentType.sys.id;
  switch (contentType) {
    case 'blueprint':
      return renderBlueprint(target);
    case 'component':
      break;
    default:
      return <p>NOTHING</p>;
  }
  return <p>NOTHING</p>;
};

export const mapWidgets = (): RenderNode => ({
  [BLOCKS.EMBEDDED_ENTRY]: renderEntry,
  [BLOCKS.EMBEDDED_ASSET]: renderAsset,
});
