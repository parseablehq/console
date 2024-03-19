import { Input, Menu, Stack, px } from '@mantine/core';
import IconButton from '@/components/Button/IconButton';
import { useLogsPageContext } from './logsContextProvider';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import classes from './styles/Toolbar.module.css';
import { IconDownload, IconMaximize } from '@tabler/icons-react';
import { LOGS_SECONDARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import StreamingButton from '@/components/Header/StreamingButton';
import Querier from './Querier';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/AppProvider';
import { useCallback } from 'react';

const renderExportIcon = () => <IconDownload size={px('1.4rem')} stroke={1.5} />;
const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;

const MaximizeButton = () => {
	const [_appStore, setAppStore] = useAppStore((_store) => null);
	const onClick = useCallback(() => setAppStore(appStoreReducers.toggleMaximize), []);
	return <IconButton renderIcon={renderMaximizeIcon} onClick={onClick} tooltipLabel="Full Screen" />;
};

const SecondaryToolbar = () => {
	const {
		methods: { makeExportData },
		state: { liveTailToggled },
	} = useLogsPageContext();
	const {
		state: { subLogQuery },
		methods: { resetTimeInterval },
	} = useHeaderContext();
	const exportHandler = (fileType: string | null) => {
		const query = subLogQuery.get();
		const filename = `${query.streamName}-logs`;
		if (fileType === 'CSV') {
			downloadDataAsCSV(makeExportData('CSV'), filename);
		} else if (fileType === 'JSON') {
			downloadDataAsJson(makeExportData('JSON'), filename);
		}
	};
	return (
		<Stack className={classes.logsSecondaryToolbar} gap={0} style={{ height: LOGS_SECONDARY_TOOLBAR_HEIGHT }}>
			{!liveTailToggled && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
					<Querier />
					<TimeRange />
					<RefreshInterval />
					<Menu position="bottom">
						<Menu.Target>
							<div>
								<IconButton renderIcon={renderExportIcon} tooltipLabel="Download" />
							</div>
						</Menu.Target>
						<Menu.Dropdown style={{}}>
							<Menu.Item onClick={() => exportHandler('CSV')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								CSV
							</Menu.Item>
							<Menu.Item onClick={() => exportHandler('JSON')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								JSON
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
					<MaximizeButton />
					<RefreshNow onRefresh={resetTimeInterval} />
				</Stack>
			)}
			{liveTailToggled && (
				<Stack gap={0} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
					<StreamingButton />
					<MaximizeButton />
				</Stack>
			)}
		</Stack>
	);
};

// const { Provider, useStore } = createFastContext({
// 	text1: '',
// 	text2: '',
// 	sample: 'sample'
// });

// const Input1 = (props) => {
// 	console.log('input1 rendered');
// 	const [text, setStore] = useStore((store) => store.text1);
// 	return <Input value={text}  onChange={(e) => setStore((store) => ({text1: store.text2 + e.target.value}))}/>
// 	// return <Input value={text}  onChange={(e) => setText({text1: e.target.value})} />
// }

// const Input2 = (props) => {
// 	console.log('input2 rendered');
// 	const [text, setStore] = useStore((store) => store.text2);
// 	return <Input value={text} onChange={(e) => setStore((store) => ({text2: e.target.value}))} />;
// };

// const Input3 = (props) => {
// 	console.log('input3 rendered');
// 	const [text, setStore] = useStore((store) => store.text1);
// 	return <Input  />;
// };

// const Dummy = () => {
// 	console.log('dummy rendered');
// 	return <div>hello</div>;
// };

// const SecondaryToolbar = () => {
// 	const setText = () => {}
// 	return (
// 		<Provider>
// 			<Dummy />
// 			<Input1 setText={setText}/>
// 			<Input2 setText={setText}/>
// 			<Input3/>
// 		</Provider>
// 	);
// };

export default SecondaryToolbar;

// export default SecondaryToolbar;
