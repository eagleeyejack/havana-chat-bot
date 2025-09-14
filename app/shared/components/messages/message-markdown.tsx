"use client";

import ReactMarkdown from "react-markdown";

interface MessageContentProps {
	content: string;
	role: "student" | "bot" | "admin";
	adminView?: boolean;
}

export default function MessageContent({
	content,
	role,
	adminView = false,
}: MessageContentProps) {
	// Determine if message is on colored background (in admin view)
	const isOnColoredBg =
		adminView && (role === "bot" || role === "admin" || role === "student");
	// Only render markdown for bot and human (admin) messages, keep student messages as plain text
	if (role === "student") {
		return <div className="text-sm">{content}</div>;
	}

	return (
		<div className="text-sm">
			<ReactMarkdown
				components={{
					// Custom styling for markdown elements to match chat bubble styling
					p: ({ children }) => (
						<p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
					),
					strong: ({ children }) => (
						<strong className="font-bold">{children}</strong>
					),
					em: ({ children }) => <em className="italic">{children}</em>,
					ul: ({ children }) => (
						<ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
					),
					ol: ({ children }) => (
						<ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
					),
					li: ({ children }) => (
						<li className="text-sm leading-relaxed">{children}</li>
					),
					code: ({ children }) => (
						<code
							className={`px-1.5 py-0.5 rounded text-xs font-mono ${
								isOnColoredBg
									? "bg-black bg-opacity-20 text-white"
									: role === "bot"
									? "bg-gray-300 text-gray-900"
									: "bg-green-300 text-green-900"
							}`}
						>
							{children}
						</code>
					),
					pre: ({ children }) => (
						<pre
							className={`p-2 rounded text-xs font-mono overflow-x-auto mb-2 ${
								isOnColoredBg
									? "bg-black bg-opacity-20 text-white"
									: role === "bot"
									? "bg-gray-300 text-gray-900"
									: "bg-green-300 text-green-900"
							}`}
						>
							{children}
						</pre>
					),
					blockquote: ({ children }) => (
						<blockquote
							className={`border-l-4 pl-4 italic mb-2 ${
								isOnColoredBg
									? "border-white border-opacity-50"
									: role === "bot"
									? "border-gray-400"
									: "border-green-400"
							}`}
						>
							{children}
						</blockquote>
					),
					h1: ({ children }) => (
						<h1 className="text-base font-bold mb-2 mt-1">{children}</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-sm font-bold mb-2 mt-1">{children}</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>
					),
					h4: ({ children }) => (
						<h4 className="text-sm font-semibold mb-1">{children}</h4>
					),
					h5: ({ children }) => (
						<h5 className="text-sm font-semibold mb-1">{children}</h5>
					),
					h6: ({ children }) => (
						<h6 className="text-sm font-semibold mb-1">{children}</h6>
					),
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={`underline hover:no-underline ${
								isOnColoredBg
									? "text-white text-opacity-90 hover:text-white"
									: "text-blue-600 hover:text-blue-800"
							}`}
						>
							{children}
						</a>
					),
					hr: () => (
						<hr
							className={`my-2 ${
								isOnColoredBg
									? "border-white border-opacity-30"
									: role === "bot"
									? "border-gray-400"
									: "border-green-400"
							}`}
						/>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
