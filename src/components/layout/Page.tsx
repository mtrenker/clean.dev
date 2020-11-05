import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { useSpring, animated } from 'react-spring';

import { useGetPageQuery } from '../../graphql/hooks';
import { Header } from './Header';
import { Footer } from './Footer';
import { mapWidgets } from '../../lib/contentful';
import { ErrorBoundary } from './ErrorBoundary';
import { useTheme, css } from '../../lib/style';
import CloseIcon from '../../assets/icons/cross-circle.svg';

export const Page: FC = () => {
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const { css: { containerCss } } = useTheme();
  const { pathname } = useLocation();
  const page = pathname.split('/')[1];
  const { data, error } = useGetPageQuery({ variables: { slug: `/${page}` } });

  const [{ offsetLeft, offsetRight, opacity }, set] = useSpring(() => ({ offsetLeft: 0, offsetRight: 0, opacity: 1 }));

  if (!data) return <p>Loading</p>;
  const document = data?.getPage?.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });

  const renderContent = () => {
    if (data.getPage?.layout === 'container') {
      return <div css={containerCss}>{content}</div>;
    }
    return content;
  };

  const onCloseMenuClick = () => {
    set({ offsetRight: 0, offsetLeft: 0, opacity: 1 });
    setSideMenuOpen(false);
  };

  const onHeaderMenuClick = () => {
    setSideMenuOpen(!sideMenuOpen);
    if (sideMenuOpen) {
      set({ offsetRight: 0, offsetLeft: 0, opacity: 1 });
    } else {
      set({ offsetRight: 275, offsetLeft: -275, opacity: 0.5 });
    }
  };

  return (
    <div css={pageCss}>
      <nav className="mobile-navigation">
        <CloseIcon onClick={() => onCloseMenuClick()} />
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>
      </nav>
      <animated.main className="page-content" style={{ left: offsetLeft, right: offsetRight, opacity }}>
        <Header onMenuClick={onHeaderMenuClick} />
        {error && <p>{error.message}</p>}
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
        <Footer />
      </animated.main>
    </div>
  );
};

const pageCss = css`
  .mobile-navigation {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #000;
    svg {
      cursor: pointer;
      position: absolute;
      top: 15px;
      right: 15px;
      fill: #FFF;
      width: 32px;
      height: 32px;
    }
  }

  .page-content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #fff;
  }
`;
