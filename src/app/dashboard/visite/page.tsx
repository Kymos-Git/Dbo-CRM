/**
 * VisiteVirtualGrid.tsx
 *
 * Componente che mostra una lista virtualizzata delle visite in una griglia reattiva.
 *
 * Caratteristiche principali:
 * - Usa react-window FixedSizeGrid per visualizzare molte card in una griglia performante.
 * - Dimensioni colonne e righe adattate dinamicamente alla finestra.
 * - Popup animato con framer-motion per il dettaglio visita selezionata.
 * - Filtri base (date, testo) con callback onChange per aggiornare lo stato filtri.
 * - ProtectedRoute per proteggere l’accesso (autenticazione).
 */

"use client";

import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import GenericCard from "@/app/components/shared/card/card";
import Detail from "@/app/components/shared/detail/detail";
import GenericFilters, {
  FilterConfig,
} from "@/app/components/shared/filters/filters";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { motion, AnimatePresence } from "framer-motion";
import { Visita } from "@/app/interfaces/interfaces";
import "./visite.css";
import { getVisite } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";

const VisiteVirtualGrid = () => {
  // Stato per i valori dei filtri
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>(
    {}
  );

  // Stati per dimensioni finestra (utili per il layout responsivo)
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Stato per la visita selezionata nel dettaglio popup
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);

  const [visiteCRM, setVisiteCRM] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect per aggiornare le dimensioni finestra al resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize(); // inizializza dimensioni subito
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    async function fetchVisite() {
      try {
        const data = await getVisite(fetchWithAuth);
        setVisiteCRM(data.map(mapRawToVisite));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento delle visite");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisite();
  }, []);

  // Numero righe visibili in base all’altezza finestra (responsivo)
  const CARD_COUNT = windowHeight < 700 ? 2 : 3;

  // Numero colonne: 1 su mobile, 3 su desktop
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;

  // Dimensioni singola card calcolate in base alla finestra
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor(windowWidth / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);

  // Numero totale righe necessarie per mostrare tutte le visite
  const rowCount = Math.ceil(visiteCRM.length / columnCount);

  // Callback quando cambia il filtro: aggiorna lo stato e stampa valori (da estendere)
  function handleFiltersChange(values: Record<string, string>) {
    setFiltersValues(values);
    console.log("Filtri aggiornati:", values);
  }

  // Funzione per rendere la cella della griglia: una card visita cliccabile
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= visiteCRM.length) return null; // no cella se fuori range

    const visita = visiteCRM[index];

    return (
      <div
        style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}
        onClick={() => setSelectedVisita(visita)} // seleziona visita per dettaglio
      >
        <GenericCard
          title={visita.RagSoc}
          fields={[
            { title: "Data:", value: visita.DataAttivita },
            { title: "Desc:", value: visita.DescAttivita },
          ]}
        />
      </div>
    );
  };

  // Dati da mostrare nel popup dettaglio visita (selezionata)
  const detailFields =
    selectedVisita === null
      ? []
      : [
          { title: "Rag.Soc", value: selectedVisita.RagSoc, type: "text" },
          { title: "Data", value: selectedVisita.DataAttivita, type: "text" },
          {
            title: "Descrizione",
            value: selectedVisita.DescAttivita,
            type: "text",
          },
          { title: "Note", value: selectedVisita.NoteAttivita, type: "text" },
        ];

  function mapRawToVisite(raw: any): Visita {
    return {
      IdAttivita: raw.IdAttivita,
      DescAttivita: raw.DescAttivita,
      NoteAttivita: raw.NoteAttivita,
      DataAttivita: formatDate(raw.DataAttivita),
      RagSoc: raw.RagSoc,
    };
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  return (
    <ProtectedRoute>
      {/* Componente filtro */}
      <GenericFilters filters={filtersConfig} onChange={handleFiltersChange} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && visiteCRM.length === 0 && (
        <p>Nessuna visita trovata..</p>
      )}

      {/* Griglia virtualizzata */}
      {!loading && !error && visiteCRM.length > 0 && (
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

      {/* Popup dettaglio visita con animazioni ingresso/uscita */}
      <AnimatePresence>
        {selectedVisita && (
          <motion.div
            className="
              fixed inset-0 flex items-center justify-center
              backdrop-blur-xs
              z-50
              p-4
            "
            onClick={() => setSelectedVisita(null)} // chiude popup cliccando fuori
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="vt-zoom
                relative rounded-xl max-w-4xl w-full h-[80vh] overflow-auto
                p-6 sm:p-8
              "
              onClick={(e) => e.stopPropagation()} // previene chiusura cliccando dentro
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Bottone chiusura */}
              <button
                onClick={() => setSelectedVisita(null)}
                className="vt-button
                  absolute top-4 right-4 transition
                  font-bold text-lg rounded cursor-pointer
                "
                aria-label="Chiudi dettaglio cliente"
              >
                ✕
              </button>

              {/* Dettaglio visita */}
              <Detail
                title={`${selectedVisita.RagSoc}`}
                fields={detailFields}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
};

export default VisiteVirtualGrid;

// Configurazione filtri (esempio)
const filtersConfig: FilterConfig[] = [
  { type: "date", label: "Data inizio", name: "startDate" },
  { type: "text", label: "Nome", name: "nome", placeholder: "Cerca nome..." },
];
