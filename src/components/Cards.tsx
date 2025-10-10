import clsx from "clsx";

interface Project {
  type: string;
  name: string;
  link: string;
  description?: string;
}

const ProjectCard = ({ project }: { project: Project }) => {
  return project.type === "web" ? (
    <>
      <div className="card gap-2">
        <h3 className="card-title text-xl lexend-deca-bold">{project.name}</h3>
        <a
          href={project.link}
          target="_blank"
          className="text-md lexend-deca-regular underline"
          rel="noopener noreferrer"
        >
          {project.link}
        </a>
        <p className="p-4 bg-neutral-100 rounded-lg">{project.description}</p>
      </div>
    </>
  ) : project.type === "graphic" ? (
    <div className="card">
      <h3 className="card-title text-xl lexend-deca-bold">{project.name}</h3>
      <img src={project.link} alt={project.name} />
    </div>
  ) : null;
};

const ProjectCardGroup = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        {projects.map((project) =>
          project.type === "web" ? (
            <ProjectCard key={project.name} project={project} />
          ) : null,
        )}
      </div>
      <div className="flex gap-4">
        {projects.map((project) =>
          project.type === "graphic" ? (
            <ProjectCard key={project.name} project={project} />
          ) : null,
        )}
      </div>
    </div>
  );
};

const ContentCard = ({
  title,
  description,
  icon,
  headerBgColor = "bg-accent",
  isPopover = false,
  reverse = false,
  onClick,
  onClose = () => {},
  reference,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  headerBgColor: string;
  isPopover?: boolean;
  reverse?: boolean;
  onClick: () => void;
  onClose?: () => void;
  reference?: React.ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "card h-fit cursor-pointer rounded-t-xl",
        isPopover
          ? "shadow-xl md:max-w-1/2 md:min-w-70 w-5/6 max-h-[500px] md:max-h-full overflow-y-auto"
          : "",
      )}
      onClick={onClick}
    >
      <figure
        className={clsx(
          "text-4xl p-8 gap-4 flex items-center justify-center",
          headerBgColor,
          reverse ? "text-black" : "text-white",
          isPopover ? "rounded-t-xl" : "rounded-none",
        )}
      >
        <span>{icon}</span>{" "}
        <h2 className="card-title text-3xl text caveat-semibold">{title}</h2>
      </figure>
      {description && (
        <div className="card-body lexend-deca-light bg-base-100 rounded-b-xl flex flex-col gap-2">
          <p className="text-lg text-center">{description}</p>
          <div className="divider divider-content-base text-lg lexend-deca-bold">
            Reference
          </div>
          {reference}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn btn-soft btn-primary"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export { ContentCard, ProjectCard, ProjectCardGroup, type Project };
