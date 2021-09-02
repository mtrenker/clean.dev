import { css } from '@emotion/react';
import {
  useEffect, useRef, FC, VFC,
} from 'react';
import {
  Link, NavLink, NavLinkProps, useParams,
} from 'react-router-dom';

import me from '../../assets/me.png';
import { Button } from '../controls/Button';

interface HeroOfferProps {
  title: string;
  to: string;
  className: string;
}

const passions = [
  'clean code',
  'agile',
  'automating',
  'mentoring',
  'experimenting',
  'growing',
  'the web',
  'the cloud',
  'theory of constraints',
];

const heroCss = css`
  --hero-grid:
    "cloud-title"     32px
    "cloud-content"   calc(100vh - 32px)
    "product-title"   32px
    "product-content" calc(100vh - 32px)
    "agile-title"     32px
    "agile-content"   calc(100vh - 32px)
    / 1fr
  ;
  --hero-wrap: wrap;
  --hero-gap: 16px;
  --hero-image-order: 0;
  --hero-title-size: 32px;
  --hero-subtitle-size: 24px;
  --hero-text-length: 100%;
  --hero-caption-height: calc(100vh - 75px);
  --hero-offer-animation-display: block;
  @media(min-width: 1200px) {
    --hero-grid:
      "cloud-title    product-title   agile-title"    auto
      "cloud-content  product-content agile-content"  auto
      / 1fr 1fr 1fr
    ;
    --hero-wrap: nowrap;
    --hero-gap: 40px;
    --hero-image-order: 0;
    --hero-title-size: 56px;
    --hero-subtitle-size: 40px;
    --hero-text-length: 100%;
    --hero-caption-height: 100%;
    --hero-offer-animation-display: none;
  }
  background-color: var(--surface2);
  .hero-main {
    figure {
      align-items: center;
      display: flex;
      flex-wrap: var(--hero-wrap);
      gap: var(--hero-gap);
      margin: 0;
      justify-content: center;
      img {
        order: var(--hero-image-order);
        max-height: 50vh;
      }
      figcaption {
        height: var(--hero-caption-height);
        h1, h2, p {
          width: var(--hero-text-length);
        }
        h1 {
          color: var(--text1);
          font-size: var(--hero-title-size);
          font-weight: bold;
        }
        h2 {
          color: var(--text1);
          font-size: var(--hero-subtitle-size);
          font-weight: bold;
          span {
            color: var(--text2);
          }
        }
        p {
          color: var(--text1);
          margin-bottom: 40px;
          max-width: 65ch;
        }
      }
    }
  }
  .offers {
    background-color: var(--surface3);
    padding: 18px 0;
    dl {
      margin: 0 auto;
      display: grid;
      grid-template: var(--hero-grid);
      gap: var(--hero-gap);
      dt {
        scroll-snap-align: start;
        align-self: center;
        &.cloud {
          grid-area: cloud-title;
        }
        &.process {
          grid-area: process-title;
        }
        &.product {
          grid-area: product-title;
        }
        &.agile {
          grid-area: agile-title;
        }
      }
      dd {
        margin: 0;
        figure {
          display: var(--hero-offer-animation-display);
        }
        &.cloud {
          grid-area: cloud-content;
        }
        &.process {
          grid-area: process-content;
        }
        &.product {
          grid-area: product-content;
        }
        &.agile {
          grid-area: agile-content;
        }
      }
      dt.active {
        position: relative;
        :before {
          position: absolute;
          content: "";
          width: 100px;
          height: 100px;
          top: -14px;
          left: calc(50% - 50px);
          background-color: var(--surface3);
          border: 30px solid var(--surface3);
          transform: rotate(45deg);
          clip-path: polygon(0 0, 50% 0, 0 50%);
        }
      }
      a {
        color: inherit;
      }
    }
  }
`;

const HeroTitle: FC<NavLinkProps> = ({ className, href = '/', children }) => (
  <dt className={className}>
    <Link to={href}>{children}</Link>
  </dt>
);

const HeroOffer: FC<HeroOfferProps> = ({
  className, title, to, children,
}) => (
  <>
    <NavLink to={to} className={className} component={HeroTitle}>
      {title}
    </NavLink>
    <dd className={className}>
      {children}
    </dd>
  </>
);

const DefaultHero: VFC = () => (
  <figure>
    <img src={me} alt="" />
    <figcaption>
      <h1>Hi, I&apos;m Martin</h1>
      <h2>
        I am passionate about
        {' '}
        <span>clean code</span>
      </h2>
      <p>
        My approach to software development focuses on people, autonomy, trust and ownership.
        Combined with automation, continous improvements, product thinking
        and an scientific approach to solving problems, almost everything can be achived.
        <br />
        Let&apos;s build awesome projects together.
      </p>
      <Button type="primary">Get in touch</Button>
    </figcaption>
  </figure>
);

const ServerlessHero: VFC = () => (
  <figure>SERVERLESS</figure>
);

const ProductHero: VFC = () => (
  <figure>Product</figure>
);

const AgileHero: VFC = () => (
  <figure>Agile</figure>
);

type HeroCategory = 'serverless-enthusiast' |'product-thinker' | 'agile-coach'

const renderHero = (cateogry: HeroCategory): JSX.Element => {
  switch (cateogry) {
    case 'serverless-enthusiast':
      return <ServerlessHero />;
    case 'product-thinker':
      return <ProductHero />;
    case 'agile-coach':
      return <AgileHero />;
    default:
      return <DefaultHero />;
  }
};

export const Hero: VFC = () => {
  const passion = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const container = passion.current;
    if (container) {
    }
  }, [passion]);
  const { category } = useParams<{category: HeroCategory}>();
  return (
    <section css={heroCss}>
      <div className="container hero-main">
        {renderHero(category)}
      </div>
      <div className="offers">
        <dl className="container">
          <HeroOffer className="cloud" to="/serverless-enthusiast" title="Serverless Enthusiast">
            <p>
              Unleash the power of cloud computing within your organization
              and enable your teams to focus on what really counts:
              {' '}
              <em>delivering quality</em>
              .
            </p>
          </HeroOffer>
          <HeroOffer className="product" to="/product-thinker" title="Product Thinker">
            With a serverless infrastructure and an agile mindset, product thinking is the final
            indegrience for success. Hypothesis driven development, understanding the customer
            as well as the product and continouisly improving the value for all stakeholders.
          </HeroOffer>
          <HeroOffer className="agile" to="/agile-coach" title="Agile Coach">
            Empowering teams to rise to their fullest potentency is challanging,
            I can help making the transistion if your organization is serious about becoming a
            workplace where
          </HeroOffer>
        </dl>
      </div>
    </section>
  );
};
