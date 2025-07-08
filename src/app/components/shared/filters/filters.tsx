import { useEffect, useState } from "react";
import "./filters.css";

export type FilterConfig =
  | { type: "text"; label: string; name: string; placeholder?: string }
  | { type: "date"; label: string; name: string }
  | {
      type: "select";
      label: string;
      name: string;
      options: { value: string; label: string }[];
    };

type GenericFiltersProps = {
  filters: FilterConfig[];
  onChange: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
};

export default function GenericFilters({
  filters,
  onChange,
  initialValues = {},
}: GenericFiltersProps) {
  // Genera valori di default vuoti
  const defaultValues = filters.reduce((acc, filter) => {
    acc[filter.name] = "";
    return acc;
  }, {} as Record<string, string>);

  // Stato con merge tra default e initialValues
  const [values, setValues] = useState<Record<string, string>>({
    ...defaultValues,
    ...initialValues,
  });

  // Facoltativo: per notificare i valori iniziali
  useEffect(() => {
    onChange(values);
  }, []);

  function handleChange(name: string, value: string) {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    onChange(newValues);
  }

  return (
    <div className="ft-container w-full grow px-4 py-2 flex justify-center items-start" style={{ minHeight: "10vh" }}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="ft-form w-full h-full grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(30vw, 1fr))",
          gridAutoRows: "1fr",
        }}
      >
        {filters.map((filter) => (
          <div
            key={filter.name}
            className={`ft-filter-wrapper flex flex-col min-w-0 w-full ${
              filter.label === "Nome" ? "row-1" : ""
            }`}
            style={{ overflow: "hidden" }}
          >
            <label
              htmlFor={filter.name}
              className="ft-label font-semibold mb-1 text-xs leading-tight"
              style={{ flexShrink: 0 }}
            >
              <span className="ft-label-text">{filter.label}</span>
            </label>

            {filter.type === "text" && (
              <input
                id={filter.name}
                type="text"
                placeholder={filter.placeholder}
                value={values[filter.name]}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="ft-input w-full p-2 rounded-md border text-xs leading-snug focus:outline-none focus:shadow-md"
                style={{ minHeight: 32 }}
              />
            )}

            {filter.type === "date" && (
              <input
                id={filter.name}
                type="date"
                value={values[filter.name]}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="ft-input w-full p-2 rounded-md border text-xs leading-snug focus:outline-none focus:border-blue-600 focus:shadow-md"
                style={{ minHeight: 32 }}
              />
            )}

            {filter.type === "select" && (
              <select
                id={filter.name}
                value={values[filter.name]}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="ft-select w-full p-2 rounded-md border text-xs leading-snug focus:outline-none focus:border-blue-600 focus:shadow-md"
                style={{ minHeight: 32 }}
              >
                <option value="">Seleziona</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </form>
    </div>
  );
}
