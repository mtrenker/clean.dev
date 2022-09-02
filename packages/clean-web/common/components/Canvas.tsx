import { Application, Sprite, Graphics } from 'pixi.js';
import { useEffect, useRef } from 'react';

export interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = () => {
  const app = useRef<Application>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      app.current = new Application({
        width: containerRef.current?.clientWidth || 0,
        height: containerRef.current?.clientHeight || 0,
        backgroundColor: 0x1099bb,
        resolution: window.devicePixelRatio,
      });

      if (containerRef.current.firstChild) {
        containerRef.current.replaceChild(app.current.view, containerRef.current.firstChild);
      } else {
        containerRef.current.appendChild(app.current.view);
      }


      app.current.loader.add('vercel.svg').load(() => {
        const sprite = new Sprite(app.current?.loader.resources['vercel.svg'].texture);
        sprite.x = 283;// app.current?.screen?.width || 100 / 2;
        sprite.y = 64 * 2.5;// app.current?.screen?.height || 100 / 2;
        sprite.anchor.set(0.5);

        const line = new Graphics();
        line.lineStyle(4, 0xff0000, 1);
        line.moveTo(0, 0);
        line.lineTo(100, 100);
        line.x = 10;
        line.y = 10;

        app.current?.stage.addChild(sprite);
        app.current?.stage.addChild(line);

        app.current?.ticker.add(() => {
          sprite.rotation += 0.01;
        });

      });
    }
  }, []);



  return (
    <div className="h-full w-full" ref={containerRef} />
  );
};
