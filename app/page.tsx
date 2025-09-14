import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-4">
				<Button asChild>
					<Link href="/student">Student Chat View</Link>
				</Button>

				<Button asChild>
					<Link href="/dashboard">Dashboard View</Link>
				</Button>
			</main>
		</div>
	);
}
