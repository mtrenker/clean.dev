import { animated, useSpring} from '@react-spring/web';

export type StoryProps = React.HTMLAttributes<SVGRectElement>;

export const Story: React.FC<StoryProps> = (props) => {
  return (
    <animated.rect {...props}>
      test
    </animated.rect>
  );
}
