"use client";

import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, { FilterConfig } from "@/app/components/shared/filters";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { Visita } from "@/app/interfaces/interfaces";
import { getVisite, getVisiteFiltrate } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";

const VisiteVirtualGrid = () => {
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>(
    {}
  );
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [visiteCRM, setVisiteCRM] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchWithAuth } = useAuth();

  // Aggiorna dimensioni finestra per layout responsivo
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Funzione per caricare visite da API
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

  useEffect(() => {
    const checkAndFetch = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reload = urlParams.get("reload");

      if (reload === "true") {
        await fetchVisite();

        // Rimuove `reload` dall'URL
        urlParams.delete("reload");
        const newUrl =
          window.location.pathname +
          (urlParams.toString() ? "?" + urlParams.toString() : "");
        window.history.replaceState(null, "", newUrl);
      } else {
        await fetchVisite(); // Primo render senza reload
      }
    };

    checkAndFetch(); // Primo render

    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reload = urlParams.get("reload");
      if (reload === "true") {
        checkAndFetch(); // Solo se c'è reload
      }
    };

    // Intercetta cambiamenti URL
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("pushstate", handleUrlChange);
    window.addEventListener("replacestate", handleUrlChange);

    // Patch temporanea per intercettare anche pushState/replaceState custom
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event("pushstate"));
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event("replacestate"));
    };

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("pushstate", handleUrlChange);
      window.removeEventListener("replacestate", handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const CARD_COUNT = windowHeight < 700 ? 2 : 3;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor((windowWidth * 0.98) / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(visiteCRM.length / columnCount);

  // Gestione filtri: aggiorna dati filtrati
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

  // Rendering di ogni cella della griglia
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

  // Mappa dati raw API in formato Visita
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

  // Formatta data ISO in gg/mm/aaaa
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
