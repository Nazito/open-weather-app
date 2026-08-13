import React, { memo } from "react";

const HoursesComponent = ({ hourses = [] }) => {
  return (
    <div className="hourses">
      {hourses.map((hours, index) => {
        if (index % 6 !== 0) return null;
        return (
          <div key={`${hours}-${index}`} className="hours">
            {hours}
          </div>
        );
      })}
    </div>
  );
};

export default memo(HoursesComponent);
