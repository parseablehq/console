import { Stack, Text, Table, Tooltip, Badge, ThemeIcon, Popover } from '@mantine/core';
import { FC, useEffect } from 'react';
import classes from './styles/Systems.module.css';
import { IconAlertCircle, IconBrandDatabricks, IconInfoCircleFilled, IconX } from '@tabler/icons-react';
import { HumanizeNumber, formatBytes } from '@/utils/formatBytes';
import { Axios } from '@/api/axios';
import text from './mock.txt';

const ingestorsData = [
	{
		status: 'online',
		errors: ['Error type 1', 'Error type 2'],
		totalMemory: 2147483648,
		consumedMemory: 1398102221,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-01-US-East',
		totalStorage: 128000000000,
		usedStorage: 110300000000,
		cpu: 49,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8001,
		filesCount: 2131231242,
		stagingDataSize: 42344234,
		parseable_events_ingested: [
			{
				format: 'json',
				stream: 'azureapimlog',
				value: 132,
			},
			{
				format: 'json',
				stream: 'backend',
				value: 27078249,
			},
			{
				format: 'json',
				stream: 'druide2e',
				value: 9416,
			},
			{
				format: 'json',
				stream: 'frontend',
				value: 27306182,
			},
		],
	},
	{
		status: 'online',
		errors: [],
		totalMemory: 4294967296,
		consumedMemory: 3422552064,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-02-US-East',
		totalStorage: 256000000000,
		usedStorage: 110000000000,
		cpu: 89,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8002,
		filesCount: 242423534,
		stagingDataSize: 23463246,
		parseable_events_ingested: [
			{
				format: 'json',
				stream: 'azureapimlog',
				value: 132,
			},
			{
				format: 'json',
				stream: 'backend',
				value: 27078249,
			},
			{
				format: 'json',
				stream: 'druide2e',
				value: 9416,
			},
			{
				format: 'json',
				stream: 'frontend',
				value: 27306182,
			},
		],
	},
	{
		status: 'offline',
		errors: [],
		totalMemory: 2147483648,
		consumedMemory: 945913408,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-03-US-East',
		totalStorage: 256000000000,
		usedStorage: 23400000000,
		cpu: 76,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8003,
		filesCount: 6456323,
		stagingDataSize: 321234,
		parseable_events_ingested: [
			{
				format: 'json',
				stream: 'azureapimlog',
				value: 132,
			},
			{
				format: 'json',
				stream: 'backend',
				value: 27078249,
			},
			{
				format: 'json',
				stream: 'druide2e',
				value: 9416,
			},
			{
				format: 'json',
				stream: 'frontend',
				value: 27306182,
			},
		],
	},
	{
		status: 'online',
		errors: [],
		totalMemory: 2147483648,
		consumedMemory: 214748364,
		ip: '127.0.0.1',
		region: 'US-East',
		name: 'Ingestor-04-US-East',
		totalStorage: 256000000000,
		usedStorage: 67830000000,
		cpu: 56,
		stagingDirectory: '/parseable/stage',
		store: '/parseable/data',
		port: 8004,
		filesCount: 7453744555,
		stagingDataSize: 9242349,
		parseable_events_ingested: [
			{
				format: 'json',
				stream: 'azureapimlog',
				value: 132,
			},
			{
				format: 'json',
				stream: 'backend',
				value: 27078249,
			},
			{
				format: 'json',
				stream: 'druide2e',
				value: 9416,
			},
			{
				format: 'json',
				stream: 'frontend',
				value: 27306182,
			},
		],
	},
];

function bytesToGiB(bytes: number, appendSuffix: boolean = true) {
	if (bytes === 0) return '0 GiB';

	const gigabytes = bytes / (1024 * 1024 * 1024);
	const prefix = gigabytes % 1 === 0 ? gigabytes : gigabytes.toFixed(1);

	if (!appendSuffix) return prefix;

	return `${prefix} GiB`;
}

const sanitizeBytes = (size: any) => {
	return formatBytes(size);
};

type UsageIndicatorProps = {
	label: string;
	percentage: number | null;
};

