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
}) => {
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
          !logQueries.data?.data ||
          logQueries.data?.data?.length === 0) ? (
          <tbody>
            <tr align={"center"}>
              <td
                colSpan={selectedLogSchema.length}
                className="py-3 justify-center"
              >
                <BeatLoader
                  color={"#1A237E"}
                  loading={logQueries.isLoading}
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
              logQueries.data.pages.map(
                (page) =>
                  page?.data?.map &&
                  page?.data?.map(
                    (data, index) =>
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
                            addAvailableTags(tag);
                          })}
                        </tr>
                      )
                  )
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
