import { TextInput, Text } from '@mantine/core';
import { IconTrashX } from '@tabler/icons-react';
import classes from '../styles/Correlation.module.css';
import { CorrelationFieldItem } from './CorrelationFieldItem';
import { StreamSelectBox } from './StreamSelectBox';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { FC, useState } from 'react';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { changeStream } = appStoreReducers;
const { setIsCorrelatedFlag, setSelectedFields, deleteStreamData } = correlationStoreReducers;

interface CorrelationSideBarProps {
	setIsCorrelationEnabled: (enabled: boolean) => void;
	setSelect1Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
	setSelect2Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
	loadingState: boolean;
	isLoading: boolean;
}

export const CorrelationSidebar: FC<CorrelationSideBarProps> = ({
	setIsCorrelationEnabled,
	setSelect1Value,
	setSelect2Value,
	loadingState,
	isLoading,
}) => {
	const [searchText, setSearchText] = useState('');

	const [{ fields, selectedFields, isCorrelatedData }, setCorrelationData] = useCorrelationStore((store) => store);
	const [userSpecificStreams, setAppStore] = useAppStore((store) => store.userSpecificStreams);
	const streamNames = Object.keys(fields);
	const streamData =
		userSpecificStreams?.map((stream: any) => ({
			value: stream.name,
			label: stream.name,
		})) ?? [];

	const filterFields = (fieldsIter: any) => {
		const typedFields = Object.keys(fieldsIter.fieldTypeMap) as string[];
		return searchText
			? typedFields.filter((field) => field.toLowerCase().includes(searchText.toLowerCase()))
			: typedFields;
	};
	const addStream = (value: string | null) => {
		if (value) {
			setAppStore((store) => changeStream(store, value));
		}
	};

	return (
		<div className={classes.correlationSideBarWrapper}>
			<Text>Streams</Text>
			<TextInput
				disabled={streamNames.length === 0}
				w="100%"
				radius="md"
				placeholder="Search Fields"
				key="search-fields"
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
			/>
			<div className={classes.streamBox}>
				{Object.entries(fields).map(([stream, fieldsIter]: [any, any]) => {
					if (!fieldsIter) return;
					const filteredFields = filterFields(fieldsIter);
					const totalStreams = Object.entries(fields).length;
					const heightPercentage = totalStreams === 1 ? '50%' : `${100 / totalStreams}%`;

					return (
						<div
							key={stream}
							className={classes.streamWrapper}
							style={{
								height: heightPercentage,
								border: `1px solid ${fieldsIter.color}`,
							}}>
							<div className={classes.streamNameWrapper}>
								<Text
									size="md"
									tt="capitalize"
									style={{ color: fieldsIter.headerColor }}
									className={classes.streamName}>
									{stream}
								</Text>
								<IconTrashX
									color={fieldsIter.headerColor}
									cursor="pointer"
									size={14}
									onClick={() => {
										setAppStore((store) => changeStream(store, ''));
										setCorrelationData((store) => setIsCorrelatedFlag(store, false));
										setSelect1Value({ value: null, dataType: '' });
										setSelect2Value({ value: null, dataType: '' });
										setCorrelationData((store) => deleteStreamData(store, stream));
										setIsCorrelationEnabled(false);
									}}
								/>
							</div>
							{filteredFields.length > 0 ? (
								<div className={classes.fieldsWrapper}>
									{filteredFields.map((field: string) => {
										const isSelected = selectedFields[stream]?.includes(field);
										const dataType = fieldsIter.fieldTypeMap[field];
										return (
											<CorrelationFieldItem
												key={`${stream}-${field}`}
												headerColor={fieldsIter.headerColor}
												backgroundColor={fieldsIter.backgroundColor}
												iconColor={fieldsIter.iconColor}
												fieldName={field.replace(`${stream}.`, '')}
												dataType={dataType}
												isSelected={isSelected}
												onClick={() => {
													if (isLoading) return;
													if (isCorrelatedData) {
														setIsCorrelationEnabled(true);
													}
													setCorrelationData((store) => setSelectedFields(store, field, stream));
												}}
											/>
										);
									})}
								</div>
							) : (
								<Text className={classes.noFieldText}>No fields match your search.</Text>
							)}
						</div>
					);
				})}
				{streamNames.length === 0 && (
					<>
						{/* First box */}
						<StreamSelectBox
							label="Add Stream 1"
							placeholder="Select Stream 1"
							disabled={false}
							onChange={(value) => value && addStream(value)}
							data={streamData.filter((stream) => !streamNames.includes(stream.value))}
							isFirst={true}
						/>

						{/* Second box */}
						<StreamSelectBox
							label="Add Stream 2"
							placeholder="Select Stream 2"
							disabled={streamNames.length < 1}
							onChange={(value) => addStream(value)}
							data={streamData.filter((stream) => !streamNames.includes(stream.value))}
							isFirst={false}
						/>
					</>
				)}
				{streamNames.length === 1 && (
					<>
						{/* Render the single existing field */}
						<StreamSelectBox
							label="Add Stream 2"
							placeholder="Select Stream 2"
							disabled={loadingState}
							onChange={(value) => addStream(value)}
							data={streamData.filter((stream) => !streamNames.includes(stream.value))}
							isFirst={false}
						/>
					</>
				)}
			</div>
		</div>
	);
};
