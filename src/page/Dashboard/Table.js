import BeatLoader from "react-spinners/BeatLoader";
import React from "react";

function hasSubArray(master, sub) {
  master.sort();
  sub.sort();
  return sub.every(
    (
      (i) => (v) =>
        (i = master.indexOf(v, i) + 1)
    )(0)
  );
}

const Table = ({
  selectedLogSchema,
  logQueries,
  selectedTags,
  searchQuery,
  setOpen,
  setClickedRow,
  addAvailableTags,
  addAvailableMeta,
  selectedMeta,
  selectedFilters,
  hideError,
}) => {
  function filterCheck(data) {
    if (!selectedFilters.length) {
      return true;
    }

    for (const filter of selectedFilters) {
      const column = filter.column;
      const query =
        typeof filter.query === "number"
          ? filter.query.toString()
          : filter.query;
      const dataField =
        typeof data[column] === "number"
          ? data[column].toString()
          : data[column];
      let fieldContains = dataField.toLowerCase().includes(query.toLowerCase());
      if (fieldContains !== filter.contains) {
        return false;
      }
    }
    return true;
  }

  return (
    <>
      <table className="divide-y min-w-full divide-gray-300">
        <thead className=" bg-gray-200">
          <tr className="">
            {selectedLogSchema?.map((name) => (
              <th
                // scope="col"
                className="px-3 whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        {logQueries.isLoading &&
        (!logQueries.data ||
          !logQueries.data?.pages ||
          logQueries.data?.pages?.length === 0) ? (
          <tbody>
            <tr align={"center"}>
              <td
                colSpan={selectedLogSchema.length}
                className="py-3 justify-center"
              >
                <BeatLoader
                  color={"#1A237E"}
                  loading={logQueries.isFetching}
                  cssOverride={{
                    display: "block",
                    margin: "0 auto",
                    borderColor: "red",
                  }}
                  size={10}
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-200 bg-white">
            {logQueries?.data?.pages?.map &&
            logQueries.data.pages.length &&
            logQueries.data.pages[0].data.length ? (
              logQueries.data.pages.map(
                (page) =>
                  page?.data?.map &&
                  page?.data?.map(
                    (data, index) =>
                      filterCheck(data) &&
                      hasSubArray(data.p_metadata?.split("^"), selectedMeta) &&
                      hasSubArray(data.p_tags?.split("^"), selectedTags) &&
                      (searchQuery === "" ||
                        JSON.stringify(data)
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())) && (
                        <tr
                          onClick={function () {
                            setOpen(true);
                            setClickedRow(data);
                          }}
                          className="cursor-pointer hover:bg-slate-100 hover:shadow"
                          key={index}
                        >
                          {selectedLogSchema.map((schema) => (
                            <td className="truncate text-ellipsis overflow-hidden max-w-200 sm:max-w-xs md:max-w-sm lg:max-w-sm  xl:max-w-md px-3 py-4 text-xs md:text-sm text-gray-700">
                              {data[schema] || ""}
                            </td>
                          ))}

                          {data.p_tags?.split("^").forEach((tag) => {
                            tag && addAvailableTags(tag);
                          })}

                          {data.p_metadata?.split("^").forEach((tag) => {
                            addAvailableMeta(tag);
                          })}
                        </tr>
                      )
                  )
              )
            ) : hideError ? (
              <></>
            ) : (
              <tr align={"center"}>
                <td
                  colSpan={selectedLogSchema.length}
                  className="py-4 justify-center font-medium text-gray-700"
                >
                  No data found
                </td>
              </tr>
            )}
            <tr align={"center"}>
              <td
                colSpan={selectedLogSchema.length}
                className="py-3 justify-center"
              >
                <BeatLoader
                  color={"#1A237E"}
                  loading={logQueries.isFetchingNextPage}
                  cssOverride={{
                    display: "block",
                    margin: "0 auto",
                    borderColor: "red",
                  }}
                  size={10}
                />
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </>
  );
};

export default Table;
