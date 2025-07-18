/**
 * VisiteVirtualGrid.tsx
 *
 * Questo componente mostra una lista virtualizzata di visite in una griglia reattiva,
 * ottimizzando il rendering tramite react-window. Gestisce il caricamento dati da API protette,
 * filtri dinamici e il ridimensionamento della griglia in base alla finestra.
 * L’accesso è protetto da ProtectedRoute per garantire l’autenticazione.
 */

"use client";

import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, {
  FilterConfig,
} from "@/app/components/shared/filters";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { Visita } from "@/app/interfaces/interfaces";
import { getVisite } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { getVisiteFiltrate } from "@/app/services/api";

const VisiteVirtualGrid = () => {
  /**
   * Stato per i valori correnti dei filtri applicati.
   */
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>({});

  /**
   * Stato per dimensioni della finestra, usate per calcolare layout responsivo.
   */
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  /**
   * Stato contenente l’array delle visite caricate,
   * stato di caricamento e stato di errore.
   */
  const [visiteCRM, setVisiteCRM] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effetto per aggiornare le dimensioni della finestra in caso di resize,
   * per permettere una griglia responsiva.
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { fetchWithAuth } = useAuth();

  /**
   * Effetto per caricare inizialmente la lista delle visite tramite API.
   * Effettua fetch dei dati mappandoli in oggetti Visita.
   * Gestisce stati loading e error.
   */
  useEffect(() => {
    async function fetchVisite() {
      setLoading(true);
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

  /**
   * Costanti per calcolare la configurazione della griglia,
   * numero di colonne e dimensioni delle card in base a finestra e dispositivo.
   */
  const CARD_COUNT = windowHeight < 700 ? 2 : 3;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor((windowWidth * 0.98) / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(visiteCRM.length / columnCount);

  /**
   * Funzione chiamata al blur dei filtri.
   * Aggiorna i filtri solo se cambiati e fa fetch filtrato delle visite.
   * Gestisce loading e errori.
   */
  async function handleFiltersBlur(values: Record<string, string>) {
      if (JSON.stringify(values) === JSON.stringify(filtersValues)) return;
  
      setFiltersValues(values);
      setLoading(true);
  
      try {
        const areAllFiltersEmpty = Object.values(values).every(
          (v) => v.trim() === ""
        );
  
        let data;
        if (areAllFiltersEmpty) {
          data = await getVisite(fetchWithAuth);
        } else {
          data = await getVisiteFiltrate(fetchWithAuth, values);
        }
  
        setVisiteCRM(data.map(mapRawToVisite));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento dei contatti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

  /**
   * Funzione per il rendering di ogni cella della griglia.
   * Mostra una card per ogni visita, calcolata da riga e colonna,
   * restituisce null se l’indice è fuori dall’array.
   */
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= visiteCRM.length) return null;

    const visita = visiteCRM[index];

    return (
      <div style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}>
        <GenericCard
          title={visita.RagSoc}
          fields={[
            { title: "Data:", value: visita.DataAttivita },
            { title: "Desc:", value: visita.DescAttivita },
          ]}
          dato={visita}
        />
      </div>
    );
  };

  /**
   * Funzione di mapping che trasforma un oggetto raw da API
   * in un oggetto Visita con formato coerente.
   * Include formattazione della data.
   */
  function mapRawToVisite(raw: any): Visita {
    return {
      IdAttivita: raw.IdAttivita,
      DescAttivita: raw.DescAttivita,
      NoteAttivita: raw.NoteAttivita,
      DataAttivita: formatDate(raw.DataAttivita),
      RagSoc: raw.RagSoc,
      Sem1: raw.Sem1 || 0,
      Sem2: raw.Sem2 || 0,
      Sem3: raw.Sem3 || 0,
      Sem4: raw.Sem4 || 0,
    };
  }

  /**
   * Funzione per formattare una data ISO in formato italiano gg/mm/aaaa.
   */
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
      <GenericFilters filters={filtersConfig} onBlur={handleFiltersBlur} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && visiteCRM.length === 0 && (
        <p>Nessuna visita trovata..</p>
      )}

      {!loading && !error && visiteCRM.length > 0 && (
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          columnWidth={CARD_WIDTH}
          rowHeight={CARD_HEIGHT}
          height={windowHeight * 0.8}
          width={isMobile ? windowWidth * 0.92 : windowWidth}
        >
          {Cell}
        </Grid>
      )}
    </ProtectedRoute>
  );
};

export default VisiteVirtualGrid;

const filtersConfig: FilterConfig[] = [
  { type: "date", label: "Data inizio", name: "startDate" },
  { type: "text", label: "Nome", name: "nome", placeholder: "Cerca nome..." },
];
