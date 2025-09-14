import { AppSidebar } from "@/components/app-sidebar";
import AutoBreadcrumb from "@/components/custom-ui/auto-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export const LAYOUT_HEIGHT = "h-[calc(100vh-64px)]";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<AutoBreadcrumb />
					</div>
				</header>
				<div className={`flex flex-col gap-6 pt-0 ${LAYOUT_HEIGHT}`}>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
