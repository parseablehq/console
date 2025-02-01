import { Stack } from '@mantine/core';
import { STREAM_SECONDARY_TOOLBAR_HRIGHT } from '@/constants/theme';
import classes from '../styles/Correlation.module.css';
import MultiEventTimeLineGraph from './MultiEventTimeLineGraph';
import { CorrelationFieldsSection } from './CorrelationFieldsSection';
import { FC } from 'react';
import { CorrelationJoinSection } from './CorrelationJoinSection';
import { CorrelationControlSection } from './CorrelationControlSection';

interface CorrelationToolbarProps {
	setIsCorrelationEnabled: (enabled: boolean) => void;
	select1Value: { value: string | null; dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null };
	select2Value: { value: string | null; dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null };
	isCorrelationEnabled: boolean;
	setSelect1Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
	setSelect2Value: (value: {
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}) => void;
}

export const CorrelationToolbar: FC<CorrelationToolbarProps> = ({
	setIsCorrelationEnabled,
	setSelect1Value,
	setSelect2Value,
	select1Value,
	select2Value,
	isCorrelationEnabled,
}) => {
	return (
		<Stack className={classes.topSectionWrapper}>
			<Stack>
				<CorrelationFieldsSection setIsCorrelationEnabled={setIsCorrelationEnabled} />
				<CorrelationJoinSection
					setIsCorrelationEnabled={setIsCorrelationEnabled}
					select1Value={select1Value}
					select2Value={select2Value}
					setSelect1Value={setSelect1Value}
					setSelect2Value={setSelect2Value}
					isCorrelationEnabled={isCorrelationEnabled}
				/>
			</Stack>
			<CorrelationControlSection />
			<Stack className={classes.logsSecondaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
				<MultiEventTimeLineGraph />
			</Stack>
		</Stack>
	);
};
