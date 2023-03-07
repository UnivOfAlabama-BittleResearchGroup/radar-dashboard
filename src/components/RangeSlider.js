import { DateTime } from "luxon";
import React from "react";
import TimeRange from "react-timeline-range-slider";
import ParamHandler from "../sharedTypes";


const setRange = (range, setSliderRange) => {
    // if the range is an object with a time property, set the sliderRange to the time property
    if (range.time) {
        range = [range.time[0], range.time[1]];
    }
    const start = DateTime.fromJSDate(new Date(range[0])).setZone('GMT');
    const end = DateTime.fromJSDate(new Date(range[1])).setZone('GMT');
    setSliderRange([start, end]);
}



const RangeSlider = ({ config, sliderRange,  setSliderRange}) => (
    <div>
        <TimeRange
            timelineInterval={[new Date(config.startTime.toISO()), new Date(config.endTime.toISO())]}
            // value={sliderRange}
            error={false}
            onErr={err => {
                if (err) {
                    console.log(err);
                }
            } }
            onChangeCallback={(time) => setRange(time, setSliderRange)}
            ticksNumber={50}

            onUpdateCallback={(time) => setRange(time, setSliderRange)}
            // format the tick to show the date & time
            formatTick={(tick) => {
                // if the date == the start or end date, show the day, else only the time
                // convert the tick to a date
                const tickDate = DateTime.fromJSDate(new Date(tick)).setZone('UTC');
                if (tickDate === config.startTime || tickDate === config.endTime) {
                    // show month day year & time
                    // convert the tickDate to a luxon DateTime, then set the zone to GMT
                    return tickDate.toISO();
                } else {
                    return tickDate.toISOTime({ suppressMilliseconds: false });
                }
            } }
            step={1 * 1000}
            allowCross={false}
            className="slider"
            mode={3} />
    </div>
)


export default RangeSlider;