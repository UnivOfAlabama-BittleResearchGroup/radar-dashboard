import React from "react";
import styles from "./styles/Home.module.scss";
import { MoonLoader } from "react-spinners";

const CardedPlot = ({ data_available, error,  ...props }) => {

  if (!error && !data_available) {
      return (
        <div className={styles.Plot1} style={{ height: "100%", width: "100%" }}>
          <p>Fetching sensor data...</p>
          <MoonLoader
            color="#4f65b1"
            // @ts-ignore
            css={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              margin: "auto",
            }}
          />
        </div>
      );
  }

  if (error) {
    return <p> Error </p>;
  }

  return (
    <div
    className={styles.Plot1}
    style={{ width: "100%", height: "100%" }}
    >
        {props.children}
    </div>
  );
};

export default CardedPlot;
