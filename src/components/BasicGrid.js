import styles from "./styles/Dashboard.module.scss";
import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";


const ResponsiveGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

const DEFAULT_H = 10;
const DEFAULT_W = 4;

const gridGen = (/** @type {any} */ children) => {
  let running = {
    x: 0,
    y: 0,
    row_num: -1,
  };
  return React.Children.map(children, (c, i) => {
    const h = c.props.grid?.h ? c.props.grid.h : DEFAULT_H;
    const w = c.props.grid?.w ? c.props.grid.w : DEFAULT_W;
    if (i > 0) {
      running.x = (running.x + w) % 12;
    }
    running.row_num =
      running.x == 0 && i > 0 ? running.row_num + 1 : running.row_num;
    running.y = running.row_num * DEFAULT_H;
    return {
      h: h,
      w: w,
      x: running.x,
      y: running.y,
    };
  });
};

/**
 * @param {number | undefined} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const resizePlot = async (/** @type {{ [x: string]: () => void; }} */ funcs, /** @type {string} */ plotID, end = false) => {
  // Hack to get the plots to resize correctly
  funcs[plotID.replace(".$", "")]();
  if (!end) {
    sleep(1000).then(() => resizePlot(funcs, plotID, true));
  }
};

function GridMain({ resizeFuncs, ...props }) {
  const [layouts, setLayouts] = useState(
    JSON.parse(JSON.stringify(originalLayouts))
  );

  const resetLayout = () => {
    setLayouts({});
  };

  const onLayoutChange = (/** @type {import("react-grid-layout").Layout[]} */ layout, /** @type {import("react-grid-layout").Layouts} */ layouts, /** @type {undefined} */ element) => {
    saveToLS("layouts", layouts);
    setLayouts(layouts);
    // resize the plotly figures
  };

  const gridDims = gridGen(props.children);

  return (
    <div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 4, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={(layout, layouts) => onLayoutChange(layout, layouts)}
        onResizeStop={(_e, e, element) => {
          resizePlot(resizeFuncs, element.i.split("/")[0]);
        }}
        onResizeStart={(_e, e, element) => {
          resizePlot(resizeFuncs, element.i.split("/")[0]);
        }}
        isDraggable={true}
        // #TODO: This is hacky. Should create my own CSS selector
        draggableCancel={".js-plotly-plot"}
      >
        {React.Children.map(props.children, (c, i) => {
          const grid = gridDims[i];
          return (
            <div
              key={c.props.plotID}
              data-grid={{
                i: c.props.plotID,
                x: grid.x,
                y: grid.y,
                w: grid.w,
                h: grid.h,
                minW: 6,
                minH: 10,
                isDraggable: false,
                isResizable: true,
                resizeHandles: ["se"],
              }}
            >
              <div className={styles.card_small}>
                {/* <div className={styles.card_header_two_line}>
                  <div className={styles.main_title}>
                    {c.props?.location}
                    <br />
                  </div>
                  <div className={styles.card_header_small_text}>
                    {c.props.smallText}
                  </div>
                </div> */}
                {c}
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}

/**
 * @param {string} key
 */
function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8") || "") || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

/**
 * @param {string} key
 * @param {any} value
 */
function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value,
      })
    );
  }
}

export default GridMain;
