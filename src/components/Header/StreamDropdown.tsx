import { Select } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import classes from './styles/LogQuery.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { STREAM_VIEWS } from '@/constants/routes';
import _ from 'lodash';
import { STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';

const StreamDropdown = () => {
	const { streamName, view } = useParams();

	const [currentStream] = useAppStore(store => store.currentStream)
	const [userSpecificStreams] = useAppStore(store => store.userSpecificStreams)
	const valueRef = useRef<string | null>(currentStream);
	const navigate = useNavigate();

	const handleChange: (value: string | null) => void = useCallback((value: string | null) => {
		if (value === null) return;

		valueRef.current = value;

		const targetView = _.includes(STREAM_VIEWS, view) ? view : 'explore'
		navigate(`/${value}/${targetView}`);
	}, [view]);

	useEffect(() => {
		valueRef.current = streamName || null;
	}, [streamName])

	return (
		<Select
			searchable
			limit={20}
			value={valueRef.current}
			h="100%"
			classNames={{ input: classes.streamInput, description: classes.streamSelectDescription }}
			onChange={handleChange}
			styles={{input: {
				height: STREAM_PRIMARY_TOOLBAR_HEIGHT
			}}}
			data={userSpecificStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
		/>
	);
};

export default StreamDropdown;
