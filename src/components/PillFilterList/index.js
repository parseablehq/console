import React, { useRef, useState } from "react";

import PillFilter from "../PillFilter";
import className from "classnames";

const useIsOverflow = (ref, callback) => {
  const [isOverflow, setIsOverflow] = React.useState(undefined);

  React.useLayoutEffect(() => {
    const { current } = ref;
    const trigger = () => {
      const hasOverflow = current.scrollHeight > current.clientHeight;
      setIsOverflow(hasOverflow);
      if (callback) callback(hasOverflow);
    };
    if (current) {
      trigger();
    }
  }, [callback, ref]);

  return isOverflow;
};

export function PillFilterList({ x, onAdd, onRemove, values }) {
  const [isOverflow, setIsOverflow] = useState(false);
  const [selectedShowMore, setSelectedShowMore] = useState(false);
  const [selected, setSelected] = useState(values);

  const containerRef = useRef(null);

  useIsOverflow(containerRef, (overflow) => setIsOverflow(overflow));

  return (
    <>
      <div
        ref={containerRef}
        className={className("flex flex-wrap", {
          "max-h-[6rem] overflow-hidden": !selectedShowMore,
        })}
      >
        {x.map((x) => (
          <PillFilter
            text={x}
            selected={selected.includes(x)}
            onClick={() => {
              if (selected.includes(x)) {
                onRemove(x)
                setSelected([...selected.filter((val) => val !== x)]);
              } else {
                onAdd(x)
                setSelected([...selected, x]);
              }
            }}
          />
        ))}
      </div>
      <div>
        {isOverflow && (
          <PillFilter
            onClick={() => setSelectedShowMore(true)}
            text={"Show More"}
          />
        )}
      </div>
    </>
  );
}
