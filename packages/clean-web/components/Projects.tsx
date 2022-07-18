export interface ProjectsProps {
  projects: Project[];
}

interface Project {
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => (
  <main className="m-4 md:m-0">
    <ul>
      {projects.map((project) => (
        <li
          className="my-6 first:mt-0 last:mb-0"
          key={project.title}
        >
          <div className="rounded p-6 ring-1 ring-slate-400">
            <h3 className="text-xl">{project.title}</h3>
            <p>{project.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  </main>
);
