/**
 * ContattoVirtualGrid.tsx
 *
 * Questo componente mostra una lista di contatti (simulati) in una griglia virtualizzata
 * usando react-window per ottimizzare il rendering di molte card.
 * Offre filtri base e la possibilità di
 * selezionare un contatto per vedere i dettagli in un popup animato con framer-motion.
 * È protetto da un componente ProtectedRoute che gestisce autenticazione.
 */

"use client";

import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, {
  FilterConfig,
} from "@/app/components/shared/filters/filters";
import { Mail, Phone, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import Detail from "@/app/components/shared/detail/detail";
import { motion, AnimatePresence } from "framer-motion";
import "./contatti.css";
import { Contatto } from "@/app/interfaces/interfaces";
import { getContatti } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { useSearchParams } from "next/navigation";

const ContattiVirtualGrid = () => {
  // Stato per i valori correnti dei filtri (non usati per filtrare in questo codice)
  // Stati per dimensioni finestra (usate per calcolare layout responsivo)
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Stato per il contatto selezionato e visualizzato nel dettaglio
  const [selectedContatto, setSelectedContatto] = useState<Contatto | null>(
    null
  );

  const [contattiCRM, setContattiCRM] = useState<Contatto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchWithAuth } = useAuth();
  const searchParams = useSearchParams();
  const initialRagSoc = searchParams.get("ragSoc") || "";

  const [filtersValues, setFiltersValues] = useState<Record<string, string>>({
    "Rag.Soc.": initialRagSoc,
  });

  useEffect(() => {
    async function FetchContatti() {
      try {
        const data = await getContatti(fetchWithAuth);
        
        setContattiCRM(data.map(mapRawToContatto));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento dei contatti ");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    FetchContatti();
  }, []);

  // useEffect per aggiornare dimensioni finestra al resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcolo numero righe/colonne e dimensione card in base a dimensioni finestra
  const CARD_COUNT = windowHeight < 600 ? 2 : windowHeight < 800 ? 3 : 4;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile? Math.floor((windowWidth-30) / columnCount): Math.floor(windowWidth/columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(contattiCRM.length / columnCount);

  // Handler per aggiornare stato filtri (non implementa filtri reali)
  function handleFiltersChange(values: Record<string, string>) {
    setFiltersValues(values);
  }

  // Funzione cella per la griglia virtuale: mostra una card per ogni contatto
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= contattiCRM.length) return null;

    const contatto = contattiCRM[index];

    return (
      <div
        style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}
        onClick={() => setSelectedContatto(contatto)} // Seleziona contatto al click
      >
        <GenericCard
          title={`${contatto.nome} ${contatto.cognome}`}
          fields={[
            {
              title: <Building size={16} />,
              value: contatto.ragioneSociale,
            },
            {
              title: <Mail size={16} />,
              value: contatto.email,
              href: `mailto:${contatto.email}`,
            },
            {
              title: <Phone size={16} />,
              value: contatto.cellulare,
              href: `tel:${contatto.telefonoElaborato}`,
            },
          ]}
        />
      </div>
    );
  };

  // Dati da mostrare nel dettaglio, mappati dal contatto selezionato
  const detailFields =
    selectedContatto === null
      ? []
      : [
          { title: "Nome", value: selectedContatto.nome, type: "text" },
          { title: "Cognome", value: selectedContatto.cognome, type: "text" },
          {
            title: "Azienda",
            value: selectedContatto.ragioneSociale,
            type: "text",
          },
          {
            title: "Cellulare",
            value: selectedContatto.cellulare,
            type: "text",
          },
          { title: "Email", value: selectedContatto.email, type: "text" },
          {
            title: "Telefono",
            value: selectedContatto.telefonoElaborato,
            type: "text",
          },
          {
            title: "Città",
            value: selectedContatto.cittaClienteFornitore,
            type: "text",
          },
          {
            title: "Paese",
            value: selectedContatto.paeseClienteFornitore,
            type: "text",
          },
          {
            title: "Tipo Contatto",
            value: selectedContatto.tipoContatto,
            type: "text",
          },
        ];

  function mapRawToContatto(raw: any): Contatto {
    return {
      idContatto: raw.IdContatto,
      nome: raw.Nome,
      cognome: raw.Cognome,
      ragioneSociale: raw.RagSoc,
      cellulare: raw.Cell,
      email: raw.EMail,
      disabilita: raw.Disabilita,
      tipoContatto: raw.TipoContatto,
      telefonoElaborato: raw.TelElab,
      cittaClienteFornitore: "", // non presente nella risposta? lascia vuoto o mappa da altro campo
      paeseClienteFornitore: raw.PaeseElab,
    };
  }

  return (
    // Componente che protegge la pagina dall’accesso non autenticato
    <ProtectedRoute>
      {/* Componente filtro */}
      <GenericFilters filters={filtersConfig} onChange={handleFiltersChange} initialValues={{ "Rag.Soc.": initialRagSoc }} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && contattiCRM.length === 0 && (
        <p>Nessun contatto trovato..</p>
      )}

      {/* Griglia virtuale react-window */}
      {!loading && !error && contattiCRM.length > 0 && (
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

      {/* Animazione popup dettaglio */}
      <AnimatePresence>
        {selectedContatto && (
          <motion.div
            className="
              fixed inset-0 flex items-center justify-center
              backdrop-blur-xs
              z-50
              p-4
            "
            onClick={() => setSelectedContatto(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="
                cnt-zoom
                relative rounded-xl max-w-4xl w-full h-[80vh] overflow-auto
                p-6 sm:p-8
              "
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Bottone chiusura */}
              <button
                onClick={() => setSelectedContatto(null)}
                className="
                  cnt-btn
                  absolute top-4 right-4 transition
                  font-bold text-lg rounded cursor-pointer
                "
                aria-label="Chiudi dettaglio Contatto"
              >
                ✕
              </button>

              {/* Dettaglio contatto */}
              <Detail
                title={`${selectedContatto.nome} ${selectedContatto.cognome}`}
                fields={detailFields}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
};

export default ContattiVirtualGrid;

const filtersConfig: FilterConfig[] = [
  { type: "text", label: "Rag. Soc.", name: "Rag.Soc." },
  { type: "text", label: "Nome", name: "nome", placeholder: "Cerca nome..." },
];
