interface TermsParagraphProps {
  title: string;
  description?: string;
  headerClassName?: string;
  bullets?: string[];
}

export const TermsParagraph = ({
  title,
  description,
  headerClassName = "text-lg font-semibold",
  bullets,
}: TermsParagraphProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <h2 className={headerClassName ? headerClassName : "text-lg font-semibold"}>{title}</h2>
      {bullets ? (
        <ul className="list-disc list-inside space-y-2 pl-2">
          {bullets.map((bullet, index) => {
            return <li key={index}>{bullet}</li>;
          })}
        </ul>
      ) : (
        <p className="text-md">{description}</p>
      )}
    </div>
  );
};
