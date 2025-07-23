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

   const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

  useEffect(() => {
    if (!fetchWithAuth) return;

    const reload = searchParams.get("reload");

    const fetchAndClean = async () => {
      if (reload === "true") {
        await fetchVisite();

        // Ricostruisci query senza reload
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("reload");

        const newQueryString = newParams.toString();
        const newUrl = pathname + (newQueryString ? `?${newQueryString}` : "");

        // Cambia URL senza ricaricare pagina e senza scroll
        router.replace(newUrl, { scroll: false });
      } else {
        await fetchVisite();
      }
    };

    fetchAndClean();
  }, [fetchWithAuth, pathname, searchParams, router]);

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
        console.log(values)
        data = await getVisite(fetchWithAuth, values);
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
  { type: "text", label: "RagSoc", name: "nome", placeholder: "Cerca Ragione sociale..." },
  { type: "date", label: "Data inizio", name: "startDate" },
];
