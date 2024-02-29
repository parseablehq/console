import { Select } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import classes from './styles/LogQuery.module.css';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useNavigate, useParams } from 'react-router-dom';

const StreamDropdown = () => {
	const {
		state: {  userSpecficStreams, subLogQuery },
	} = useHeaderContext();
	const { streamName } = useParams();

	const selectedStream = subLogQuery.get().streamName;
	const valueRef = useRef<string | null>(selectedStream);
	const navigate = useNavigate();

	const handleChange: (value: string | null) => void = useCallback((value: string | null) => {
		if (value === null) return;

		valueRef.current = value;
		navigate(`/${value}/logs`);
	}, []);

	useEffect(() => {
		valueRef.current = streamName || null;
	}, [streamName])

	return (
		<Select
			searchable
			limit={20}
			value={valueRef.current}
			classNames={{ input: classes.streamInput, description: classes.streamSelectDescription }}
			description="Stream"
			className={classes.streamSelect}
			onChange={handleChange}
			data={userSpecficStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
		/>
	);
};

export default StreamDropdown;
