// make a play button that updates the slider range with a constant interval

import { DateTime } from "luxon";
import React, { useEffect, useRef, useState } from "react";


function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        // @ts-ignore
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }



const PlayButton = ({ sliderRange, setSliderRange }) => {

    const [play, setPlay] = useState(false);
    // const [interval, setInterval] = useState(1000);

    useInterval(
        () => {
            // Your custom logic here
            const [start, end] = sliderRange;
            const newStart = start;
            const newEnd = end.plus({seconds: 1});
            setSliderRange([newStart, newEnd]);
        },
        play ? 1000 : null
    )



    return (
        <div>
            <button onClick={() => setPlay(!play)}>
                {play ? "Pause" : "Play"}
            </button>
        </div>
    )
}


export default PlayButton;