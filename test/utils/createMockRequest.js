// Helper function to create a mock NextRequest for testing
export function createMockRequest(url) {
	const urlObj = new URL(url);
	const request = {
		nextUrl: {
			searchParams: urlObj.searchParams,
		},
		url: url,
	};
	return request;
}
