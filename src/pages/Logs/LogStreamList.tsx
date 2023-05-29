import { Box, Divider, TextInput, Tooltip, Highlight, UnstyledButton, Center, ScrollArea, px } from '@mantine/core';
import type { UnstyledButtonProps } from '@mantine/core';
import type { ComponentPropsWithRef, ChangeEvent, FC } from 'react';
import { useMemo, useEffect } from 'react';
import { useLogStreamListStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import { IconChevronLeft, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import Loading from '@/components/Loading';
import EmptyBox from '@/components/Empty';
import ErrorText from '@/components/Text/ErrorText';
import { heights } from '@/components/Mantine/sizing';
import { useLogsPageContext } from './Context';
import { useDisclosure } from '@mantine/hooks';

const LogStreamList: FC = () => {
	const {
		state: { subSelectedStream },
	} = useLogsPageContext();

	const { data: streams, loading, error } = useGetLogStreamList();
	const [selectedStream, setSelectedStream] = useMountedState('');

	const [search, setSearch] = useMountedState('');
	const [opened, { toggle }] = useDisclosure(true);

	const streamsFiltered = useMemo(() => {
		if (streams && search) {
			return streams.filter((x) => x.name.includes(search));
		}

		return streams;
	}, [streams, search]);

	useEffect(() => {
		if (streams) {
			subSelectedStream.set(streams[0].name);
		}
	}, [streams]);

	useEffect(() => {
		const listener = subSelectedStream.subscribe(setSelectedStream);

		return () => listener();
	}, []);

	const onStreamSelect = (streamName: string) => {
		subSelectedStream.set(streamName);
	};

	const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearch(() => e.target.value);
	};

	const { classes, cx } = useLogStreamListStyles();
	const {
		container,
		containerClose,
		streamContainer,
		streamContainerClose,
		searchInputStyle,
		streamListContainer,
		chevronBtn,
		chevronBtnClose,
	} = classes;

	return (
		<Box className={cx(container, { [containerClose]: !opened })}>
			<Box className={cx(streamContainer, { [streamContainerClose]: !opened })}>
				<Loading visible={loading} variant="oval" position="absolute" zIndex={1} />
				<TextInput
					disabled={loading || !streams || !streams.length}
					className={searchInputStyle}
					placeholder="Search streams"
					icon={<IconSearch size={px('0.8rem')} />}
					onChange={onSearch}
				/>

				<Divider my="xs" />

				{streamsFiltered &&
					(streamsFiltered.length ? (
						<ScrollArea className={streamListContainer}>
							{streamsFiltered.map((stream) => {
								return (
									<Stream
										key={stream.name}
										search={search}
										name={stream.name}
										isSelected={selectedStream === stream.name}
										onStreamSelect={() => {
											onStreamSelect(stream.name);
										}}
									/>
								);
							})}
						</ScrollArea>
					) : (
						<EmptyBox
							message={search ? 'No Matching Stream' : 'No Stream Available'}
							imgHeight={50}
							textProps={{ size: 'sm' }}
						/>
					))}

				{error && (
					<Center h={heights.full}>
						<ErrorText>{error}</ErrorText>
					</Center>
				)}
			</Box>
			<CollapseBtn className={cx(chevronBtn, { [chevronBtnClose]: !opened })} onClick={toggle} opened={opened} />
		</Box>
	);
};

type CollapseBtnProps = {
	opened: boolean;
} & UnstyledButtonProps &
	ComponentPropsWithRef<'button'>;

const CollapseBtn: FC<CollapseBtnProps> = (props) => {
	const { opened, ...restProps } = props;
	return <UnstyledButton {...restProps}>{opened ? <IconChevronLeft /> : <IconChevronRight />}</UnstyledButton>;
};

type StreamProps = {
	name: string;
	isSelected: boolean;
	onStreamSelect: () => void;
	search: string;
};

const Stream: FC<StreamProps> = (props) => {
	const { name, isSelected, onStreamSelect, search } = props;

	const searchValueSplit = useMemo(() => {
		return search.split(' ');
	}, [search]);

	const { classes, cx } = useLogStreamListStyles();
	const { streamText, streamTextActive, streamBtn, streamBtnActive } = classes;

	return (
		<Tooltip label={name} position="bottom" withArrow transitionProps={{ duration: 0 }}>
			<UnstyledButton onClick={onStreamSelect} className={cx(streamBtn, { [streamBtnActive]: isSelected })}>
				<Highlight highlight={searchValueSplit} className={cx(streamText, { [streamTextActive]: isSelected })}>
					{name}
				</Highlight>
			</UnstyledButton>
		</Tooltip>
	);
};

export default LogStreamList;
