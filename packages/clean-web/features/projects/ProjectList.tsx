import Image from 'next/image';
import Link from 'next/link';

import { projects } from '../../data/projects';

export const ProjectList: React.FC = () => (
  <main className="m-4 md:m-0">
    <ul className="max-w-md">
      {projects.map((project) => (
        <li
          className="my-6 first:mt-0 last:mb-0"
          key={project.title}
        >
          <div className="flex flex-col bg-slate-900 shadow">
            <div>
              <Image
                alt=""
                className="clip-hexagon"
                height={125}
                objectFit="cover"
                src={`https://picsum.photos/1000?random=${Math.random()}`}
                width={125}
              />
            </div>
            <div className="flex flex-col gap-3 p-4">
              <h3 className="text-lg font-bold">{project.title}</h3>
              <div className="flex justify-between gap-1">
                {project.highlights.map((technology) => (
                  <span className="rounded bg-slate-400 p-1 text-sm text-slate-900" key={technology}>{technology}</span>
                ))}
              </div>
              <p className="">{project.description}</p>
              <Link href="#" passHref>
                <a className="text-end" href="/">
                  more &gt;
                </a>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </main>
);
