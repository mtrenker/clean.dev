import { ReactNode } from 'react';

import { Document, BLOCKS } from '@contentful/rich-text-types';
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';

const options: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: ({ data }) => {
      const { description, title, file } = data.target.fields;
      switch (file.contentType) {
        case 'image/jpeg':
          return (
            <figure>
              <picture>
                <source media="(max-width: 700px)" srcSet={`${file.url}?fit=fill&w=350&h=500`} />
                <source media="(min-width: 700px)" srcSet={file.url} />
                <img src={file.url} alt={title} />
              </picture>
              <figcaption dangerouslySetInnerHTML={{ __html: description }} />
            </figure>
          );
      }
    },
  },
};

export const render = (document: Document): ReactNode => documentToReactComponents(document, options);
