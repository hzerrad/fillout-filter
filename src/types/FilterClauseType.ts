import { FilterCondition } from './FilterCondition';

export type FilterClauseType = {
	id: string;
	condition: FilterCondition;
	value: number | string;
};