const parsedMetrics = {
	parseable_events_ingested: [
		{
			format: 'json',
			stream: 'azureapimlog',
			value: 132,
		},
		{
			format: 'json',
			stream: 'backend',
			value: 27078249,
		},
		{
			format: 'json',
			stream: 'druide2e',
			value: 9416,
		},
		{
			format: 'json',
			stream: 'frontend',
			value: 27306182,
		},
	],
	parseable_events_ingested_size: [
		{
			format: 'json',
			stream: 'azureapimlog',
			value: 287478,
		},
		{
			format: 'json',
			stream: 'backend',
			value: 8899325195,
		},
		{
			format: 'json',
			stream: 'druide2e',
			value: 5546280,
		},
		{
			format: 'json',
			stream: 'frontend',
			value: 7712739750,
		},
	],
	parseable_incoming_requests: [
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			value: 12,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			value: 491,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			value: 3,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			value: 13,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			value: 2,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			value: 1,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			value: 70,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			value: 1,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			value: 3,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			value: 64,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			value: 13,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			value: 37,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			value: 14,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			value: 3,
		},
	],
	parseable_local_fs_response_time_bucket: [
		{
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 22377,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 22403,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 22413,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 22420,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 22423,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '1',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '5',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '10',
			value: 22425,
		},
		{
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 22425,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.005',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.01',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.025',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.05',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.1',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.25',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '0.5',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '1',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '2.5',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '5',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '10',
			value: 3,
		},
		{
			method: 'GET',
			status: '400',
			le: '+Inf',
			value: 3,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.005',
			value: 15495,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.01',
			value: 15686,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.025',
			value: 15697,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.05',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.1',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.25',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '0.5',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '1',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '2.5',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '5',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '10',
			value: 15698,
		},
		{
			method: 'PUT',
			status: '200',
			le: '+Inf',
			value: 15698,
		},
	],
	parseable_local_fs_response_time_sum: [
		{
			method: 'GET',
			status: '200',
			value: 5,
		},
		{
			method: 'GET',
			status: '400',
			value: 0,
		},
		{
			method: 'PUT',
			status: '200',
			value: 13,
		},
	],
	parseable_local_fs_response_time_count: [
		{
			method: 'GET',
			status: '200',
			value: 22425,
		},
		{
			method: 'GET',
			status: '400',
			value: 3,
		},
		{
			method: 'PUT',
			status: '200',
			value: 15698,
		},
	],
	parseable_query_execute_time_bucket: [
		{
			stream: 'azureapimlog',
			le: '0.005',
			value: 20,
		},
		{
			stream: 'azureapimlog',
			le: '0.01',
			value: 51,
		},
		{
			stream: 'azureapimlog',
			le: '0.025',
			value: 77,
		},
		{
			stream: 'azureapimlog',
			le: '0.05',
			value: 80,
		},
		{
			stream: 'azureapimlog',
			le: '0.1',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '0.25',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '0.5',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '1',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '2.5',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '5',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '10',
			value: 82,
		},
		{
			stream: 'azureapimlog',
			le: '+Inf',
			value: 82,
		},
		{
			stream: 'backend',
			le: '0.005',
			value: 0,
		},
		{
			stream: 'backend',
			le: '0.01',
			value: 2,
		},
		{
			stream: 'backend',
			le: '0.025',
			value: 92,
		},
		{
			stream: 'backend',
			le: '0.05',
			value: 165,
		},
		{
			stream: 'backend',
			le: '0.1',
			value: 219,
		},
		{
			stream: 'backend',
			le: '0.25',
			value: 297,
		},
		{
			stream: 'backend',
			le: '0.5',
			value: 332,
		},
		{
			stream: 'backend',
			le: '1',
			value: 337,
		},
		{
			stream: 'backend',
			le: '2.5',
			value: 339,
		},
		{
			stream: 'backend',
			le: '5',
			value: 339,
		},
		{
			stream: 'backend',
			le: '10',
			value: 339,
		},
		{
			stream: 'backend',
			le: '+Inf',
			value: 339,
		},
		{
			stream: 'druide2e',
			le: '0.005',
			value: 0,
		},
		{
			stream: 'druide2e',
			le: '0.01',
			value: 11,
		},
		{
			stream: 'druide2e',
			le: '0.025',
			value: 19,
		},
		{
			stream: 'druide2e',
			le: '0.05',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '0.1',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '0.25',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '0.5',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '1',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '2.5',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '5',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '10',
			value: 20,
		},
		{
			stream: 'druide2e',
			le: '+Inf',
			value: 20,
		},
		{
			stream: 'frontend',
			le: '0.005',
			value: 0,
		},
		{
			stream: 'frontend',
			le: '0.01',
			value: 0,
		},
		{
			stream: 'frontend',
			le: '0.025',
			value: 17,
		},
		{
			stream: 'frontend',
			le: '0.05',
			value: 30,
		},
		{
			stream: 'frontend',
			le: '0.1',
			value: 49,
		},
		{
			stream: 'frontend',
			le: '0.25',
			value: 86,
		},
		{
			stream: 'frontend',
			le: '0.5',
			value: 106,
		},
		{
			stream: 'frontend',
			le: '1',
			value: 107,
		},
		{
			stream: 'frontend',
			le: '2.5',
			value: 111,
		},
		{
			stream: 'frontend',
			le: '5',
			value: 115,
		},
		{
			stream: 'frontend',
			le: '10',
			value: 115,
		},
		{
			stream: 'frontend',
			le: '+Inf',
			value: 115,
		},
	],
	parseable_query_execute_time_sum: [
		{
			stream: 'azureapimlog',
			value: 0,
		},
		{
			stream: 'backend',
			value: 38,
		},
		{
			stream: 'druide2e',
			value: 0,
		},
		{
			stream: 'frontend',
			value: 35,
		},
	],
	parseable_query_execute_time_count: [
		{
			stream: 'azureapimlog',
			value: 82,
		},
		{
			stream: 'backend',
			value: 339,
		},
		{
			stream: 'druide2e',
			value: 20,
		},
		{
			stream: 'frontend',
			value: 115,
		},
	],
	parseable_response_code: [
		{
			endpoint: '',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			statuscode: '304',
			type: '300',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			statuscode: '400',
			type: '400',
			value: 12,
		},
		{
			endpoint: '',
			method: 'HEAD',
			statuscode: '200',
			type: '200',
			value: 491,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			statuscode: '405',
			type: '400',
			value: 3,
		},
		{
			endpoint: '',
			method: 'POST',
			statuscode: '405',
			type: '400',
			value: 13,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			statuscode: '404',
			type: '400',
			value: 2,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			statuscode: '404',
			type: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 70,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			statuscode: '200',
			type: '200',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			statuscode: '404',
			type: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			statuscode: '404',
			type: '400',
			value: 3,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 64,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			statuscode: '301',
			type: '300',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			statuscode: '400',
			type: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			statuscode: '301',
			type: '300',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			statuscode: '307',
			type: '300',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			statuscode: '400',
			type: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			statuscode: '301',
			type: '300',
			value: 13,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			statuscode: '200',
			type: '200',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			statuscode: '400',
			type: '400',
			value: 37,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 14,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			statuscode: '200',
			type: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			statuscode: '404',
			type: '400',
			value: 3,
		},
	],
	parseable_response_time_bucket: [
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 488,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 517,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 554,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 580,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 598,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 607,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 609,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '1',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '5',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '10',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.005',
			value: 852,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.01',
			value: 855,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.025',
			value: 857,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.05',
			value: 858,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.1',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.25',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '0.5',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '1',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '2.5',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '5',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '10',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			le: '+Inf',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.005',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.01',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.025',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.05',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.1',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.25',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '0.5',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '1',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '2.5',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '5',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '10',
			value: 12,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			le: '+Inf',
			value: 12,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.005',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.01',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.025',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.05',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.1',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.25',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '0.5',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '1',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '2.5',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '5',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '10',
			value: 491,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			le: '+Inf',
			value: 491,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.005',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.01',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.025',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.05',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.1',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.25',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '0.5',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '1',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '2.5',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '5',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '10',
			value: 3,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			le: '+Inf',
			value: 3,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.005',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.01',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.025',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.05',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.1',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.25',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '0.5',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '1',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '2.5',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '5',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '10',
			value: 13,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			le: '+Inf',
			value: 13,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.005',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.01',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.025',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.05',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.1',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.25',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '0.5',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '1',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '2.5',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '5',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '10',
			value: 2,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			le: '+Inf',
			value: 2,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.005',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.01',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.025',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.05',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.1',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.25',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '0.5',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '1',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '2.5',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '5',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '10',
			value: 1,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			le: '+Inf',
			value: 1,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '1',
			value: 66,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 70,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '5',
			value: 70,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '10',
			value: 70,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 70,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.005',
			value: 6087344,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.01',
			value: 6088376,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.025',
			value: 6088679,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.05',
			value: 6088777,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.1',
			value: 6088813,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.25',
			value: 6088830,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '0.5',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '1',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '2.5',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '5',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '10',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			le: '+Inf',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.005',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.01',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.025',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.05',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.1',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.25',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '0.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '1',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '2.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '5',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '10',
			value: 1,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			le: '+Inf',
			value: 1,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 24,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 66,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '1',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '5',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '10',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.005',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.01',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.025',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.05',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.1',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.25',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '0.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '1',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '2.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '5',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '10',
			value: 3,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			le: '+Inf',
			value: 3,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 60,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '1',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '5',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '10',
			value: 64,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 64,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.005',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.01',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.025',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.05',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.1',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.25',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '0.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '1',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '2.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '10',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			le: '+Inf',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.005',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.01',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.025',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.05',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.1',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.25',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '0.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '1',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '2.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '10',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			le: '+Inf',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.005',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.01',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.025',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.05',
			value: 10,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.1',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.25',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '0.5',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '1',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '2.5',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '5',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '10',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			le: '+Inf',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.005',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.01',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.025',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.05',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.1',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.25',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '0.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '1',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '2.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '5',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '10',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			le: '+Inf',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.005',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.01',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.025',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.05',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.1',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.25',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '0.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '1',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '2.5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '5',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '10',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			le: '+Inf',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.005',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.01',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.025',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.05',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.1',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.25',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '0.5',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '1',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '2.5',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '5',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '10',
			value: 13,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			le: '+Inf',
			value: 13,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.005',
			value: 1,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.01',
			value: 9,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.025',
			value: 116,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.05',
			value: 221,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.1',
			value: 297,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.25',
			value: 395,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '0.5',
			value: 520,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '1',
			value: 544,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '2.5',
			value: 552,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '5',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '10',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			le: '+Inf',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.005',
			value: 35,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.01',
			value: 35,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.025',
			value: 36,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.05',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.1',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.25',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '0.5',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '1',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '2.5',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '5',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '10',
			value: 37,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			le: '+Inf',
			value: 37,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '1',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '5',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '10',
			value: 14,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 14,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '1',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '5',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '10',
			value: 7,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.005',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.01',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.025',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.05',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.1',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.25',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '0.5',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '1',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '2.5',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '5',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '10',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			le: '+Inf',
			value: 7,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.005',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.01',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.025',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.05',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.1',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.25',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '0.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '1',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '2.5',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '5',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '10',
			value: 3,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			le: '+Inf',
			value: 3,
		},
	],
	parseable_response_time_sum: [
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			value: 5,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			value: 0,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			value: 0,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			value: 0,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			value: 0,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			value: 0,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			value: 0,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			value: 0,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			value: 56,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			value: 1548,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			value: 0,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			value: 0,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			value: 0,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			value: 0,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			value: 0,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			value: 114,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			value: 0,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			value: 0,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			value: 0,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			value: 0,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			value: 0,
		},
	],
	parseable_response_time_count: [
		{
			endpoint: '',
			method: 'GET',
			status: '200',
			value: 610,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '304',
			value: 859,
		},
		{
			endpoint: '',
			method: 'GET',
			status: '400',
			value: 12,
		},
		{
			endpoint: '',
			method: 'HEAD',
			status: '200',
			value: 491,
		},
		{
			endpoint: '',
			method: 'OPTIONS',
			status: '405',
			value: 3,
		},
		{
			endpoint: '',
			method: 'POST',
			status: '405',
			value: 13,
		},
		{
			endpoint: '*',
			method: 'M-SEARCH',
			status: '404',
			value: 2,
		},
		{
			endpoint: '/api/v1',
			method: 'GET',
			status: '404',
			value: 1,
		},
		{
			endpoint: '/api/v1/about',
			method: 'GET',
			status: '200',
			value: 70,
		},
		{
			endpoint: '/api/v1/ingest',
			method: 'POST',
			status: '200',
			value: 6088833,
		},
		{
			endpoint: '/api/v1/log-stream',
			method: 'GET',
			status: '404',
			value: 1,
		},
		{
			endpoint: '/api/v1/logstream',
			method: 'GET',
			status: '200',
			value: 77,
		},
		{
			endpoint: '/api/v1/logstream//schema',
			method: 'GET',
			status: '404',
			value: 3,
		},
		{
			endpoint: '/api/v1/metrics',
			method: 'GET',
			status: '200',
			value: 64,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '301',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/code',
			method: 'GET',
			status: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '301',
			value: 19,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '307',
			value: 3,
		},
		{
			endpoint: '/api/v1/o/login',
			method: 'GET',
			status: '400',
			value: 1,
		},
		{
			endpoint: '/api/v1/o/logout',
			method: 'GET',
			status: '301',
			value: 13,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '200',
			value: 556,
		},
		{
			endpoint: '/api/v1/query',
			method: 'POST',
			status: '400',
			value: 37,
		},
		{
			endpoint: '/api/v1/role',
			method: 'GET',
			status: '200',
			value: 14,
		},
		{
			endpoint: '/api/v1/role/default',
			method: 'GET',
			status: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user',
			method: 'GET',
			status: '200',
			value: 7,
		},
		{
			endpoint: '/api/v1/user//role',
			method: 'GET',
			status: '404',
			value: 3,
		},
	],
	parseable_staging_files: [
		{
			stream: 'azureapimlog',
			value: 0,
		},
		{
			stream: 'backend',
			value: 1,
		},
		{
			stream: 'druide2e',
			value: 0,
		},
		{
			stream: 'frontend',
			value: 1,
		},
	],
	parseable_storage_size: [
		{
			format: 'arrows',
			stream: 'azureapimlog',
			type: 'staging',
			value: 278360,
		},
		{
			format: 'arrows',
			stream: 'backend',
			type: 'staging',
			value: 3710463112,
		},
		{
			format: 'arrows',
			stream: 'frontend',
			type: 'staging',
			value: 3349968344,
		},
		{
			format: 'parquet',
			stream: 'azureapimlog',
			type: 'data',
			value: 1628492,
		},
		{
			format: 'parquet',
			stream: 'backend',
			type: 'data',
			value: 1061537471,
		},
		{
			format: 'parquet',
			stream: 'druide2e',
			type: 'data',
			value: 3421013,
		},
		{
			format: 'parquet',
			stream: 'frontend',
			type: 'data',
			value: 1042412371,
		},
	],
	process_cpu_seconds_total: 3794,
	process_max_fds: 1048576,
	process_open_fds: 267,
	process_resident_memory_bytes: 236376064,
	process_start_time_seconds: 1709565826,
	process_threads: 7,
	process_virtual_memory_bytes: 692588544,
};

