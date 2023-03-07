// import React from "react";
// import CardedPlot from "./CardedPlot";
// import ParamHandler from "../sharedTypes";
// import Plotly from "plotly.js";
// import createPlotComponent from "react-plotly.js/factory";
// import styles from "./styles/Home.module.scss";
// import { useMeasure } from "react-use";
// import { DateTime } from "luxon";
// import Config  from "../config.json";

// // create the plot
// const Plot = createPlotComponent(Plotly);

// // create a function to fetch the velocity data from the API with a json post request
// const fetchVelocityData = async (/** @type {ParamHandler} */ configObj) => {
//   // fetch the data from the API
//   // return the data
//   return await fetch(Config.SERVER_URL + "/api/velocity", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(configObj.getQuery())
//   }).then(
//     (/** @type {any} */ r) => r.json()
//   ).then(
//     (d_json) => {
//       return d_json.map((/** @type {{ time: string; velocity: any; }} */ d) => {
//         return {
//           x: DateTime.fromISO(d.time).setZone("GMT"),
//           y: d.velocity
//         }
//       })
//     }
//   )
// }


// // fetch the bookings table completed & arrived at data from the API
// // create a function to fetch the velocity data from the API with a json post request
// const fetchBookingsData = async (/** @type {ParamHandler} */ configObj) => {
//   // fetch the data from the API
//   // return the data
//   return await fetch(Config.SERVER_URL + "/api/bookings_times", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(configObj.getQuery())
//   }).then(
//     (/** @type {any} */ r) => r.json()
//   )
// }

// // create a function to create the vertical lines out of the bookings data
// const createVerticalLines = (/** @type {string | any[]} */ bookingsData, /** @type {string} */ columnName, /** @type {number} */ maxY) => {
//   // create an array to store the vertical lines
//   const verticalLines = []
//   // loop through the bookings data
//   for (let i = 0; i < bookingsData.length; i++) {
//     // create a variable to store the current booking
//     const booking = bookingsData[i]

//     // loop twice to create the two vertical lines for each booking
//     for (let j = 0; j < 2; j++) {
//       verticalLines.push({
//         x: booking[columnName],
//         y: j > 0 ? maxY : 0
//       })
//     }

//     // add a null point to the array to create a gap between the two vertical lines
//     verticalLines.push({ x: booking[columnName], y: null })
//   }
//   // return the vertical lines
//   return verticalLines
// }


// // var getDaysArray = function (/** @type {string | number | Date} */ start, /** @type {string | number | Date} */ end) {
// //   for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setMinutes(dt.getMinutes() + 5)) {
// //     arr.push(new Date(dt));
// //   }
// //   return arr;
// // };

// export const PlotLayout = (width, height) => ({
//   paper_bgcolor: "rgb(255,255,255)",
//   plot_bgcolor: "rgb(229,229,229)",
//   // height: undefined,
//   // width: undefined,
//   font: {
//     family: "Courier New, monospace",
//     size: 11,
//     color: "#7f7f7f",
//   },
//   margin: {
//     l: width > 1400 ? 50 : 40,
//     r: width > 1400 ? 50 : 40,
//     b: 50,
//     t: 20,
//   },
//   // autosize: true,
//   legend: {
//     y: width > 600 ? (height > 300 ? 1.1 : 1.3) : -0.2,
//     x: 0,
//     yanchor: "top",
//     orientation: "h",
//     bgcolor: "#ffffffff",
//   },
//   uirevision: "true",
//   yaxis: {
//     // gridcolor: "rgb(255,255,255)",
//     showgrid: true,
//     showline: false,
//     showticklabels: true,
//     // tickcolor: "rgb(127,127,127)",
//     ticks: "outside",
//     zeroline: true,
//     title: "Velocity",
//     color: "#4f65b1",
//   },
//   xaxis: {
//     gridcolor: "rgb(255,255,255)",
//     showgrid: true,
//     showline: false,
//     showticklabels: true,
//     tickcolor: "rgb(127,127,127)",
//     ticks: "outside",
//     zeroline: false,
//   }
// });


// const VelocityPlot = ({ setSliderRange, sliderRange, config, resizeFuncs, ...props }) => {

//   // get the data from the API
//   const [bookingsData, setBookingData] = React.useState([])
//   const [componentRef, { x, y, width, height, top, right, bottom, left }] = useMeasure();


//   // store the plotly state
//   const [plotlyState, setPlotlyState] = React.useState({
//     data: [],
//     layout: {
//       ...PlotLayout(width, height),
//       title: 'Velocity',
//       xaxis: {
//         autorange: false,
//         // rangeslider: true,
//         type: 'date'
//       },
//       yaxis: {
//         autorange: true,
//         type: 'linear'
//       }

//     },
//     frames: [],
//     config: {}
//   })

//   // get the velocity data from the API using react hooks
//   React.useEffect(() => {
//     fetchVelocityData(config).then(
//       (/** @type {any} */ data) => {

