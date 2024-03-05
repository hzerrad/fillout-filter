export type SubmissionResponse = {
	responses: Submission[];
	totalResponses: number;
	pageCount: number;
};

type Submission = {
	submissionId: string;
	submissionTime: string;
	lastUpdatedAt: string;
	questions: SubmissionQuestion[];
	calculations: unknown[];
	urlParameters: unknown[];
	quiz: unknown;
	documents: unknown[];
};

type SubmissionQuestion = {
	id: string;
	name: string;
	type: string;
	value: string | number;
};
