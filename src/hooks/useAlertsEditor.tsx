// import { useState } from 'react';
// import { useMutation } from 'react-query';
// import { putLogStreamAlerts } from '@/api/logStream';

// const useAlertsEditor = (streamName) => {
//     const [alertQuery, setAlertQuery] = useState('');

//     const { mutate: updateLogStreamAlerts } = useMutation(
//         (data) => putLogStreamAlerts(streamName, data),
//         {
//             onSuccess: () => notifyApi({ /* ...success notification details... */ }),
//             onError: () => notifyApi({ /* ...error notification details... */ }),
//         },
//     );

//     const handleAlertQueryChange = (value) => setAlertQuery(value);

//     const submitAlertQuery = () => {
//         try {
//             JSON.parse(alertQuery);
//             updateLogStreamAlerts(alertQuery);
//         } catch (e) {
//             notifyApi({ /* ...error notification details... */ });
//         }
//     };

//     return {
//         alertQuery,
//         handleAlertQueryChange,
//         submitAlertQuery,
//         logAlertData: /* ...data from API or state... */,
//     };
// };
