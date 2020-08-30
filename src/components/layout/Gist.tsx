/* eslint-disable camelcase */
/* eslint-disable react/no-danger */
import React, {
  FC, useEffect, useRef, useState,
} from 'react';

export interface GistProps {
  gistId: string;
  title: string;
}

interface GistBody {
  created_at: string;
  description: string;
  div: string;
  files: string[];
  owner: string;
  public: string;
  stylesheet: string;
}

export const Gist: FC<GistProps> = ({ gistId, title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [gist, setGist] = useState<GistBody>();
  useEffect(() => {
    (window as any).parseGist = (body: GistBody) => {
      setGist(body);
    };
    const url = `https://gist.github.com/mtrenker/${gistId}.json?callback=parseGist`;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    ref.current?.appendChild(script);

    document.querySelectorAll('.gist .blob-num');
  }, [gistId]);
  console.log(gist);

  return (
    <div ref={ref}>
      <h2>{title}</h2>
      { gist && (
        <>
          <link rel="stylesheet" href={gist.stylesheet} />
          <p>{gist.description}</p>
          <div dangerouslySetInnerHTML={{ __html: gist.div }} />
        </>
      )}
    </div>
  );
};
