"use client";

import { User } from "@/lib/db/schema";
import { useEffect, useState } from "react";

const StudentsPage = () => {
	const [students, setStudents] = useState<User[]>([]);

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const response = await fetch("/api/users?count=10");
				if (!response.ok) throw new Error("Failed to fetch students");
				const data = await response.json();
				setStudents(data.users);
			} catch (error) {
				console.error("Error fetching students:", error);
			}
		};
		fetchStudents();
	}, []);

	return (
		<div>
			<h1>Students</h1>
			<ul>
				{students.map((student) => (
					<li key={student.id}>{student.name}</li>
				))}
			</ul>
		</div>
	);
};

export default StudentsPage;
