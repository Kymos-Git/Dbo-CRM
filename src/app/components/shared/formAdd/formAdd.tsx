import { z } from "zod";
import { schemaCliente } from "@/app/interfaces/schemaCliente";
import { schemaContatto } from "@/app/interfaces/schemaContatto";
import { schemaVisita } from "@/app/interfaces/schemaVisita";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type formProps = {
  type: "cliente" | "contatto" | "visita";
  onClose: () => void;
};

type Field = {
  name: string;
  type: string;
};

function generateFieldsFromSchema(schema: z.ZodObject<any>): Field[] {
  const shape = schema.shape;

  return Object.keys(shape).map((key) => {
    const field = shape[key];
    let type = "text";

    if (field instanceof z.ZodString) {
      type = "text";
    } else if (field instanceof z.ZodNumber) {
      type = "number";
    } else if (field instanceof z.ZodBoolean) {
      type = "checkbox";
    } else if (field instanceof z.ZodDate) {
      type = "date";
    }

    return {
      name: key,
      type,
    };
  });
}

export default function FormAdd({ type, onClose }: formProps) {
  let schema: z.ZodObject<any>;

  switch (type) {
    case "cliente":
      schema = schemaCliente;
      break;
    case "contatto":
      schema = schemaContatto;
      break;
    case "visita":
      schema = schemaVisita;
      break;
    default:
      return <div>Tipo non riconosciuto</div>;
  }

  const fields = generateFieldsFromSchema(schema);

  const sendData = () => {

    console.log('inviato')
    toast.info('Non ancora implementato')
  };

  return createPortal(
    <motion.div
      className="frm-container fixed inset-0 flex flex-row flex-wrap backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl md:pt-1 bg-[var(--bg)] border-1 border-[var(--primary)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
    >
      {/* Header */}
      <motion.div
        className="frm-header relative flex items-center justify-between h-15 w-full mb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 w-10">
          <button
            onClick={onClose}
            className="frm-close transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
            aria-label="Chiudi dettaglio"
          />
        </div>

        <p className="text-center text-xs font-bold tracking-wide">
          {type.toUpperCase()}
        </p>

        <div className="frm-semaphore flex items-center space-x-1 ml-2">
          <button
            className="rounded-2xl transition w-3 h-3"
            style={{ backgroundColor: "#00ca4e" }}
            onClick={sendData}
            name="invia"
            type="button"
          />
          {["#ff605c", "#ffbd44", "#3E94F7"].map((c, i) => (
            <button
              key={i}
              className="rounded-2xl transition w-3 h-3"
              style={{ backgroundColor: c }}
              type="button"
            />
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        className="frm-main relative rounded-xl max-w-4xl w-full h-[85%] overflow-auto p-2 pt-0 md:w-full md:max-w-full"
        onClick={(e) => e.stopPropagation()} // previene chiusura cliccando sul form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form
          className="
              dt-form
              grid 
              grid-cols-2
              sm:grid-cols-1
              md:grid-cols-3
              gap-x-2 
              auto-rows-min
            "
          onSubmit={(e) => e.preventDefault()}
        >
          {fields.map(({ name, type }, i) => {
            const isTextarea = name === "note";

            return (
              <div
                key={i}
                className={`frm-field mb-4 ${
                  isTextarea ? "col-span-2 md:col-span-3" : ""
                }`}
              >
                <label className="ex-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block">
                  {name}
                </label>

                {isTextarea ? (
                  <textarea
                    name={name}
                    className="w-[90%] px-3 py-2 text-sm focus:outline-none  border-b-1 border-b-[var(--grey)] min-h-[100px]"
                  />
                ) : type === "text" || type === "number" ? (
                  <input
                    name={name}
                    type={type}
                    className=" w-[90%]px-3 py-2 text-sm focus:outline-none  border-b-1 border-b-[var(--grey)] min-h-[44px] "
                  />
                ) : type === "checkbox" ? (
                  <input type="checkbox" name={name} className="mt-2" />
                ) : type === "date" ? (
                  <input
                    type="date"
                    name={name}
                    placeholder="YYYY-MM-DD"
                    className="w-[90%] px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px]"
                  />
                ) : null}
              </div>
            );
          })}
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
