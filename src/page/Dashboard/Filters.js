import { AdjustmentsIcon } from "@heroicons/react/outline";
import Button from "../../components/Button";
import Pill from "../../components/Pill";
import { PillFilterList } from "./../../components/PillFilterList/index";
import { Popover } from "@headlessui/react";
import React from "react";
import SearchableDropdown from "../../components/SearchableDropdown";
import Searchbar from "./Searchbar";
import { useEffect } from "react";
import { useState } from "react";

export default function Filters({
  schema,
  availableTags,
  availableMeta,
  removeTag,
  removeMeta,
  addTag,
  addMeta,
  addFilter,
  removeFilter,
  setSearchQuery,
}) {
  const [columnValue, setColumnValue] = useState();
  const [operator, setOperator] = useState({ name: "Operator" });
  const [queryValue, setQueryValue] = useState("");
  const [filter, setFilters] = useState([]);

  useEffect(() => {
    setFilters([]);
    // setColumnValue();
    setOperator({
      name: "Operator",
    });
    setQueryValue("");
  }, [schema, columnValue]);

  function removeTagOrMeta(type, val) {
    setFilters([
      ...filter.filter(
        (field) => !(field.type === type && field.value === val)
      ),
    ]);
  }

  function removeGlobalFilter(column, contains, query, after, before, greaterThan, lessThan, greaterThanEqual, notContain, exactly, exactDay) {
    removeFilter(column, contains, query, after, before, greaterThan, lessThan, greaterThanEqual, notContain, exactly, exactDay);
    setFilters([
      ...filter.filter(
        (item) =>
          !(
            item.column === column &&
            item.contains === contains &&
            item.query === query &&
            item.after === after &&
            item.before === before &&
            item.greaterThan === greaterThan &&
            item.lessThan === lessThan &&
            item.greaterThanEqual === greaterThanEqual &&
            item.notContain === notContain &&
            item.exactly === exactly &&
            item.exactDay === exactDay
          )
      ),
    ]);
  }

  return (
    <Popover className="relative ml-3 flex-1">
      <label className="text-label" htmlFor="">
        Search & Filter
      </label>
      <div className="flex mt-1">
        <Searchbar setSearchQuery={setSearchQuery} />
        <Popover.Button className={"input rounded-l-none w-min text-left flex"}>
          <span className={"block mr-1"}>Filter</span>
          {filter.length ? <Pill text={`${filter.length}`} /> : null}

          <AdjustmentsIcon className="h-5 ml-2 text-gray-500" />
        </Popover.Button>
      </div>
      <Popover.Panel className="absolute mt-1 flex flex-col right-0 w-[48rem] min-h-[23rem] overflow-auto rounded-md bg-gray-50 py-1 border border-1 border-gray-500">
        <div className="flex flex-col mx-4 my-2">
          <div className="flex">
            <SearchableDropdown
              data={schema?.fields?.filter(
                (field) =>
                  field.name !== "p_metadata" && field.name !== "p_tags"
              )}
              label={"Column Filters"}
              setValue={setColumnValue}
              value={columnValue}
              defaultValue={"Select column"}
            />
            <div className="ml-2">
              <SearchableDropdown
                setValue={setOperator}
                value={operator}
                data={
                  columnValue?.name === "datetime"
                    ? [{ name: "after" }, { name: "before" }, { name: "exact day" }]
                    : columnValue?.name === "id" ? [{ name: "Contains" }, { name: "Doesn't Contain" },{ name: "Exactly match" }]
                    : columnValue?.name === "host" ? [{ name: "Contains" }, { name: "Doesn't Contain" },{ name: "Exactly match" }]
                    : columnValue?.name === "method" ? [{ name: "Contains" }, { name: "Doesn't Contain" },{ name: "Exactly match" }]
                    : columnValue?.name === "referrer" ? [{ name: "Contains" }, { name: "Doesn't Contain" },{ name: "Exactly match" }]
                    : columnValue?.name === "status" ? [{ name: "Greater Than" },{ name: "Less Than" }, { name: "Greater Than or equel to" }, { name: "Less than or equel to" }, { name: "Exactly" }]
                    : columnValue?.name === "user-identifier" ? [{ name: "Contains" }, { name: "Doesn't Contain" },{ name: "Exactly match" }]
                    : [{ name: "Contains" }, { name: "Doesn't Contain" }]  
              
                }
              />
            </div>
            <div className="ml-2">
              <input
                value={queryValue}
                onChange={(e) => setQueryValue( e.target.value )}
                type={
                  columnValue?.name === "datetime" ? "datetime-local"
                    : columnValue?.name === "host" ? "text"
                      : columnValue?.name === "id" ? "text"
                        : columnValue?.name === "referrer" ? "text"
                           : columnValue?.name === "method" ? "text"
                            : columnValue?.name === "status" ? "number"
                              : columnValue?.name === "user-identifier" ? "text"
                                : "text"
                }
                className="input mt-7"
              />
            </div>
            <div className="mt-7 ml-4">
              <Button
                onClick={() => {
                  setFilters([
                    ...filter,
                    {
                      type: "Column",
                      query: queryValue,
                      operator: operator.name,
                      contains: operator.name === "Contains",
                      notContain: operator.name === "Doesn't Contain",
                      greaterThan: operator.name === "Greater Than",
                      greaterThanEqual: operator.name === "Greater Than or equel to",
                      lessThanEqual: operator.name === "Less than or equel to",
                      exactly: operator.name === "Exactly match",
                      after: operator.name === "after",
                      before: operator.name === "before",
                      exactDay: operator.name === "exact day",
                      lessThan: operator.name === "Less than",
                      column: columnValue.name,
                    },
                  ]);

                  addFilter({
                     query: queryValue,
                      operator: operator.name,
                      contains: operator.name === "Contains",
                      notContain: operator.name === "Doesn't Contain",
                      greaterThan: operator.name === "Greater Than",
                      greaterThanEqual: operator.name === "Greater Than or equel to",
                      lessThanEqual: operator.name === "Less than or equel to",
                      exactly: operator.name === "Exactly match",
                      before: operator.name === "before",
                      exactDay: operator.name === "exact day",
                      lessThan: operator.name === "Less than",
                      after: operator.name === "after",
                      column: columnValue.name,
                    
                  });
                  setQueryValue("");
                  setOperator({ name: "Operator" });
                }}
                disabled={!(queryValue && operator && columnValue)}
              >
                Add Filter
              </Button>
            </div>
          </div>

          {Boolean(availableTags?.length) && (
            <>
              <p className="text-label mt-4 ml-1" htmlFor="">
                Filter Tags
              </p>
              <PillFilterList
                x={availableTags || []}
                values={filter
                  .filter((filter) => filter.type === "Tag")
                  .reduce((prev, curr) => [...prev, curr.value], [])}
                onAdd={(val) => {
                  addTag(val);
                  setFilters([
                    ...filter,
                    {
                      type: "Tag",
                      value: val,
                    },
                  ]);
                }}
                onRemove={(val) => {
                  removeTag(val);
                  removeTagOrMeta("Tag", val);
                }}
              />
            </>
          )}

          {Boolean(availableMeta?.length) && (
            <>
              <p className="text-label mt-4 ml-1" htmlFor="">
                Filter Metadata
              </p>
              <PillFilterList
                x={availableMeta || []}
                values={filter
                  .filter((filter) => filter.type === "Meta")
                  .reduce((prev, curr) => [...prev, curr.value], [])}
                onAdd={(val) => {
                  addMeta(val);
                  setFilters([
                    ...filter,
                    {
                      type: "Meta",
                      value: val,
                    },
                  ]);
                }}
                onRemove={(val) => {
                  removeMeta(val);
                  removeTagOrMeta("Meta", val);
                }}
              />
            </>
          )}
          {filter.length ? (
            <p className="text-label mt-3">Active Filter</p>
          ) : null}
          <div className="flex flex-wrap flex-row">
            {filter.map((val) => {
              if (val.type === "Column") {
                return (
                  <span className="my-1">
                    <Pill
                      text={`${val.column} ${
                        val.contains ? "contains"
                        : val.notContain ? "doesn't contain"
                          : val.greaterThan ? "greater than"
                            : val.greaterThanEqual ? "greater than or equal to"
                              : val.lessThanEqual ? "less than or equal to"
                                : val.exactly ? "exactly match"
                                  : val.after ? "after"
                                    : val.before ? "before"
                                      : val.exactDay ? "exact day"
                                        : val.lessThan ? "less than"
                                          : ""
          
                      } ${val.query}`}
                      onClose={() => {
                        removeGlobalFilter(val.column,
                          val.contains,
                          val.query,
                          val.after,
                          val.before,
                          val.greaterThan,
                          val.lessThan,
                          val.greaterThanEqual,
                          val.notContain,
                          val.exactly,
                          val.exactDay);

                      }}
                    />
                  </span>
                );
              } else {
                return (
                  <span className="my-1">
                    <Pill
                      text={val.value}
                      onClose={() => {
                        if (val.type === "Tag") {
                          removeTag(val.value);
                        } else {
                          removeMeta(val.value);
                        }
                        removeTagOrMeta(val.type, val.value);
                      }}
                    />
                  </span>
                );
              }
            })}
          </div>
        </div>
        <div className="flex mt-auto flex-1">
          <div className="ml-auto mr-4 mb-3 mt-auto">
            <Popover.Button as={Button}>Close</Popover.Button>
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
}