function parsePrometheusResponse(response) {
	const metrics = {};

	response
		.trim()
		.split('\n')
		.forEach((line) => {
			const matchWithLabels = line.match(/(\w+)\{([^\}]+)\}\s+(\d+)/);
			const matchWithoutLabels = line.match(/(\w+)\s+(\d+)/);

			if (matchWithLabels) {
				const metricName = matchWithLabels[1];
				const labels = matchWithLabels[2].split(',').reduce((acc, label) => {
					const [key, value] = label.split('=');
					acc[key] = value.replace(/"/g, '');
					return acc;
				}, {});
				const value = parseInt(matchWithLabels[3], 10);

				if (!metrics[metricName]) {
					metrics[metricName] = [];
				}

				metrics[metricName].push({ ...labels, value });
			} else if (matchWithoutLabels) {
				const metricName = matchWithoutLabels[1];
				const value = parseInt(matchWithoutLabels[2], 10);

				if (!metrics[metricName]) {
					metrics[metricName] = value;
				} else if (typeof metrics[metricName] === 'number') {
					metrics[metricName] = [metrics[metricName], { value }];
				} else {
					metrics[metricName].push({ value });
				}
			}
		});

	return metrics;
}

const UsageIndicator = (props: UsageIndicatorProps) => {
	const alarmCutOffPercentage = 79;
	const { label, percentage } = props;
	const statusClassName = percentage === null ? '' : percentage > alarmCutOffPercentage ? classes.alert : classes.ok;
	console.log(`${classes.usageLevelIndicator} ${statusClassName}`);
	return (
		<Stack
			className={`${classes.usageIndicatorContainer} ${statusClassName}`}
			style={{ width: '8rem', position: 'relative' }}>
			<Stack
				className={`${classes.usageLevelIndicator} ${statusClassName}`}
				style={{ height: '100%', width: `${percentage}%` }}
			/>
			<Text className={classes.usageIndicatorText}>{props.label}</Text>
		</Stack>
	);
};

