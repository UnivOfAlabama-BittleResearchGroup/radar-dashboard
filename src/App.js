import React from "react";
import SiteLayout from "./components/SiteLayout";
import GridMain from "./components/BasicGrid";
import VelocityPlot from "./components/Velocity";
import GPSMap from "./components/NewMap";
import { DateTime } from "luxon";
// import Config from "./dashboard_config.json";
import ParamHandler from "./sharedTypes";
import RangeSlider from "./components/RangeSlider";
import PlayButton from "./components/PlayButton";
import Selectors from "./components/Selectors";

const Home = ({ ...props }) => {
  // @ts-ignore
  const [configState, setConfigState] = React.useState(
    new ParamHandler(
      DateTime.fromObject(
        { year: 2023, month: 3, day: 2, hour: 23, minute: 5, second: 0 },
        { zone: "UTC" }
      )
    )
  );
  const [sliderRange, setSliderRange] = React.useState([
    configState.startTime,
    configState.endTime,
  ]);

  const onSliderChange = React.useCallback((range) => {
    setSliderRange(range);
  }, []);

  const resizeFuncs = {};
  return (
    <div id="body">
      <SiteLayout
        // @ts-ignore
        className={"drawingmat_dark"}
      >
        <RangeSlider
          sliderRange={sliderRange}
          setSliderRange={onSliderChange}
          config={configState}
        />
        <span
          className="selector-row"
          style={{ display: "flex", width: "100%" }}
        >
          <PlayButton
            sliderRange={sliderRange}
            setSliderRange={onSliderChange}
          />
          {/* <Selectors config={configState} setConfig={setConfigState} /> */}
        </span>
        <GridMain plotIDS={["map", "velocity"]} resizeFuncs={resizeFuncs}>
          <GPSMap
            key={"gps_map"}
            config={configState}
            sliderRange={sliderRange}
            grid={{ h: 20, w: 12 }}
            resizeFuncs={resizeFuncs}
          />

          {/* <VelocityPlot 
              setSliderRange={onSliderChange} 
              sliderRange={sliderRange}
              config={configState}
              key={"velocity_plot"}
              props={props}
              grid={{h: 10, w: 6, }}
              location={"velocity"}
              smallText={"velocity"}
              resizeFuncs={resizeFuncs}
            /> */}

          {/* <DynamicPlot
              key={i}
              location_pairs={p.location_pairs}
              props={props}
              plotID={p.name}
              resizeFuncs={resizeFuncs}
              location={p.name}
              smallText={p.smallText}
              grid={p.grid}
              sensorTooltip={p.sensorTooltip? p.sensorTooltip : ""}
            /> */}
        </GridMain>
      </SiteLayout>
    </div>
  );
};

export default Home;
