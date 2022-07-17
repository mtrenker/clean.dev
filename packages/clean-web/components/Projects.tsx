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
  <main>
    {projects.map((project) => (
      <article
        className="flex"
        key={project.title}
      >
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
      </article>
    ))}
  </main>
);
