// // A react component that renders a drop down of the available gps IDs

// import { DateTime } from 'luxon';
// import React from 'react';
// import Select from 'react-select';
// import Config from '../config.json';
// import ParamHandler from '../sharedTypes';


// const getDeviceIds = async () => {
//     return await fetch(Config.SERVER_URL + '/api/device_ids', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//     }).then(
//         response => response.json()
//     )
// }


// // @ts-ignore
// const Selectors = ({/** @type {ParamHandler} */ config, setConfig }) => {
//     // @ts-ignore
//     const [deviceIds, setDeviceIds] = React.useState([{value: config.deviceID, label: config.deviceID.toString()}]);
//     const [availableDates, setAvailableDates] = React.useState([]);
//     const [allDates, setAllDates] = React.useState([]);

//     React.useEffect(() => {
//         getDeviceIds().then(deviceIds => {
//             // get the unqiue device ids
//             const uniqueDeviceIds = [...new Set(deviceIds.map(deviceId => deviceId.deviceId))];

//             // @ts-ignore
//             setDeviceIds(uniqueDeviceIds.map((d) => {
//                 return { value: d, label: d.toString() }
//             }));

//             setAllDates(deviceIds)
//         });
//     }, []);

//     return (
//         <div style={{display: 'flex'}}>
//             <Select
//                 name="gpsId"
//                 defaultValue={config.deviceID}
//                 onChange={(e) => {
//                     setConfig(new ParamHandler(e.value, config.startTime));
//                     // filter the available dates for the selected device
//                     // @ts-ignore
//                     setAvailableDates(allDates.filter(d => d.deviceId === e.value).map(d => ({ value: d.date, label: d.date })));
//                 }}
//                 // @ts-ignore
//                 options={deviceIds}
//             />

//             <Select
//                 name="date"
//                 defaultValue={config.startTime.toISODate()}
//                 onChange={(e) => {
//                     const startTime = DateTime.fromISO(e.value).setZone("GMT").set({hour: 6, minute: 0, second: 0, millisecond: 0});
//                     // const endTime = startTime.set({ hour: 23 });
//                     // config.changeTime(startTime, endTime);
//                     setConfig(new ParamHandler(config.deviceID, startTime));
//                 }}
//                 // @ts-ignore
//                 options={availableDates}
//             />
//         </div>
//     );
// }

// export default Selectors;