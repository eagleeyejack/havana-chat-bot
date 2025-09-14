import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, BookOpen } from "lucide-react";
import { ApiMessage } from "@/lib/api/api.messages";
import { KB, type KBEntry } from "@/lib/static/knowledge-base";

/**
 * Parse message metadata to extract KB sources and other information
 */
function parseMessageMeta(meta: string | null) {
	if (!meta) return null;
	try {
		return JSON.parse(meta);
	} catch {
		return null;
	}
}

/**
 * Get KB entries by their IDs
 */
function getKBEntriesByIds(ids: string[]): KBEntry[] {
	return KB.filter((entry) => ids.includes(entry.id));
}

/**
 * Aggregate KB usage across all messages in the conversation
 */
function aggregateKBUsage(
	messages: ApiMessage[]
): Record<string, { entry: KBEntry; count: number }> {
	const usage: Record<string, { entry: KBEntry; count: number }> = {};

	messages
		.filter((msg) => msg.role === "bot" && msg.meta)
		.forEach((msg) => {
			const meta = parseMessageMeta(msg.meta);
			if (meta?.sources) {
				meta.sources.forEach((sourceId: string) => {
					const entry = KB.find((kb) => kb.id === sourceId);
					if (entry) {
						if (usage[sourceId]) {
							usage[sourceId].count++;
						} else {
							usage[sourceId] = { entry, count: 1 };
						}
					}
				});
			}
		});

	return usage;
}

/**
 * Component to display aggregated KB usage summary in the header
 */
export function KBUsageSummary({ messages }: { messages: ApiMessage[] }) {
	const kbUsage = aggregateKBUsage(messages);
	const usageEntries = Object.values(kbUsage);

	if (usageEntries.length === 0) return null;

	const totalReferences = usageEntries.reduce(
		(sum, { count }) => sum + count,
		0
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-2 text-xs text-gray-600 hover:text-gray-800"
				>
					<BookOpen className="h-3 w-3 mr-1" />
					{usageEntries.length} Knowledge Base topic
					{usageEntries.length !== 1 ? "s" : ""} • {totalReferences} reference
					{totalReferences !== 1 ? "s" : ""}
					<ChevronDown className="h-3 w-3 ml-1" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-80">
				<div className="p-3">
					<div className="text-xs font-medium text-gray-700 mb-2">
						Knowledge Base Usage Summary:
					</div>
					<div className="space-y-2 max-h-64 overflow-y-auto">
						{usageEntries
							.sort((a, b) => b.count - a.count) // Sort by usage count
							.map(({ entry, count }) => (
								<div
									key={entry.id}
									className="flex items-center justify-between text-xs bg-gray-50 px-2 py-2 rounded"
								>
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate">{entry.title}</div>
										<div className="text-gray-500 text-xs truncate">
											{entry.keywords.slice(0, 2).join(", ")}
										</div>
									</div>
									<Badge variant="secondary" className="text-xs ml-2">
										{count}x
									</Badge>
								</div>
							))}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Component to display KB sources inline with bot message metadata
 */
export function InlineKBSources({ meta }: { meta: string | null }) {
	const parsedMeta = parseMessageMeta(meta);

	if (!parsedMeta) return null;

	const { sources = [], escalationSuggested, bookingSuggested } = parsedMeta;

	const kbEntries = getKBEntriesByIds(sources);
	const hasKBSources = sources.length > 0 && kbEntries.length > 0;
	const hasMetadata = escalationSuggested || bookingSuggested;

	if (!hasKBSources && !hasMetadata) return null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto p-0 text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
				>
					<BookOpen className="h-3 w-3 mr-1" />
					{hasKBSources && (
						<span>
							{sources.length} source{sources.length !== 1 ? "s" : ""}
						</span>
					)}
					{hasKBSources && hasMetadata && <span className="mx-1">•</span>}
					{hasMetadata && <span>flags</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" side="top" align="start">
				<div className="space-y-3">
					{/* KB Sources */}
					{hasKBSources && (
						<div className="space-y-2">
							<div className="text-xs font-medium text-gray-700">
								Knowledge Sources:
							</div>
							{kbEntries.map((entry) => (
								<div
									key={entry.id}
									className="text-xs bg-blue-50 text-blue-800 px-2 py-2 rounded border-l-2 border-blue-200"
								>
									<div className="font-medium">{entry.title}</div>
									<div className="text-blue-600 opacity-75 mt-1">
										Keywords: {entry.keywords.slice(0, 3).join(", ")}
										{entry.keywords.length > 3 &&
											` (+${entry.keywords.length - 3} more)`}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Response Flags */}
					{hasMetadata && (
						<div className="space-y-2">
							<div className="text-xs font-medium text-gray-700">
								Response Flags:
							</div>
							<div className="flex flex-wrap gap-1">
								{escalationSuggested && (
									<Badge className="bg-orange-100 text-orange-800 text-xs">
										Escalation Suggested
									</Badge>
								)}
								{bookingSuggested && (
									<Badge className="bg-green-100 text-green-800 text-xs">
										Booking Suggested
									</Badge>
								)}
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
