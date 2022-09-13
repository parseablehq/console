import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import React from "react";

const TagFilters = ({
  selectedTags,
  setSelectedTags,
  availableTags,
  removeTag,
}) => (
  <div className="ml-3 flex-1">
    <MultiSelectDropdown
      values={selectedTags}
      setSelectedValues={setSelectedTags}
      data={availableTags}
      removeValue={removeTag}
      name={"Tag Filters"}
    />
  </div>
);

export default TagFilters;
