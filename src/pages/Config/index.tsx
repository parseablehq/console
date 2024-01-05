import { Accordion, Box, Button } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import Editor from '@monaco-editor/react';
import { FC, useEffect } from 'react';
import { useConfigStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import { usePutLogStreamAlerts } from '@/hooks/usePutLogStreamAlerts';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { usePutLogStreamRetention } from '@/hooks/usePutLogStreamRetention';
import { useGetLogStreamAlert } from '@/hooks/useGetLogStreamAlert';
import { useGetLogStreamRetention } from '@/hooks/useGetLogStreamRetention';
import { useGetCacheStatus } from '@/hooks/useGetCacheStatus';
import { usePutCache } from '@/hooks/usePutCache';
import { useQuery, useMutation } from 'react-query';
import { getCachingStatus, updateCaching } from '@/api/caching';
import { notifyApi } from '@/utils/notification';
import { getLogStreamAlerts, getLogStreamRetention, putLogStreamAlerts, putLogStreamRetention } from '@/api/logStream';

const Config: FC = () => {
	useDocumentTitle('Parseable | Config');

	const [alertQuery, setAlertQuery] = useMountedState<string | undefined>('');
	const [retentionQuery, setRetentionQuery] = useMountedState<string | undefined>('');

	const {
		state: { subLogQuery },
	} = useHeaderContext();

	const [streamName, setStreamName] = useMountedState<string>('teststream');

	useEffect(() => {
		const subQuery = subLogQuery.subscribe((value: any) => {
			console.log('value.streamName', value.streamNam);
			setStreamName(value.streamName);
		});
		return () => {
			subQuery();
		};
	}, []);

	const { mutate: updateCacheStatus, isSuccess: updateCacheIsSuccess } = useMutation(
		({ streamName, type }: { streamName: string; type: boolean }) => updateCaching(streamName, type),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to change cache setting',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			onSuccess: () => {
				notifyApi({
					color: 'green',
					message: 'Succesfully updated cache setting',
					icon: <IconCheck size="1rem" />,
				});
			},
		},
	);

	const { mutate: updateLogStreamAlerts, isSuccess: updateLogStreamIsSuccess } = useMutation(
		({ streamName, data }: { streamName: string; data: string }) => putLogStreamAlerts(streamName, data),
		{
			onSuccess: () => {
				notifyApi({
					color: 'green',
					message: 'Alert Added.',
					icon: <IconCheck size="1rem" />,
				});
			},
			onError: (error) => {
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `Error occurred, please check your query and try again`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 3000,
					},
					true,
				);
			},
		},
	);

	const { mutate: updateLogStreamRetention, isSuccess: updateLogRetentionIsSuccess } = useMutation(
		({ streamName, data }: { streamName: string; data: string }) => putLogStreamRetention(streamName, data),
		{
			onSuccess: () => {
				notifyApi({
					color: 'green',
					message: 'Retention Added.',
					icon: <IconCheck size="1rem" />,
				});
			},
			onError: (error) => {
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `Error occurred, please check your query and try again`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 3000,
					},
					true,
				);
			},
		},
	);

	const { data: checkCacheData } = useQuery(
		['fetch-cache-status', streamName, updateCacheIsSuccess],
		() => getCachingStatus(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to fetch cache setting',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			onSuccess: () => {
				console.log('success occurred');
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const { data: getLogAlertData } = useQuery(
		['fetch-log-stream-alert', streamName, updateLogStreamIsSuccess],
		() => getLogStreamAlerts(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to log streams alert',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const { data: getLogRetentionData } = useQuery(
		['fetch-log-stream-retention', streamName, updateLogRetentionIsSuccess],
		() => getLogStreamRetention(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to log streams alert',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const onSubmitAlertQuery = () => {
		try {
			JSON.parse(alertQuery!);
			updateLogStreamAlerts({
				streamName,
				data: alertQuery!,
			});
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
		}
	};

	const onSubmitRetentionQuery = () => {
		try {
			JSON.parse(retentionQuery!);
			updateLogStreamRetention({ streamName, data: retentionQuery! });
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
			return;
		}
	};

	const { classes } = useConfigStyles();
	const { container, submitBtn, accordionSt, innerContainer, containerWrapper, primaryBtn } = classes;

	return (
		<Box className={container}>
			<Button
				variant="filled"
				className={primaryBtn}
				onClick={async () => {
					updateCacheStatus({
						streamName: streamName,
						type: !checkCacheData?.data,
					});
				}}>
				{checkCacheData?.data ? 'Disable Cache' : 'Enable Cache'}
			</Button>

			<Box className={containerWrapper}>
				<Box className={innerContainer}>
					<Accordion defaultValue="" variant="contained" radius="md" w={'100%'} className={accordionSt}>
						<Accordion.Item value="Alert">
							<Accordion.Control>Alert</Accordion.Control>
							<Accordion.Panel>
								<Box>
									<Box sx={{ height: '500px' }}>
										<Editor
											onChange={(value) => {
												setAlertQuery(value);
											}}
											value={JSON.stringify(getLogAlertData, null, 2)}
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
									<Button className={submitBtn} onClick={onSubmitAlertQuery}>
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
										<Box sx={{ height: '500px' }}>
											<Editor
												onChange={(value) => {
													setRetentionQuery(value);
												}}
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
										<Button className={submitBtn} onClick={onSubmitRetentionQuery}>
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

// import React, { FC, useEffect } from 'react';
// import { Accordion, Box, Button } from '@mantine/core';
// import { useDocumentTitle, useNotifications } from '@mantine/hooks';
// import Editor from '@monaco-editor/react';
// import { IconCheck, IconFileAlert } from '@tabler/icons-react';
// import { useConfigStyles } from './styles';
// import { useHeaderContext } from '@/layouts/MainLayout/Context';
// import useCacheToggle from './hooks/useCacheToggle';
// import useAlertsEditor from './hooks/useAlertsEditor';
// import useRetentionEditor from './hooks/useRetentionEditor';

// const Config: FC = () => {
//     useDocumentTitle('Parseable | Config');
//     const { classes } = useConfigStyles();
//     const { container, submitBtn, accordionSt, innerContainer, containerWrapper, primaryBtn } = classes;
//     const notifications = useNotifications();

//     const {
//         streamName,
//         handleCacheToggle,
//         isCacheEnabled,
//     } = useCacheToggle();

//     const {
//         alertQuery,
//         handleAlertQueryChange,
//         submitAlertQuery,
//         logAlertData,
//     } = useAlertsEditor(streamName);

//     const {
//         retentionQuery,
//         handleRetentionQueryChange,
//         submitRetentionQuery,
//         logRetentionData,
//     } = useRetentionEditor(streamName);

//     return (
//         <Box className={container}>
//             <Button
//                 variant="filled"
//                 className={primaryBtn}
//                 onClick={handleCacheToggle}
//             >
//                 {isCacheEnabled ? 'Disable Cache' : 'Enable Cache'}
//             </Button>

//             <Box className={containerWrapper}>
//                 <EditorSection
//                     title="Alert"
//                     editorValue={logAlertData}
//                     onEditorChange={handleAlertQueryChange}
//                     onSubmit={submitAlertQuery}
//                     styles={{ innerContainer, accordionSt, submitBtn }}
//                 />
//                 <EditorSection
//                     title="Retention"
//                     editorValue={logRetentionData}
//                     onEditorChange={handleRetentionQueryChange}
//                     onSubmit={submitRetentionQuery}
//                     styles={{ innerContainer, accordionSt, submitBtn }}
//                 />
//             </Box>
//         </Box>
//     );
// };

// const EditorSection = ({ title, editorValue, onEditorChange, onSubmit, styles }) => (
//     <Box className={styles.innerContainer}>
//         <Accordion defaultValue="" variant="contained" radius="md" w={'100%'} className={styles.accordionSt}>
//             <Accordion.Item value={title}>
//                 <Accordion.Control>{title}</Accordion.Control>
//                 <Accordion.Panel>
//                     <Box>
//                         <Box sx={{ height: '500px' }}>
//                             <Editor
//                                 onChange={onEditorChange}
//                                 value={JSON.stringify(editorValue, null, 2)}
//                                 defaultLanguage="json"
//                                 options={{
//                                     scrollBeyondLastLine: false,
//                                     readOnly: false,
//                                     fontSize: 12,
//                                     wordWrap: 'on',
//                                     minimap: { enabled: false },
//                                     automaticLayout: true,
//                                     mouseWheelZoom: true,
//                                     glyphMargin: true,
//                                 }}
//                             />
//                         </Box>
//                         <Button className={styles.submitBtn} onClick={onSubmit}>
//                             Submit
//                         </Button>
//                     </Box>
//                 </Accordion.Panel>
//             </Accordion.Item>
//         </Accordion>
//     </Box>
// );

// export default Config;
