import React from "react";

const Tooltip = ({ feature }) => {
  const { id } = feature.id;

  return (
    <div id={`tooltip-${id}`}>
        {/* Loop all the properties in feature.properties and display the key & value */}
        {Object.keys(feature.properties).map((key) => (
            <div key={key}>
                <strong>{key}</strong>: {feature.properties[key]}
            </div>
        ))}
    </div>
  );
};

export default Tooltip;