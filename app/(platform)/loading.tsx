import { Spinner } from "@/components/spinner";

const Loading = () => {
  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    </>
  );
};

export default Loading;
