import { Spinner } from "@/components/loading/spinner";

const Loading = () => {
  return (
    <>
      <div className="fixed left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2">
        <Spinner size="lg" />
      </div>
    </>
  );
};

export default Loading;