const parseStreamDataMetrics = (streamData) => {
	if (!streamData || !Array.isArray(streamData)) {
		return 0;
	}

	return streamData.reduce((acc, streamDatum) => {
		const { value } = streamDatum;
		return value + acc;
	}, 0);
};

const sanitizeIngestorData = () => {
	const prometheusResponse = parsedMetrics;
	const ingestorData = { domain_name: 'stackio.ingest.com', port: 8000, reachable: false };
	const totalEventsIngested = parseStreamDataMetrics(prometheusResponse.parseable_events_ingested);
	const totalBytesIngested = parseStreamDataMetrics(prometheusResponse.parseable_events_ingested_size);
	const stagingFilesCount = parseStreamDataMetrics(prometheusResponse.parseable_staging_files);
    const stagingSize = parseStreamDataMetrics(prometheusResponse.parseable_storage_size)
	return {
		domainName: ingestorData.domain_name,
		totalEventsIngested: HumanizeNumber(totalEventsIngested),
		totalBytesIngested: sanitizeBytes(totalBytesIngested),
		memoryUsage: sanitizeBytes(prometheusResponse.process_resident_memory_bytes),
		stagingFilesCount: HumanizeNumber(stagingFilesCount),
        stagingSize: sanitizeBytes(stagingSize),
        stagingPath: '/parseable/stage',
        storePath: '/parseable/data',
        status: ingestorData.reachable ? 'online' : 'offline',
        error: 'Unknown Error'
	};
}

