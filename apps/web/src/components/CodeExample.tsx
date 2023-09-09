import React from 'react';
import { highlight, languages } from 'prismjs';
import { getFile } from '@/lib/github/client';

import 'prismjs/themes/prism-dark.min.css';

interface CodeExampleProps {
  expression: string;
}

const getCode = async (expression: string) => {
  const file = await getFile({
    owner: "mtrenker",
    name: "clean.dev",
    expression,
  });

  if (file.repository?.object?.__typename === 'Blob' && file.repository.object.text) {
    const code = highlight(file.repository.object.text, languages['javascript'], 'javascript');
    return code
  }
  return '';
};

export const CodeExample: React.FC<CodeExampleProps> = async ({ expression }) => {
  const code = await getCode(expression);
  return (
    <pre className='line-numbers'>
      <code className="language-javascript" dangerouslySetInnerHTML={{__html: code}} />
    </pre>
  )
};
