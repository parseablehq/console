import { FC } from 'react';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { CorrelationFieldItem } from './CorrelationFieldItem';
import classes from '../styles/Correlation.module.css';
import { Text } from '@mantine/core';

const { deleteSelectedField } = correlationStoreReducers;

interface CorrelationFieldsSectionProps {
	setIsCorrelationEnabled: (enabled: boolean) => void;
}

export const CorrelationFieldsSection: FC<CorrelationFieldsSectionProps> = ({ setIsCorrelationEnabled }) => {
	const [{ fields, selectedFields, isCorrelatedData }, setCorrelationData] = useCorrelationStore((store) => store);
	const streamNames = Object.keys(fields);

	return (
		<div className={classes.fieldsJoinsWrapper}>
			<Text
				style={{
					width: '35px',
					color: streamNames.length > 0 ? 'black' : '#CBCBCB',
				}}>
				Fields
			</Text>
			<div
				style={{
					border: streamNames.length > 0 ? '1px solid #CBCBCB' : '1px solid #e1e5e8',
					backgroundColor: streamNames.length > 0 ? 'white' : '#F7F8F9',
				}}
				className={classes.fieldsPillsWrapper}>
				{Object.keys(selectedFields).length < 1 && (
					<Text c={'#ACB5BD'} size="sm">
						Click on fields to correlate
					</Text>
				)}
				{Object.entries(selectedFields).map(([streamName, fieldsMap]: [any, any]) =>
					fieldsMap.map((field: any, index: any) => (
						<CorrelationFieldItem
							key={`${streamName}-${index}`}
							headerColor={fields[streamName]['headerColor']}
							backgroundColor={fields[streamName]['backgroundColor']}
							iconColor={fields[streamName]['iconColor']}
							fieldName={field}
							onDelete={() => {
								isCorrelatedData && setIsCorrelationEnabled(true);
								setCorrelationData((store) => deleteSelectedField(store, field, streamName));
							}}
						/>
					)),
				)}
			</div>
		</div>
	);
};