const TableRow = () => {
    const data = sanitizeIngestorData();

    return (
			<Table.Tr key={data.domainName}>
				<Table.Td>
					<Stack style={{ flexDirection: 'row' }} gap={8}>
						{data.domainName}
						{data.status === 'offline' && (
							<Popover>
								<Popover.Target>
									<ThemeIcon className={classes.infoIcon} variant="filled" size="sm">
										<IconAlertCircle stroke={1.5} />
									</ThemeIcon>
								</Popover.Target>
								<Popover.Dropdown style={{ pointerEvents: 'none' }}>
									<Text className={classes.infoText}>{data.error}</Text>
								</Popover.Dropdown>
							</Popover>
						)}
					</Stack>
				</Table.Td>
				<Table.Td align="center">
					<Tooltip label={data.totalEventsIngested}>
						<Text>{data.totalEventsIngested}</Text>
					</Tooltip>
				</Table.Td>
				<Table.Td align="center">{data.totalBytesIngested}</Table.Td>
				<Table.Td align="center">{data.memoryUsage}</Table.Td>
				<Table.Td align="center">{data.stagingFilesCount}</Table.Td>
				<Table.Td align="center">{data.stagingSize}</Table.Td>
				<Table.Td>{data.stagingPath}</Table.Td>
				<Table.Td>{data.storePath}</Table.Td>
				<Table.Td>
					<Stack className={`${classes.statusChip} ${data.status === 'online' ? classes.online : classes.offline}`}>
						{data.status}
					</Stack>
				</Table.Td>
				<Table.Td align="center">
					{data.status === 'offline' ? (
						<Tooltip label="Remove">
							<IconX className={classes.removeIcon} stroke={2} />
						</Tooltip>
					) : null}
				</Table.Td>
			</Table.Tr>
		);
}

