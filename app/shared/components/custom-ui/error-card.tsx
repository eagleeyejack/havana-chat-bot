"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
	title: string;
	error: string;
	onClick?: () => void;
}

export default function ErrorCard({ title, error, onClick }: ErrorCardProps) {
	return (
		<div className="flex items-center justify-center p-8">
			<div className="text-center">
				<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
				<h2 className="text-lg font-semibold text-gray-900 mb-2">
					Error Loading {title}
				</h2>
				<p className="text-gray-500 mb-4">{error}</p>
				{onClick && <Button onClick={onClick}>Retry</Button>}
			</div>
		</div>
	);
}
