import {
  Fragment,
  MouseEvent, useEffect, useRef, useState, VFC,
} from 'react';
import { useMachine } from '@xstate/react';

import { fromEvent, map } from 'rxjs';
import s3icon from '../../assets/icons/aws/s3.png';

import { ecsMachine, Vector2D } from '../../machines/ecsMachine';

export const Agile: VFC = () => {
  const [startTime] = useState<number>(new Date().getTime());
  const currentTime = new Date().getTime();
  const deltaTime = currentTime - startTime;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [current, send] = useMachine(ecsMachine);

  const doSomething = (e: MouseEvent<HTMLButtonElement>) => {
    const type = e.currentTarget.value;

    switch (type) {
      case 'addDeveloper': {
        const entity = {
          id: 'developer',
          components: [
            {
              name: 'icon',
              data: {
                iconSrc: s3icon,
              },
            }, {
              name: 'position',
              data: {
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
              },
            },
          ],
        };
        send({ type: 'ADD_ENTITY', entity });
        break;
      }
      case 'move': {
        send({
          type: 'ADD_COMPONENT',
          entity: { id: 'developer' },
          component: {
            name: 'move',
            data: {
              to: [
                1,
                1,
              ],
            },
          },
        });
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (canvasRef.current && ctx) {
      send({ type: 'SETUP', ctx });
      fromEvent<MouseEvent<HTMLCanvasElement>>(canvasRef.current, 'click').pipe(
        map((e) => {
          const { top, left } = e.currentTarget.getBoundingClientRect();
          return [e.pageX - left, e.pageY - top] as Vector2D;
        }),
      ).subscribe((position) => {
        send({ type: 'CLICK', position });
      });
    }
  }, [canvasRef, send]);

  const deltaSeconds = deltaTime / 1000;

  const fps = Math.round(current.context.ticks / deltaSeconds);

  return (
    <div>
      <canvas ref={canvasRef} />
      <p>{`Currently ${current.context.entities.length} entities in context`}</p>
      <div>
        <button type="button" value="addDeveloper" onClick={doSomething}>Add Feature</button>
        <button type="button" value="move" onClick={doSomething}>Move Feature</button>
        <button type="button" value="move" onClick={() => send('STOP')}>STOP</button>
      </div>
      <pre>
        {current.context.ticks}
        {' '}
        /
        {fps}
        {' '}
        fps
        {current.context.entities.map((entity) => (
          <div key={entity.id}>
            <p>
              id:
              {entity.id}
            </p>
            <div>
              components:
              <dl>
                {entity.components.map((component) => (
                  <Fragment key={component.name}>
                    <dt>{component.name}</dt>
                    <dd>{JSON.stringify(component.data)}</dd>
                  </Fragment>
                ))}
              </dl>

            </div>
          </div>
        ))}
      </pre>
    </div>
  );
};
