// @ts-nocheck
import React, { useRef, useEffect } from "react";

import CardedPlot from "./CardedPlot";
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer } from "react-map-gl";
import { createRoot } from "react-dom/client";
import Tooltip from "./Tooltip";
import { DateTime } from "luxon";
import ParamHandler from "../sharedTypes";
import Config from "../config.json";

// @ts-ignore
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWF4LXNjaHJhZGVyIiwiYSI6ImNrOHQxZ2s3bDAwdXQzbG81NjZpZm96bDEifQ.etUi4OK4ozzaP_P8foZn_A";

const gpsLayer = {
  id: "gps",
  type: "line",
  paint: {
    "line-width": 2,
    'line-color': ['get', 'color'],
  },
};

// create a layer for the latest gps data
const latestGPSLayer = {
  id: "latest-gps",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": ['get', 'color'],
  },
};

// const addressLayer = {
//   id: "address",
//   type: "circle",
//   paint: {
//     "circle-radius": 10,
//     // make the circle color red
//     "circle-color": "#ff0000",
//   },
// };

// const arrivedLayer = {
//   id: "arrivedAt",
//   type: "circle",
//   paint: {
//     "circle-radius": 5,
//     // make the circle color green
//     "circle-color": "#00ff00",
//   },
// };

// const completedLayer = {
//   id: "completedAt",
//   type: "circle",
//   paint: {
//     "circle-radius": 5,
//     // make the circle color purple
//     "circle-color": "#800080",
//   },
// };

// const gpsMatchLayer = {
//   id: "gpsMatch",
//   type: "circle",
//   paint: {
//     "circle-radius": 6,
//     // make the circle color yellow
//     "circle-color": "#ffff00",
//   },
// };

// const gpsStopLayer = {
//   id: "gpsStop",
//   type: "circle",
//   paint: {
//     "circle-radius": 6,
//     // make the circle color orange
//     "circle-color": "#ffa500",
//   },
// };

const getGPSData = async (/** @type {ParamHandler} */ config) => {
  return await fetch(Config.SERVER_URL + "/api/radar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.getQuery()),
  }).then((r) => r.json());
};

const data2LineString = (/** @type {any[]} */ data) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: data.map((d) => d.geometry.coordinates),
    },
  };
};

const data2Point = (/** @type {any[]} */ data) => {
  return {
    type: "FeatureCollection",
    features: [data[data.length - 1]],
  };
};

const GPSMap = ({ sliderRange, config, resizeFuncs, ...props }) => {
  const mapRef = React.useRef();
  const [gpsData, setGPSData] = React.useState({
    raw: {},
    lineString: {},
    pointLayer: {},
  });
  
  const tooltipRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  // set gps data using useEffect
  useEffect(() => {
    getGPSData(config).then((/** @type {any} */ data) => {
      // flip the coordinates in the data
      data.features = data.features.map((/** @type {any} */ d) => {
        const coords = d.geometry.coordinates;
        d.geometry.coordinates = [coords[1], coords[0]];
        return d;
      });

      // sort the data by time
      data.features.sort((a, b) => {
        // @ts-ignore
        return new Date(a.properties.epoch_time) - new Date(b.properties.epoch_time);
      });

      // save a copy of the unfiltered data
      setGPSData({
        raw: data,
        lineString: data2LineString(data.features),
        pointLayer: data2Point(data.features),
      });
      // center the map on the average of the coordinates
      const avgCoords = data.features
        .reduce(
          (/** @type {any} */ acc, /** @type {any} */ d) => {
            acc[0] += d.geometry.coordinates[0];
            acc[1] += d.geometry.coordinates[1];
            return acc;
          },
          [0, 0]
        )
        .map((/** @type {number} */ d) => d / data.features.length);
      // @ts-ignore
      mapRef.current.getMap().setCenter(avgCoords);
    });
  }, [config]);

  // update the data when the slider range changes
  useEffect(() => {
    if (gpsData.raw?.features) {
      // log the slider range to the console
      // console.log(sliderRange[0].toISO(), sliderRange[1].toISO())
      const filteredData = gpsData.raw.features.filter(
        (/** @type {any} */ feature) => {
          const dater = DateTime.fromISO(feature.properties.epoch_time).setZone(
            "UTC"
          );
          return dater >= sliderRange[0] && dater <= sliderRange[1];
        }
      );

      // only set the GPS data if it has length
      if (filteredData.length) {
        // @ts-ignore
        setGPSData({
          raw: gpsData.raw,
          // lineString: data2LineString(filteredData),
          pointLayer: data2Point(filteredData),
        });
      }
    }
  }, [sliderRange]);

  resizeFuncs["gps_map"] = (_) => {
    try {
      // resize the map
      // @ts-ignore
      mapRef.current.getMap().resize();
    } catch (error) {
      console.log(error);
    }
  };

  const buildTooltip = (/** @type {any} */ e) => {
    // get the data from the event
    // @ts-ignore
    const features = mapRef.current
      .getMap()
      .queryRenderedFeatures(e.point, { layers: ["latest-gps"] });
    if (features.length > 0) {
      const feature = features[0];

      // @ts-ignore
      mapRef.current.getMap().getCanvas().style.cursor =
        features.length > 0 ? "pointer" : "";

      // Create tooltip node
      const tooltipNode = document.createElement("div");
      // use create root to render the tooltip
      createRoot(tooltipNode).render(<Tooltip feature={feature} />);

      // Set tooltip on map
      tooltipRef.current
        .setLngLat(e.lngLat)
        .setDOMContent(tooltipNode)
        .addTo(mapRef.current.getMap());
    }

    // build tooltip for the arrivedAt data
    // @ts-ignore
    const arrivedAtFeatures = mapRef.current
      .getMap()
      .queryRenderedFeatures(e.point, {
        layers: ["arrivedAt", "completedAt", "address"],
      });
    if (arrivedAtFeatures.length > 0) {
      const feature = arrivedAtFeatures[0];

      // @ts-ignore
      mapRef.current.getMap().getCanvas().style.cursor =
        arrivedAtFeatures.length > 0 ? "pointer" : "";

      // Create tooltip node
      const tooltipNode = document.createElement("div");
      // use create root to render the tooltip
      createRoot(tooltipNode).render(<Tooltip feature={feature} />);

      // Set tooltip on map
      tooltipRef.current
        .setLngLat(e.lngLat)
        .setDOMContent(tooltipNode)
        .addTo(mapRef.current.getMap());
    }
  };

  return (
    <CardedPlot data_available={true} error={false}>
      <Map
        initialViewState={{
          // center on London
          // latitude: 51.5074,
          // longitude: 0.1278,
          zoom: 10,
        }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        // @ts-ignore
        ref={mapRef}
        divID={"gps_map"}
        onMouseMove={(e) => {
          buildTooltip(e);
        }}
        interactiveLayerIds={[
          "gps",
          "latest-gps",
          "arrivedAt",
          "completedAt",
          "address",
          "gpsMatch",
        ]}
      >
        {/* <Source id="gps" type="geojson" data={gpsData.lineString}>
          <Layer {...gpsLayer} />
        </Source> */}
        <Source id="latest-gps" type="geojson" data={gpsData.pointLayer}>
          <Layer {...latestGPSLayer} />
        </Source>
      </Map>
    </CardedPlot>
  );
};

export default GPSMap;
