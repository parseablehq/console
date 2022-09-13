import React from "react";

const Checkbox = ({ name, selected, onClick }) => {
  return (
    <div className="mx-1 my-1 flex">
      <label className="px-5 w-full py-3 hover:bg-blue-50 rounded">
        <input
          onChange={onClick}
          type="checkbox"
          checked={selected}
          className="mb-1 h-5 w-5 mr-2 border-2 custom-focus border-gray-400 rounded-sm"
        />
        <span className="font-semibold">{name}</span>
      </label>
    </div>
  );
};

export default Checkbox;
