import { Spinner } from "@/components/spinner";

const Loading = () => {
	return (
		<>
			<div className="h-full flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		</>
	);
};

export default Loading;
