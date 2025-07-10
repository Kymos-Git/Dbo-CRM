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
import { Contatto } from "@/app/interfaces/interfaces";
import { getContatti } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { useSearchParams } from "next/navigation";

const ContattiVirtualGrid = () => {
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

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
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor(windowWidth / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(contattiCRM.length / columnCount);

  function handleFiltersChange(values: Record<string, string>) {
    setFiltersValues(values);
  }

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= contattiCRM.length) return null;

    const contatto = contattiCRM[index];

    return (
      <div style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}>
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
          dato={contatto}
        />
      </div>
    );
  };

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
      cittaClienteFornitore: "", // oppure raw.CittaClienteFornitore se presente
      paeseClienteFornitore: raw.PaeseElab,
      Sem1: raw.Sem1 || 0,
      Sem2: raw.Sem2 || 0,
      Sem3: raw.Sem3 || 0,
      Sem4: raw.Sem4 || 0,
    };
  }

  return (
    <ProtectedRoute>
      <GenericFilters
        filters={filtersConfig}
        onChange={handleFiltersChange}
        initialValues={{ "nome": initialRagSoc }}
      />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && contattiCRM.length === 0 && (
        <p>Nessun contatto trovato..</p>
      )}

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
    </ProtectedRoute>
  );
};

export default ContattiVirtualGrid;

const filtersConfig: FilterConfig[] = [
  { type: "text", label: "Nome/Rag.Soc", name: "nome", placeholder: "Cerca nome..." },
];
