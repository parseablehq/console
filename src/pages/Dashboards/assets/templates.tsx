import { ImportDashboardType } from '@/@types/parseable/api/dashboards';

const pmetaConfig = {
	name: 'Metadata Dashboard Template',
	description: '',
	time_filter: null,
	refresh_interval: 60,
	tiles: [
		{
			name: 'Events Ingested for Each Ingestor',
			description: 'Events Ingested for Each Ingestor',
			query: 'select MAX(parseable_events_ingested), address from pmeta GROUP BY address LIMIT 100',
			order: 1,
			visualization: {
				visualization_type: 'donut-chart' as 'donut-chart',
				circular_chart_config: {
					name_key: 'address',
					value_key: 'MAX(pmeta.parseable_events_ingested)',
				},
				graph_config: null,
				size: 'sm',
				color_config: [],
				tick_config: [],
			},
		},
		{
			name: 'Event Count Over Time',
			description: 'Event Count Over Time',
			query:
				"select a.time,SUM(a.current_events) as current_events, SUM(a.lifetime_events) as lifetime_events, SUM(a.deleted_events) as deleted_events from (select MAX(parseable_events_ingested) as current_events, MAX(parseable_lifetime_events_ingested) as lifetime_events, MAX(parseable_deleted_events_ingested) as deleted_events, DATE_BIN('10 minutes', p_timestamp, NOW()) AS time from pmeta where address='http://parseable-ing-8yvv-0.parseable-ingestor-headless.demo.svc.cluster.local:8000/' group by time order by time) a GROUP BY a.time ORDER BY a.time LIMIT 100",
			order: 2,
			visualization: {
				visualization_type: 'bar-chart' as 'bar-chart',
				circular_chart_config: null,
				graph_config: {
					x_key: 'time',
					y_keys: ['lifetime_events', 'current_events', 'deleted_events'],
					graph_type: 'default',
					orientation: 'horizontal',
				},
				size: 'lg',
				color_config: [
					{
						field_name: 'lifetime_events',
						color_palette: 'indigo',
					},
					{
						field_name: 'current_events',
						color_palette: 'orange',
					},
					{
						field_name: 'deleted_events',
						color_palette: 'teal',
					},
				],
				tick_config: [
					{
						key: 'time',
						unit: 'utc-timestamp',
					},
				],
			},
		},
		{
			name: 'Memory for Each Ingestor',
			description: 'Memory for Each Ingestor',
			query: 'SELECT MAX(process_resident_memory_bytes) as memory_usage, address FROM pmeta GROUP BY address LIMIT 100',
			order: 3,
			visualization: {
				visualization_type: 'pie-chart' as 'pie-chart',
				circular_chart_config: {
					name_key: 'address',
					value_key: 'memory_usage',
				},
				graph_config: null,
				size: 'sm',
				color_config: [],
				tick_config: [],
			},
		},
		{
			name: 'Event Size Over Time',
			description: 'Event Size Over Time',
			query:
				"select a.time, SUM(a.current_events_size) as current_events_size, SUM(a.lifetime_events_size) as lifetime_events_size, SUM(a.deleted_events_size) as deleted_events_size from (select MAX(parseable_events_ingested_size) as current_events_size, MAX(parseable_lifetime_events_ingested_size) as lifetime_events_size, MAX(parseable_deleted_events_ingested_size) as deleted_events_size, DATE_BIN('10 minutes', p_timestamp, NOW()) AS time from pmeta where address='http://parseable-ing-8yvv-0.parseable-ingestor-headless.demo.svc.cluster.local:8000/' group by time order by time) a GROUP BY a.time ORDER BY a.time LIMIT 100",
			order: 4,
			visualization: {
				visualization_type: 'bar-chart' as 'bar-chart',
				circular_chart_config: null,
				graph_config: {
					x_key: 'time',
					y_keys: ['lifetime_events_size', 'current_events_size', 'deleted_events_size'],
					graph_type: 'default',
					orientation: 'horizontal',
				},
				size: 'lg',
				color_config: [
					{
						field_name: 'lifetime_events_size',
						color_palette: 'indigo',
					},
					{
						field_name: 'current_events_size',
						color_palette: 'orange',
					},
					{
						field_name: 'deleted_events_size',
						color_palette: 'teal',
					},
				],
				tick_config: [
					{
						key: 'time',
						unit: 'utc-timestamp',
					},
					{
						key: 'lifetime_events_size',
						unit: 'bytes',
					},
					{
						key: 'current_events_size',
						unit: 'bytes',
					},
					{
						key: 'deleted_events_size',
						unit: 'bytes',
					},
				],
			},
		},
		{
			name: 'Ingested Size and Storage Size',
			description: 'Ingested Size and Storage Size',
			query:
				"SELECT MAX(parseable_events_ingested_size) as current_events_size, MAX(parseable_storage_size_data) as current_data_size FROM pmeta where address='http://ec2-3-15-172-147.us-east-2.compute.amazonaws.com:443/' LIMIT 100",
			order: 5,
			visualization: {
				visualization_type: 'table' as 'table',
				circular_chart_config: null,
				graph_config: null,
				size: 'sm',
				color_config: [],
				tick_config: [
					{
						key: 'current_events_size',
						unit: 'bytes',
					},
					{
						key: 'current_data_size',
						unit: 'bytes',
					},
				],
			},
		},
		{
			name: 'Memory Over Time',
			description: 'Memory Over Time',
			query:
				"select DATE_BIN('10 minutes', p_timestamp, NOW()) AS time, MAX(process_resident_memory_bytes) as process_resident_memory_bytes from pmeta where address='http://parseable-ing-8yvv-0.parseable-ingestor-headless.demo.svc.cluster.local:8000/' group by time order by time LIMIT 100",
			order: 6,
			visualization: {
				visualization_type: 'bar-chart' as 'bar-chart',
				circular_chart_config: null,
				graph_config: {
					x_key: 'time',
					y_keys: ['process_resident_memory_bytes'],
					graph_type: 'default',
					orientation: 'horizontal',
				},
				size: 'lg',
				color_config: [
					{
						field_name: 'process_resident_memory_bytes',
						color_palette: 'blue',
					},
				],
				tick_config: [
					{
						key: 'time',
						unit: 'utc-timestamp',
					},
					{
						key: 'process_resident_memory_bytes',
						unit: 'bytes',
					},
				],
			},
		},
	],
};

export const templates: ImportDashboardType[] = [pmetaConfig];
