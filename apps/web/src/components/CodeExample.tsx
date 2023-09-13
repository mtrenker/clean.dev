import React from 'react';
import clsx from 'clsx';
import { highlight, languages } from 'prismjs';
import { getFile } from '../lib/github/client';

import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism.min.css';

interface CodeExampleProps {
  name: string;
  description?: string | null;
  language?: string | null;
  code?: string;
  owner: string;
  repo: string;
  expression: string;
}

const getCode = async (owner: string, repo: string, expression: string) => {
  const file = await getFile({
    owner,
    name: repo,
    expression,
  });


  if (file.repository?.object?.__typename === 'Blob' && file.repository.object.text) {
    const code = highlight(file.repository.object.text, languages.typescript, 'typescript');
    return code
  }
  return '';
};

export const CodeExample: React.FC<CodeExampleProps> = async ({
  name,
  code,
  owner,
  repo,
  expression
}) => {
  const exampleCode = code ? highlight(code, languages.typescript, 'typescript') : await getCode(owner, repo, expression);

  return (
    <details
      className="bg-gray-200 rounded-lg my-2 max-w-[96vw] sm:max-w-none"
      open
    >
      <summary className="px-4 font-mono">
        {name}
      </summary>
      <pre
        className={clsx(
          'rounded-none bg-gray-100 m-0',
        )}
      >
        <code className="language-javascript" dangerouslySetInnerHTML={{__html: exampleCode}} />
      </pre>
    </details>
  )
};
