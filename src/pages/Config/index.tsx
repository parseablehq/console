import { Accordion, Box, Button, Switch } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import Editor from '@monaco-editor/react';
import { FC, useEffect } from 'react';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useCacheToggle } from '@/hooks/useCacheToggle';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';
import { useRetentionEditor } from '@/hooks/useRetentionEditor';
import configStyles from './styles/Config.module.css'

const Config: FC = () => {
	useDocumentTitle('Parseable | Config');

	const {
		state: { subLogQuery },
	} = useHeaderContext();

	const [streamName, setStreamName] = useMountedState<string>(subLogQuery.get().streamName ?? '');

	useEffect(() => {
		const subQuery = subLogQuery.subscribe((value: any) => {
			setStreamName(value.streamName);
		});

		return () => {
			subQuery();
		};
	}, [subLogQuery]);

	const { handleCacheToggle, isCacheEnabled } = useCacheToggle(streamName);

	const { handleAlertQueryChange, submitAlertQuery, getLogAlertData } = useAlertsEditor(streamName);

	const { handleRetentionQueryChange, submitRetentionQuery, getLogRetentionData } = useRetentionEditor(streamName);

	// const { classes } = useConfigStyles();
	const classes = configStyles;
	const { container, submitBtn, accordionSt, innerContainer, containerWrapper, trackStyle } = classes;

	const switchStyles = {
		track: isCacheEnabled ? trackStyle : {},
	};

	return (
		<Box className={container}>
			<Switch
				checked={isCacheEnabled}
				labelPosition="left"
				onChange={handleCacheToggle}
				label={isCacheEnabled ? 'Disable Cache' : 'Enable Cache'}
				styles={switchStyles}
			/>
			<Box className={containerWrapper}>
				<Box className={innerContainer}>
					<Accordion defaultValue="" variant="contained" radius="md" w={'100%'} className={accordionSt} style={{borderColor: '#ff0000'}}>
						<Accordion.Item value="Alert">
							<Accordion.Control>Alert</Accordion.Control>
							<Accordion.Panel>
								<Box>
									<Box style={{ height: '500px' }}>
										<Editor
											onChange={handleAlertQueryChange}
											value={JSON.stringify(getLogAlertData?.data, null, 2)}
											defaultLanguage="json"
											options={{
												scrollBeyondLastLine: false,
												readOnly: false,
												fontSize: 12,
												wordWrap: 'on',
												minimap: { enabled: false },
												automaticLayout: true,
												mouseWheelZoom: true,
												glyphMargin: true,
											}}
										/>
									</Box>
									<Button className={submitBtn} onClick={submitAlertQuery}>
										Submit
									</Button>
								</Box>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Box>
				{!subLogQuery.get().access?.some((access: string) => ['PutRetention'].includes(access)) ? null : (
					<Box className={innerContainer}>
						<Accordion defaultValue="" variant="contained" radius="md" w={'100%'} className={accordionSt}>
							<Accordion.Item value="Retention">
								<Accordion.Control>Retention</Accordion.Control>
								<Accordion.Panel>
									<Box>
										<Box style={{ height: '500px' }}>
											<Editor
												onChange={handleRetentionQueryChange}
												value={JSON.stringify(getLogRetentionData?.data, null, 2)}
												defaultLanguage="json"
												options={{
													scrollBeyondLastLine: false,
													readOnly: false,
													fontSize: 12,
													wordWrap: 'on',
													minimap: { enabled: false },
													automaticLayout: true,
													mouseWheelZoom: true,
													glyphMargin: true,
												}}
											/>
										</Box>
										<Button className={submitBtn} onClick={submitRetentionQuery}>
											Submit
										</Button>
									</Box>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default Config;
