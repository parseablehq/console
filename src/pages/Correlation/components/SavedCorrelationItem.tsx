import { Stack, Box, Button, Text, px, Code } from '@mantine/core';
import { IconClock, IconEye, IconEyeOff, IconTrash, IconX } from '@tabler/icons-react';
import { useState, useCallback, FC } from 'react';
import classes from '../styles/SavedCorrelationItem.module.css';
import { Correlation } from '@/@types/parseable/api/correlation';
import dayjs from 'dayjs';
import IconButton from '@/components/Button/IconButton';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';

const { toggleSavedCorrelationsModal, setCorrelationId } = correlationStoreReducers;

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

interface JoinCondition {
	tableName: string;
	field: string;
}

interface TableConfig {
	tableName: string;
	selectedFields: string[];
}

interface JoinConfig {
	joinConditions: JoinCondition[];
}

const SelectedFields: FC<{ tableConfigs: TableConfig[] }> = ({ tableConfigs }) => {
	const fields = tableConfigs.flatMap((config) =>
		config.selectedFields.map((field) => ({
			key: `${config.tableName}-${field}`,
			content: `${config.tableName}.${field}`,
		})),
	);

	return (
		<div>
			<div style={{ fontSize: '11px' }}>Selected Fields: </div>
			<div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
				{fields.map((field) => (
					<Code>{field.content}</Code>
				))}
			</div>
		</div>
	);
};

const JoinConditions: FC<{ joinConfig: JoinConfig }> = ({ joinConfig }) => {
	return (
		<>
			{joinConfig.joinConditions.map((join, index) => {
				if (index % 2 !== 0) return null;

				const nextJoin = joinConfig.joinConditions[index + 1];
				if (!nextJoin) return null;

				return (
					<div key={`join-${index}`}>
						<div style={{ fontSize: '11px' }}>Join Condition:</div>
						<Code>{`${join.tableName}.${join.field}`}</Code>
						<span>=</span>
						<Code>{`${nextJoin.tableName}.${nextJoin.field}`}</Code>
					</div>
				);
			})}
		</>
	);
};

const SavedCorrelationItem = (props: { item: Correlation }) => {
	const {
		item: { startTime, endTime, id, title, joinConfig, tableConfigs },
	} = props;
	const [showDeletePropmt, setShowDeletePrompt] = useState<boolean>(false);
	const [showQuery, setShowQuery] = useState<boolean>(false);
	const { deleteSavedCorrelationMutation } = useCorrelationsQuery();
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
		setCorrelationData((store) => setCorrelationId(store, id));
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
				<Stack gap={10}>
					<SelectedFields tableConfigs={tableConfigs} />
					<JoinConditions joinConfig={joinConfig} />
				</Stack>
			)}
		</Stack>
	);
};
export default SavedCorrelationItem;
