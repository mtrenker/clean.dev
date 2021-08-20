import { css } from '@emotion/react';
import { FC, forwardRef, VFC } from 'react';
import { Link, NavLink, NavLinkProps } from 'react-router-dom';
import me from '../../assets/me.png';

interface HeroOfferProps {
  title: string;
  to: string;
  className: string;
}

const heroCss = css`
  .offers {
    background-color: var(--surface3);
    padding: 18px 0;
    dl {
      margin: 0 auto;
      display: grid;
      grid-template:
        "cloud-title    process-title   product-title   agile-title"    auto
        "cloud-content  process-content product-content agile-content"  auto
        / 1fr 1fr 1fr 1fr
      ;
      gap: 32px 18px;
      dt {
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

const HeroTitle = forwardRef<HTMLDetailsElement, NavLinkProps>((props) => (
  <dt className={props.className}>
    <Link to={props.href ?? ''}>{props.children}</Link>
  </dt>
));

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

export const Hero: VFC = () => (
  <section css={heroCss}>
    <div className="container">
      <img src={me} alt="" />
    </div>
    <div className="offers">
      <dl className="container">
        <HeroOffer className="cloud" to="/cloud" title="Cloud Consulting">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </HeroOffer>
        <HeroOffer className="process" to="/process" title="Process Optimization">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </HeroOffer>
        <HeroOffer className="product" to="/product" title="Product Development">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </HeroOffer>
        <HeroOffer className="agile" to="/agile" title="Agile Consulting">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </HeroOffer>
      </dl>
    </div>
  </section>
);
