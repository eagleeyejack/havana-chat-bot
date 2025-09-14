import { LAYOUT_HEIGHT } from "@/app/dashboard/layout";

const Container = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className={`container mx-auto p-4 ${LAYOUT_HEIGHT}`}>{children}</div>
	);
};

export default Container;
