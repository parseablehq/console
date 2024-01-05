// import { useState } from 'react';
// import { useMutation } from 'react-query';
// import { putLogStreamRetention } from '@/api/logStream';

// const useRetentionEditor = (streamName) => {
//     const [retentionQuery, setRetentionQuery] = useState('');

//     const { mutate: updateLogStreamRetention } = useMutation(
//         (data) => putLogStreamRetention(streamName, data),
//         {
//             onSuccess: () => notifyApi({ /* ...success notification details... */ }),
//             onError: () => notifyApi({ /* ...error notification details... */ }),
//         },
//     );

//     const handleRetentionQueryChange = (value) => setRetentionQuery(value);

//     const submitRetentionQuery = () => {
//         try {
//             JSON.parse(retentionQuery);
//             updateLogStreamRetention(retentionQuery);
//         } catch (e) {
//             notifyApi({ /* ...error notification details... */ });
//         }
//     };

//     return {
//         retentionQuery,
//         handleRetentionQueryChange,
//         submitRetentionQuery,
//         logRetentionData: /* ...data from API or state... */,
//     };
// };