const IngestorsTable = () => {
	return (
		<Table verticalSpacing="md">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Host</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Events Ingested</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Storage</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Memory Usage</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Staging Files</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Staging Size</Table.Th>
					<Table.Th>Staging Path</Table.Th>
					<Table.Th>Store</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '8rem' }}>Status</Table.Th>
					<Table.Th style={{ textAlign: 'center', width: '1rem' }}></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody><TableRow/>
            {/* <TableRow/> */}
            </Table.Tbody>
		</Table>
	);
};

// const fetchh = async() => {
// 	return await Axios().get('http://0.0.0.0:8000/api/v1/metrics');
// };

const Ingestors: FC = () => {
	const totalMachines = ingestorsData.length;
	const totalActiveMachines = ingestorsData.filter((ingestor) => ingestor.status === 'online').length;

	useEffect(() => {
		// const res = fetchh();
		// console.log(res)
	}, []);

	return (
		<Stack className={classes.sectionContainer}>
			<Stack className={classes.sectionTitleContainer}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
					<IconBrandDatabricks stroke={1.2} />
					<Text className={classes.sectionTitle}>Ingestors</Text>
				</Stack>
				<Text>{`${totalActiveMachines}/${totalMachines} active`}</Text>
			</Stack>
			<IngestorsTable />
		</Stack>
	);
};

export default Ingestors;
