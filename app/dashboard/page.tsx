import Container from "@/components/custom-ui/container";
import { SettingsPanel } from "./components/settings-panel";

export default function Page() {
	return (
		<Container>
			{/* Settings Panel */}
			<div className="mb-6">
				<SettingsPanel />
			</div>
		</Container>
	);
}
