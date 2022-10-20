import React, { useRef, useState } from "react";
import PropTypes from 'prop-types';

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
          "max-h-[5rem] overflow-hidden": !selectedShowMore,
        })}
      >
        {x.map((item) => (
          <PillFilter
            text={item}
            selected={selected.includes(item)}
            onClick={() => {
              if (selected.includes(item)) {
                onRemove(item)
                setSelected([...selected.filter((val) => val !== item)]);
              } else {
                onAdd(item)
                setSelected([...selected, item]);
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

PillFilterList.propTypes = {
  x: PropTypes.arrayOf(PropTypes.string),
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
};

PillFilterList.defaultProps = {
  x: [],
  values: [],
};
