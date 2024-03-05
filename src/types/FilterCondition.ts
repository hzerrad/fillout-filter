export const filterConditions = ['equals', 'does_not_equal', 'greater_than', 'less_than'] as const;
export type FilterCondition = (typeof filterConditions)[number];
