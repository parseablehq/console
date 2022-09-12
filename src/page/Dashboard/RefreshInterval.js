import Dropdown from "../../components/Dropdown";
import React from "react";

const RefreshInterval = ({ range, interval, setInterval }) => {
  const refreshIntervalArray = [
    {
      name: "1 sec",
      value: 1,
    },
    {
      name: "2 sec",
      value: 2,
    },
    {
      name: "5 sec",
      value: 5,
    },
    {
      name: "10 sec",
      value: 10,
    },
    {
      name: "20 sec",
      value: 20,
    },
    {
      name: "1 min",
      value: 60,
    },
    {
      name: "None",
      value: null,
    },
  ];

  return (
    <div>
      <Dropdown
        disabled={range === 7}
        data={refreshIntervalArray}
        value={interval}
        setValue={setInterval}
        name={"Refresh Interval"}
      />
    </div>
  );
};

export default RefreshInterval;
