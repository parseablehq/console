import { QueryType } from "@/pages/Stream/providers/FilterProvider";

export type SavedFilterType = {
	version: string;
	stream_name: string;
    filter_name: string,
    filter_id: string,
	query: {
        filter_type: 'sql' | 'builder';
        filter_query?: string;
        filter_builder?: QueryType
    }
    time_filter: {
        from?: string,
        to?:  string
    }   
}
