/**
 * VisiteVirtualGrid.tsx
 *
 * Questo componente mostra una lista di "visite" in una griglia virtualizzata usando `react-window`
 * per ottimizzare il rendering anche con grandi quantità di dati.
 *
 * La griglia è responsive: si adatta dinamicamente alla dimensione della finestra.
 * I dati vengono caricati da un'API protetta tramite autenticazione.
 * Sono presenti dei filtri per la ricerca e visualizzazione condizionale del caricamento, errori, o risultati vuoti.
 * L'accesso è protetto dal componente `ProtectedRoute`.
 */

"use client";

import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, { FilterConfig } from "@/app/components/shared/filters";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { Visita } from "@/app/interfaces/interfaces";
import { getVisite } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const VisiteVirtualGrid = () => {
  // Stati per dimensioni finestra (per la responsività della griglia)
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Stato dati, caricamento ed errori
  const [visiteCRM, setVisiteCRM] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Effetto per aggiornare le dimensioni della finestra in tempo reale.
   * Serve a rendere la griglia reattiva e adattabile al viewport.
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

  /**
   * Funzione che carica le visite dall'API.
   * Viene richiamata inizialmente e quando si applicano i filtri.
   */
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

  /**
   * Effetto che esegue fetch dei dati iniziali.
   * Se c'è il parametro `reload` nell'URL, rimuove il parametro dalla query una volta eseguita la fetch.
   */
  useEffect(() => {
    if (!fetchWithAuth) return;

    const reload = searchParams.get("reload");

    const fetchAndClean = async () => {
      await fetchVisite();

      if (reload === "true") {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("reload");

        const newQueryString = newParams.toString();
        const newUrl = pathname + (newQueryString ? `?${newQueryString}` : "");

        router.replace(newUrl, { scroll: false });
      }
    };

    fetchAndClean();
  }, [fetchWithAuth, pathname, searchParams, router]);

  // Configurazioni responsive per la griglia virtuale
  const CARD_COUNT = windowHeight < 700 ? 2 : 3;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor((windowWidth * 0.98) / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(visiteCRM.length / columnCount);

  /**
   * Funzione richiamata alla perdita del focus dal filtro.
   * Esegue la ricerca filtrata richiamando l'API con i parametri passati.
   */
  async function handleFiltersBlur(values: Record<string, string>) {
    setLoading(true);
    try {
      const areAllFiltersEmpty = Object.values(values).every(
        (v) => v.trim() === ""
      );

      let data;
      if (areAllFiltersEmpty) {
        data = await getVisite(fetchWithAuth);
      } else {
        data = await getVisite(fetchWithAuth, values);
      }

      setVisiteCRM(data.map(mapRawToVisite));
      setError(null);
    } catch (err) {
      setError("Errore nel caricamento delle visite.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Componente che disegna ogni cella della griglia.
   * Ogni cella mostra una `GenericCard` con le informazioni della visita.
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
   * Funzione che mappa i dati grezzi ricevuti dall’API
   * in un oggetto `Visita` coerente con l’interfaccia tipizzata.
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
   * Formatta una data ISO in formato leggibile: gg/mm/aaaa
   * Gestisce date non valide o stringhe mal formattate.
   */
  function formatDate(isoString?: string): string {
    if (!isoString || typeof isoString !== "string") {
      console.warn("Data non valida o mancante:", isoString);
      return "Data non valida";
    }

    const fixedIsoString = isoString.endsWith("Z")
      ? isoString
      : isoString + "Z";
    const date = new Date(fixedIsoString);

    if (isNaN(date.getTime())) {
      console.warn("Formato data non valido:", fixedIsoString);
      return "Data non valida";
    }

    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  // Rendering del componente
  return (
    <ProtectedRoute>
      <GenericFilters filters={filtersConfig} onBlur={handleFiltersBlur} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && visiteCRM.length === 0 && (
        <p>Nessuna visita trovata..</p>
      )}

      {!loading && !error && visiteCRM.length > 0 && (
        <div className="gr">
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
        </div>
      )}
    </ProtectedRoute>
  );
};

export default VisiteVirtualGrid;

// Configurazione dei filtri usati nel componente
const filtersConfig: FilterConfig[] = [
  {
    type: "text",
    label: "RagSoc",
    name: "nome",
    placeholder: "Cerca Ragione sociale...",
  },
  { type: "date", label: "Data", name: "startDate" },
];
