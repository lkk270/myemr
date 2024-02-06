import { Spinner } from "@/components/spinner";

const Loading = () => {
  return (
    <>
      <div className="fixed left-[50%] top-[50%]">
        <Spinner size="lg" />
      </div>
    </>
  );
};

export default Loading;
