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
  const [operator, setOperator] = useState({ name: "Contains" }); 
  const [queryValue, setQueryValue] = useState(""); 
  const [filter, setFilters] = useState([]); 
 
  useEffect(() => { 
    setFilters([]); 
    setColumnValue(); 
    setOperator({ name: "Contains" }); 
    setQueryValue(""); 
  }, [schema]); 
 
  function removeTagOrMeta(type, val) { 
    setFilters([ 
      ...filter.filter( 
        (field) => !(field.type === type && field.value === val) 
      ), 
    ]); 
  } 
 
  function removeGlobalFilter(column, contains, query) { 
    removeFilter(column, contains, query); 
    setFilters([ 
      ...filter.filter( 
        (item) => 
          !( 
            item.column === column && 
            item.contains === contains && 
            item.query === query 
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
        <Searchbar setSearchQuery={setSearchQuery}/> 
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
              data={schema?.fields.filter( 
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
                data={[{ name: "Contains" }, { name: "Doesn't Contain" }]} 
              /> 
            </div> 
            <div className="ml-2"> 
              <input 
                value={queryValue} 
                onChange={(e) => setQueryValue(e.target.value)} 
                type="text" 
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
                      contains: operator.name === "Contains", 
                      column: columnValue.name, 
                    }, 
                  ]); 
 
                  addFilter({ 
                    query: queryValue, 
                    contains: operator.name === "Contains", 
                    column: columnValue.name, 
                  }); 
                  setQueryValue(""); 
                  setOperator({ name: "Contains" }); 
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
                        val.contains ? "contains" : "doesn't contain" 
                      } ${val.query}`} 
                      onClose={() => { 
                        removeGlobalFilter(val.column, val.contains, val.query); 
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
