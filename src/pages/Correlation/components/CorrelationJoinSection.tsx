import { FC, useCallback } from 'react';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { dataTypeIcons } from './CorrelationFieldItem';
import classes from '../styles/Correlation.module.css';
import { ActionIcon, Badge, Button, Select, SelectProps, Text } from '@mantine/core';
import { STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import { IconX } from '@tabler/icons-react';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCorrelationFetchCount } from '../hooks/useCorrelationFetchCount';
import { useCorrelationQueryLogs } from '@/hooks/useCorrelationQueryLogs';
import { CorrelationSaveIcon } from './CorrelationSaveIcon';

const {
	toggleSaveCorrelationModal,
	setCorrelationCondition,
	setActiveCorrelation,
	setSelectedFields,
	setIsCorrelatedFlag,
	setCorrelationId,
} = correlationStoreReducers;

const { syncTimeRange } = appStoreReducers;

interface CorrelationJoinSectionProps {
	select1Value: { value: string | null; dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null };
	select2Value: { value: string | null; dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null };
	isCorrelationEnabled: boolean;
	setIsCorrelationEnabled: (enabled: boolean) => void;
	setSelect1Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
	setSelect2Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
}

export const CorrelationJoinSection: FC<CorrelationJoinSectionProps> = ({
	setIsCorrelationEnabled,
	setSelect1Value,
	setSelect2Value,
	select1Value,
	select2Value,
	isCorrelationEnabled,
}) => {
	const [{ fields, selectedFields, isCorrelatedData }, setCorrelationData] = useCorrelationStore((store) => store);
	const [, setAppStore] = useAppStore((store) => store);
	const streamNames = Object.keys(fields);
	const { refetchCount } = useCorrelationFetchCount();
	const { getCorrelationData } = useCorrelationQueryLogs();

	const clearQuery = () => {
		setSelect1Value({ value: null, dataType: '' });
		setSelect2Value({ value: null, dataType: '' });
		setCorrelationData((store) => setCorrelationCondition(store, ''));
		setCorrelationData((store) => setSelectedFields(store, '', '', true));
		setCorrelationData((store) => setIsCorrelatedFlag(store, false));
		setCorrelationData((store) => setCorrelationId(store, ''));
		setCorrelationData((store) => setActiveCorrelation(store, null));
		setIsCorrelationEnabled(false);
		setAppStore(syncTimeRange);
	};

	const renderJoinOneOptions: SelectProps['renderOption'] = ({ option }) => {
		const fieldType = fields[streamNames[0]]?.fieldTypeMap[option.value];
		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
				{option.label}
				{dataTypeIcons('black')[fieldType]}
			</div>
		);
	};

	const renderJoinTwoOptions: SelectProps['renderOption'] = ({ option }) => {
		const fieldType = fields[streamNames[1]]?.fieldTypeMap[option.value];
		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
				{option.label}
				{dataTypeIcons('black')[fieldType]}
			</div>
		);
	};

	const handleFieldChange = (fieldValue: string | null, isFirstField: boolean) => {
		if (isFirstField) {
			const fieldType = fieldValue && fields[streamNames[0]]?.fieldTypeMap[fieldValue];
			console.log(fieldType);

			setSelect1Value({ value: fieldValue, dataType: fieldType });
		} else {
			setSelect2Value({ value: fieldValue });
		}
	};

	const openSaveCorrelationModal = useCallback(() => {
		setCorrelationData((store) => toggleSaveCorrelationModal(store, true));
	}, []);

	return (
		<div className={classes.fieldsJoinsWrapper} style={{ height: STREAM_PRIMARY_TOOLBAR_HEIGHT }}>
			<Text
				style={{
					width: '35px',
					color: streamNames.length > 0 ? 'black' : '#CBCBCB',
					flexShrink: 0,
					flexGrow: 0,
				}}>
				Joins
			</Text>
			<div className={classes.joinsWrapper}>
				<div style={{ width: '50%' }}>
					<Select
						styles={{
							input: { height: 26 },
						}}
						disabled={streamNames.length === 0}
						placeholder={streamNames[0] ? `Select field from ${streamNames[0]}` : 'Select Stream 1'}
						style={{ height: '100%' }}
						radius="md"
						data={
							streamNames.length > 0
								? Object.keys(fields[streamNames[0]].fieldTypeMap).filter(
										(key) => fields[streamNames[0]].fieldTypeMap[key] !== 'list',
								  )
								: []
						}
						value={select1Value.value}
						onChange={(value) => handleFieldChange(value, true)}
						renderOption={renderJoinOneOptions}
					/>
				</div>
				<Text size="md"> = </Text>
				<div style={{ width: '50%' }}>
					<Select
						styles={{
							input: { height: 26 },
						}}
						disabled={streamNames.length < 2}
						placeholder={streamNames[1] ? `Select field from ${streamNames[1]}` : 'Select Stream 2'}
						radius="md"
						data={
							streamNames.length > 1
								? Object.keys(fields[streamNames[1]].fieldTypeMap).filter((key) => {
										const dataType = fields[streamNames[1]].fieldTypeMap[key];
										return dataType !== 'list' && (!select1Value.dataType || select1Value.dataType === dataType);
								  })
								: []
						}
						value={select2Value.value}
						onChange={(value) => handleFieldChange(value, false)}
						renderOption={renderJoinTwoOptions}
					/>
				</div>
				<ActionIcon
					className={classes.saveCorrelationIcon}
					size={38}
					disabled={!isCorrelatedData}
					radius={5}
					onClick={() => {
						openSaveCorrelationModal();
					}}>
					<CorrelationSaveIcon />
				</ActionIcon>
				<div style={{ height: '100%', width: '20%', display: 'flex' }}>
					{isCorrelatedData && (
						<Badge
							variant="outline"
							color="#535BED"
							h={'100%'}
							size="lg"
							styles={{
								root: {
									textTransform: 'none',
								},
							}}
							rightSection={
								<IconX
									style={{ cursor: 'pointer' }}
									size={12}
									color="#535BED"
									onClick={() => {
										setSelect1Value({ value: null, dataType: '' });
										setSelect2Value({ value: null, dataType: '' });
										setCorrelationData((store) => setCorrelationCondition(store, ''));
										setCorrelationData((store) => setIsCorrelatedFlag(store, false));
										setCorrelationData((store) => setCorrelationId(store, ''));
										setCorrelationData((store) => setActiveCorrelation(store, null));
										setIsCorrelationEnabled(false);
										setAppStore(syncTimeRange);
									}}
								/>
							}>
							Join Applied
						</Badge>
					)}
				</div>
				<div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '25px' }}>
					<Button
						className={classes.correlateBtn}
						disabled={!isCorrelationEnabled || Object.keys(selectedFields).length === 0}
						variant="filled"
						onClick={() => {
							setCorrelationData((store) => setIsCorrelatedFlag(store, true));
							setIsCorrelationEnabled(false);
							refetchCount();
							getCorrelationData();
						}}>
						Correlate
					</Button>
					<Button
						className={classes.clearBtn}
						onClick={clearQuery}
						disabled={streamNames.length == 0 || Object.keys(selectedFields).length === 0}>
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
};
