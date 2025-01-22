import classes from '../styles/Correlation.module.css';
import SavedCorrelationsButton from './SavedCorrelationsBtn';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ViewToggle from './CorrelationViewToggle';
import ShareButton from './ShareButton';
import { MaximizeButton } from '@/pages/Stream/components/PrimaryToolbar';

export const CorrelationControlSection = () => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: '100%',
			}}>
			{/* <CorrelationFilters /> */}
			<div className={classes.logTableControlWrapper}>
				<div style={{ display: 'flex', gap: '10px' }}>
					<SavedCorrelationsButton />
					<TimeRange />
					<RefreshInterval />
					<RefreshNow />
				</div>
				<div style={{ display: 'flex', gap: '10px' }}>
					<ViewToggle />
					<ShareButton />
					<MaximizeButton />
				</div>
			</div>
		</div>
	);
};
