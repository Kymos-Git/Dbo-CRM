"use client";

import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, {
  FilterConfig,
} from "@/app/components/shared/filters/filters";
import { MapPin, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import Detail from "@/app/components/shared/detail/detail";
import { motion, AnimatePresence } from "framer-motion";
import { Cliente } from "@/app/interfaces/interfaces";
import { getClienti } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import "./clienti.css"
import { useRouter } from "next/navigation";

const ClientiVirtualGrid = () => {
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>(
    {}
  );
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clientiCRM, setClientiCRM] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchWithAuth } = useAuth();
  const router=useRouter();

  useEffect(() => {
    async function fetchClienti() {
      try {
        const data = await getClienti(fetchWithAuth);
        setClientiCRM(data.map(mapRawToCliente));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento dei clienti");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClienti();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const CARD_COUNT = windowHeight < 600 ? 2 : windowHeight < 800 ? 3 : 4;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile? Math.floor((windowWidth-30) / columnCount): Math.floor(windowWidth/columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(clientiCRM.length / columnCount);

  const handleFiltersChange = (values: Record<string, string>) => {
    setFiltersValues(values);
  };

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= clientiCRM.length) return null;

    const cliente = clientiCRM[index];

    return (
      <div
        style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}
        onClick={() => setSelectedCliente(cliente)}
      >
        <GenericCard
          title={cliente.ragSocCompleta}
          fields={[
            {
              title: <MapPin size={16} />,
              value: cliente.citta,
              href: getMapLink({
                citta: cliente.citta,
                provincia: cliente.provincia,
                cap: cliente.cap,
                paese: cliente.idPaese,
              }),
            },
            {
              title: <Mail size={16} />,
              value: cliente.email,
              href: `mailto:${cliente.email}`,
            },
            {
              title: <Phone size={16} />,
              value: cliente.tel,
              href: `tel:${cliente.tel}`,
            },
          ]}
        />
      </div>
    );
  };

  function getMapLink({
    via,
    citta,
    provincia,
    cap,
    paese,
  }: {
    via?: string;
    citta: string;
    provincia: string;
    cap: string;
    paese: string;
  }): string {
    const address = `${via ?? ""}, ${citta}, ${provincia}, ${cap}, ${paese}`;
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }

  const detailFieldsCliente =
    selectedCliente === null
      ? []
      : [
          {
            title: "Ragione Sociale",
            value: selectedCliente.ragSocCompleta,
            type: "text",
          },
          { title: "Telefono", value: selectedCliente.tel, type: "text" },
          { title: "Email", value: selectedCliente.email, type: "text" },
          {
            title: "Indirizzo",
            value: selectedCliente.indirizzo,
            type: "text",
          },
          { title: "Città", value: selectedCliente.citta, type: "text" },
          { title: "CAP", value: selectedCliente.cap, type: "text" },
          {
            title: "Provincia",
            value: selectedCliente.provincia || "",
            type: "text",
          },
          selectedCliente.noteCliente
            ? {
                title: "Note",
                value: selectedCliente.noteCliente,
                type: "text",
              }
            : null,
        ].filter(
          (field): field is { title: string; value: string; type: string } =>
            field !== null
        );

  function mapRawToCliente(raw: any): Cliente {
    return {
      idCliente: raw.IdCliente,
      ragSocCompleta: raw.RagSoc,
      indirizzo: raw.Indirizzo,
      citta: raw.Citta,
      cap: raw.Cap,
      provincia: raw.Provincia || "",
      idZona: raw.IdZona,
      idPaese: raw.IdPaese,
      tel: raw.Tel,
      email: raw.EMail,
      noteCliente: raw.Note,
    };
  }

  return (
    <ProtectedRoute>
      <GenericFilters filters={filtersConfig} onChange={handleFiltersChange} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && clientiCRM.length === 0 && (
        <p>Nessun cliente trovato.</p>
      )}

      {!loading && !error && clientiCRM.length > 0 && (
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={CARD_WIDTH}
          rowHeight={CARD_HEIGHT}
          height={windowHeight}
          width={windowWidth}
        >
          {Cell}
        </Grid>
      )}

      <AnimatePresence>
        {selectedCliente && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 p-4"
            onClick={() => setSelectedCliente(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="cl-zoom relative rounded-xl max-w-4xl w-full h-[80vh] overflow-auto p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setSelectedCliente(null)}
                className="cl-btn absolute top-4 right-4 transition font-bold text-lg rounded cursor-pointer"
                aria-label="Chiudi dettaglio Cliente"
              >
                ✕
              </button>

              
              <Detail
                title={selectedCliente.ragSocCompleta}
                fields={detailFieldsCliente}
              />
              <button className="cl-btnCnt absolute bottom-4 right-4 rounded-2xl transition h-10 w-25 text-xs cursor-pointer md:hover:scale-105" onClick={()=>router.push(`./contatti?ragSoc=${encodeURIComponent(selectedCliente?.ragSocCompleta || "")}`)}>
                Vai ai contatti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
};

export default ClientiVirtualGrid;

const filtersConfig: FilterConfig[] = [
  {
    type: "text",
    label: "Nome",
    name: "ragioneSociale",
    placeholder: "Cerca...",
  },
  {
    type: "text",
    label: "Città",
    name: "citta",
    placeholder: "Filtra città...",
  },

];
