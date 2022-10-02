import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

export interface CodeProps {
  className?: string;
  language: string;
}

export const Code: React.FC<React.PropsWithChildren<CodeProps>> = ({ children, language }) => {
  const codeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, []);
  return (
    <code className={`language-${language}`} ref={codeRef}>
      {children}
    </code>
  );
};