//         // this is slow cause effectively synchronous but it's fine
//         fetchBookingsData(config).then(
//           (/** @type {any} */ bookingsData) => {
//             // @ts-ignore
//             const maxY = Math.max(...data.map((/** @type {{ y: any; }} */ d) => d.y))
//             console.log(maxY)
//             const arrivedAtVerticalLines = createVerticalLines(bookingsData, "arrivedAt", maxY)
//             // create vertical lines for the departedAt times
//             const completedAtVerticalLines = createVerticalLines(bookingsData, "completedAt", maxY)
//             const gpsVerticalLines = createVerticalLines(bookingsData, "positionFixTime", maxY)
//             const gpsStopLines = createVerticalLines(bookingsData, "GPS_stopTime", maxY)

//             setPlotlyState(
//               {
//                 data: [
//                   // @ts-ignore
//                   {
//                     x: data.map((/** @type {{ x: any; }} */ d) => d.x.toISO()),
//                     y: data.map((/** @type {{ y: any; }} */ d) => d.y),
//                     type: "scatter",
//                     mode: "lines+markers",
//                     marker: { color: "red" },
//                     name: "Velocity"
//                   },
//                   // add the other data already in the plotly state
//                   // @ts-ignore
//                   {
//                     x: arrivedAtVerticalLines.map((/** @type {{ x: any; }} */ d) => d.x),
//                     y: arrivedAtVerticalLines.map((/** @type {{ y: any; }} */ d) => d.y),
//                     type: "scatter",
//                     mode: "lines",
//                     marker: { color: "green" },
//                     name: "Arrived At",
//                     // connectgaps: true
//                   },
//                   // @ts-ignore
//                   {
//                     x: gpsVerticalLines.map((/** @type {{ x: any; }} */ d) => d.x),
//                     y: gpsVerticalLines.map((/** @type {{ y: any; }} */ d) => d.y),
//                     type: "scatter",
//                     mode: "lines",
//                     marker: { color: "yellow" },
//                     name: "GPS Position Match",
//                     // connectgaps: true
//                   },
//                   // @ts-ignore
//                   {
//                     x: completedAtVerticalLines.map((/** @type {{ x: any; }} */ d) => d.x),
//                     y: completedAtVerticalLines.map((/** @type {{ y: any; }} */ d) => d.y),
//                     type: "scatter",
//                     mode: "lines",
//                     marker: { color: "Purple" },
//                     name: "Completed At",
//                   // connectgaps: true
//                 },
//                 // @ts-ignore
//                 {
//                   x: gpsStopLines.map((/** @type {{ x: any; }} */ d) => d.x),
//                   y: gpsStopLines.map((/** @type {{ y: any; }} */ d) => d.y),
//                   type: "scatter",
//                   mode: "lines",
//                   marker: { color: "Orange" },
//                   name: "Bike Parks",
//                 // connectgaps: true
//               },

//                 ],
//                 layout: plotlyState.layout,
//               }
//             )
//           })
//       })
//   }, [config])

//   // create a hook to update the data range when the slider range changes
//   React.useEffect(() => {
//     // create the xaixs range array as a string
//     const xaxisRange = sliderRange.map((/** @type {DateTime} */ d) => d.toISO())

//     // @ts-ignore
//     setPlotlyState({ ...plotlyState, layout: { ...plotlyState.layout, xaxis: { ...plotlyState.layout.xaxis, range: xaxisRange } } })
//   }, [sliderRange])


//   React.useEffect(() => {

//   }, [config.deviceID])

//   resizeFuncs["velocity_plot"] = (_) => {
//     try {
//       Plotly.Plots.resize("velocity_plot");
//       // @ts-ignore
//       Plotly.relayout(document.getElementById("velocity_plot"), { autosize: true });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (

//     <CardedPlot data_available={plotlyState.data.length > 0} error={false}>
//       <div
//         className={styles.Plot1}
//         // @ts-ignore
//         ref={componentRef}
//         style={{ width: "100%", height: "100%" }}
//       >
//         <Plot
//           divId={"velocity_plot"}
//           data={plotlyState.data}
//           // @ts-ignore
//           layout={plotlyState.layout}
//           // onUpdate={(/** @type {any} */ figure) => {
//           //   // @ts-ignore
//           //   setPlotlyState(figure)
//           // }}
//           // onRestyle={(/** @type {any} */ figure) => {
//           //   // @ts-ignore
//           //   console.log(figure)
//           //   // @ts-ignore
//           // }}
//           // onRelayout={(xaxis) => {
//           //   // console.log(xaxis)
//           //   if (xaxis['xaxis.range[0]']) {
//           //     // @ts-ignore
//           //     // convert 2022-03-03 11:34:57.7565 to DateTime
//           //     setSliderRange([DateTime.fromISO(xaxis['xaxis.range[0]'].replace(" ", "T").concat("Z")).setZone("GMT"), 
//           //                     DateTime.fromISO(xaxis['xaxis.range[1]'].replace(" ", "T").concat("Z")).setZone("GMT")])
//           //     // save the current state of the plot
//           //     // setPlotlyState({data: plotData, layout: layout, frames: [], config: {}})
//           //   }
//           // }}
//           // useResizeHandler={true}
//           style={{ width: "100%", height: height > 400 ? "95%" : "90%" }}
//         />
//       </div>
//     </CardedPlot>

//   )
// }


// export default VelocityPlot;
