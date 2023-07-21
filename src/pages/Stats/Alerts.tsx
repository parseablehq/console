
import { useGetLogStreamAlert } from '@/hooks/useGetLogStreamAlert';
import { useGetLogStreamRetention } from '@/hooks/useGetLogStreamRetention';
import { useGetLogStreamStat } from '@/hooks/useGetLogStreamStat';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useAlertsStyles } from './styles';


const Alerts: FC = () => {
    useDocumentTitle('Parseable | Login');
    const { state: { subLogQuery } } = useHeaderContext();
    const { data, error, loading, getLogAlert, resetData } = useGetLogStreamAlert();
    const { data: data2, error: error2, loading: loading2, getLogRetention: getLogRetention, resetData: resetData2 } = useGetLogStreamRetention();
    const { data: data3, error: error3, loading: loading3, getLogStat: getLogStat, resetData: resetData3 } = useGetLogStreamStat();
    useEffect(() => {
        getLogAlert(subLogQuery.get().streamName);
        getLogRetention(subLogQuery.get().streamName);
        getLogStat(subLogQuery.get().streamName);
        return () => {
            resetData();
            resetData2();
            resetData3();
        }
    }, [subLogQuery]);
    const { classes } = useAlertsStyles();
    const { container, headContainer,statusText ,statusTextResult ,genterateContiner ,genterateText,genterateTextResult} = classes
    return (
        <Box className={container}>
            <Box className={headContainer}>
                    <Text className={statusText}>
                        Status: <span className={statusTextResult} > {"- Receiving"}</span>
                    </Text>
                
                <Box className={genterateContiner}>
                    <Text className={genterateText}>
                        Genterated at :
                    </Text>
                    <Text className={genterateTextResult}>
                        {"07/07/2023 - 18:01:59"}
                    </Text>
                </Box>

            </Box>

        </Box>
    );
};

export default Alerts;
