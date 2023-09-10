import React from 'react';
import { highlight, languages } from 'prismjs';
import { getFile } from '@/lib/github/client';

import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-dark.min.css';


interface CodeExampleProps {
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
    const code = highlight(file.repository.object.text, languages['typescript'], 'typescript');
    return code
  }
  return '';
};

export const CodeExample: React.FC<CodeExampleProps> = async ({ owner, repo, expression }) => {
  const code = await getCode(owner, repo, expression);
  return (
    <pre className='line-numbers'>
      <code className="language-javascript" dangerouslySetInnerHTML={{__html: code}} />
    </pre>
  )
};
