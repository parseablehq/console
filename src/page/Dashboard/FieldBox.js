import Checkbox from "../../components/Checkbox";
import React from "react";
import { ReactComponent as TableIcon } from "../../assets/images/table-icon.svg";
import classNames from "classnames";
import { useState } from "react";

const Field = ({
  logStreamSchema,
  selectedLogSchema,
  setSelectedLogSchema,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 flex">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={classNames(
            "text-sm flex mx-2 flex-1 transition-width font-light text-left hover:bg-primary-400 text-gray-300",
            {
              "border-secondary border-l-2 bg-primary-400 flex-row items-center px-4 py-2 w-48":
                isOpen,
            },
            { "flex-col justify-center items-center py-1 px-2 rounded": !isOpen }
          )}
        >
          <TableIcon strokeWidth={0.1} fill={"#eaeaea"} className={classNames(" h-8 w-8 block")} />
          <span
            className={classNames(
              "block",
              { "text-[0.7rem] text-gray-400": !isOpen },
              { "ml-3": isOpen }
            )}
          >
            Columns
          </span>
        </button>
      </div>
      <div className={classNames({ hidden: !isOpen })}>
        {logStreamSchema?.data?.data?.fields
          ?.filter(
            (field) => field.name !== "p_metadata" && field.name !== "p_tags"
          )
          .map((key, index) => (
            <Checkbox
              key={index}
              name={key.name}
              onClick={(e) =>
                e.target.checked
                  ? setSelectedLogSchema(
                      logStreamSchema.data.data.fields
                        .map((x) => x.name)
                        .filter(
                          (schema) =>
                            selectedLogSchema.includes(schema) ||
                            schema === key.name
                        )
                    )
                  : setSelectedLogSchema(
                      selectedLogSchema.filter(
                        (clickedName) => clickedName !== key.name
                      )
                    )
              }
              selected={selectedLogSchema?.includes(key.name)}
            />
          ))}
      </div>
    </div>
  );
};

export default Field;
