import clsx from "clsx";

const ContentCard = ({
  title,
  description,
  icon,
  headerBgColor = "bg-accent",
  isPopover = false,
  reverse = false,
  onClick,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  headerBgColor: string;
  isPopover?: boolean;
  reverse?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={clsx(
        "card h-fit cursor-pointer rounded-t-xl",
        isPopover ? "shadow-xl md:w-96 w-5/6" : "",
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
        <div className="card-body lexend-deca-light bg-base-100 rounded-b-xl">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export { ContentCard };
