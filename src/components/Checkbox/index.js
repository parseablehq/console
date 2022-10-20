import React from "react";
import PropTypes from 'prop-types';

const Checkbox = ({ name, selected, onClick }) => {
  return (
    <div className="mx-2 flex">
      <label className="px-5 w-full py-2 hover:bg-primary-400 rounded cursor-pointer">
        <input
          onChange={onClick}
          type="checkbox"
          checked={selected}
          className="mb-1 h-4 w-4 text-secondary-700 ring-0 outline-0 focus bg-primary-700 mr-2 rounded-sm"
        />
        <span className="text-gray-200 text-sm">{name}</span>
      </label>
    </div>
  );
};

export default Checkbox;

Checkbox.propTypes = {
  name: PropTypes.string,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
  name: null,
  selected: false,
};
