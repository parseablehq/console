import { Stack, Box, Button, Text, px } from '@mantine/core';
import { IconClock, IconEye, IconEyeOff, IconTrash, IconX } from '@tabler/icons-react';
import { useState, useCallback } from 'react';
import classes from '../styles/SavedCorrelationItem.module.css';
import { Correlation } from '@/@types/parseable/api/correlation';
import dayjs from 'dayjs';
import IconButton from '@/components/Button/IconButton';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';

const { toggleSavedCorrelationsModal } = correlationStoreReducers;

const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;
const renderCloseIcon = () => <IconX size={px('1rem')} stroke={1.5} />;
const DeleteButton = (props: { onClick: () => void }) => {
	return <IconButton renderIcon={renderDeleteIcon} size={38} onClick={props.onClick} />;
};
const renderEyeOffIcon = () => <IconEyeOff size={px('1rem')} stroke={1.5} />;
const renderEyeIcon = () => <IconEye size={px('1rem')} stroke={1.5} />;

const VisiblityToggleButton = (props: { showQuery: boolean; onClick: () => void }) => {
	return (
		<IconButton renderIcon={props.showQuery ? renderEyeOffIcon : renderEyeIcon} size={38} onClick={props.onClick} />
	);
};

const getTimeRangeLabel = (startTime: string, endTime: string) => {
	return `${dayjs(startTime).format('hh:mm A DD MMM YY')} to ${dayjs(endTime).format('hh:mm A DD MMM YY')}`;
};

const SavedCorrelationItem = (props: { item: Correlation }) => {
	const {
		item: { startTime, endTime, id, title, joinConfig },
	} = props;
	const [showDeletePropmt, setShowDeletePrompt] = useState<boolean>(false);
	const [showQuery, setShowQuery] = useState<boolean>(false);
	const { deleteSavedCorrelationMutation, getCorrelationByIdMutation } = useCorrelationsQuery();
	const [, setCorrelationData] = useCorrelationStore((store) => store);

	const handleDelete = useCallback(() => {
		if (!showDeletePropmt) {
			return setShowDeletePrompt(true);
		}
		deleteSavedCorrelationMutation({ correlationId: id });
	}, [showDeletePropmt]);

	const closeModal = useCallback(() => {
		setCorrelationData((store) => toggleSavedCorrelationsModal(store, false));
	}, []);

	const onCorrelationAppy = useCallback(() => {
		getCorrelationByIdMutation(id);
		closeModal();
	}, []);

	const toggleShowQuery = useCallback(() => {
		return setShowQuery((prev) => !prev);
	}, []);

	return (
		<Stack className={classes.savedCorrelatedItemContainer} style={{ paddingBottom: '0.8rem' }}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Stack gap={6} style={{ width: '60%' }}>
					<Text style={{ fontSize: '0.8rem' }}>{title}</Text>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={6}>
						<IconClock size="0.9rem" stroke={1.4} color="#868e96" />
						<Text style={{ fontSize: '0.7rem' }} c="gray.6">
							{startTime && endTime ? getTimeRangeLabel(startTime, endTime) : 'No selected time range'}
						</Text>
					</Stack>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', width: '40%', justifyContent: 'flex-end' }}>
					{showDeletePropmt ? (
						<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
							<Box>
								<Button leftSection={renderDeleteIcon()} onClick={handleDelete} variant="outline">
									Confirm
								</Button>
							</Box>
							<Box>
								<Button leftSection={renderCloseIcon()} onClick={() => setShowDeletePrompt(false)}>
									Cancel
								</Button>
							</Box>
						</Stack>
					) : (
						<>
							<VisiblityToggleButton showQuery={showQuery} onClick={toggleShowQuery} />
							<DeleteButton onClick={handleDelete} />
							<Box>
								<Button variant="outline" onClick={onCorrelationAppy}>
									Apply
								</Button>
							</Box>
						</>
					)}
				</Stack>
			</Stack>
			{showQuery && (
				<Stack>
					{joinConfig.joinConditions.map((join: { tableName: string; field: string }) => {
						return (
							<Text key={join.tableName}>
								{join.tableName}.{join.field}
							</Text>
						);
					})}
				</Stack>
			)}
		</Stack>
	);
};
export default SavedCorrelationItem;
