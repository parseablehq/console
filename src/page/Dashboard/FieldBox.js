import Checkbox from "../../components/Checkbox";

const Field = ({
  logStreamSchema,
  selectedLogSchema,
  setSelectedLogSchema,
}) => {
  return (
    <div className="flex flex-col">
      <div className="bg-gray-200 py-3 px-5">
        <h3 className=" font-semibold text-gray-600 ">Columns</h3>
      </div>
      <div>
        {logStreamSchema?.data?.data?.fields
          ?.filter((field) => field.name !== "p_metadata" && field.name !== "p_tags")
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
                            schema === key.name,
                        ),
                    )
                  : setSelectedLogSchema(
                      selectedLogSchema.filter(
                        (clickedName) => clickedName !== key.name,
                      ),
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
