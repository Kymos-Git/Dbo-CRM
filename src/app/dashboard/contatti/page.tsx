/**
 * ContattiVirtualGrid.tsx
 *
 * Questo componente mostra una lista di contatti in una griglia virtualizzata utilizzando react-window
 * per ottimizzare il rendering di molte card contemporaneamente. Permette di filtrare i contatti
 * tramite un componente di filtri e carica i dati tramite API protette da autenticazione.
 * L'interfaccia si adatta dinamicamente alla dimensione della finestra e supporta una visualizzazione
 * responsive per dispositivi mobili. È protetto da ProtectedRoute per garantire che solo utenti autenticati
 * possano accedervi.
 */

"use client";

import Card from "@/app/components/shared/card/card";
import GenericFilters, { FilterConfig } from "@/app/components/shared/filters";
import { Mail, Phone, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import { Contatto } from "@/app/interfaces/interfaces";
import { getContatti } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const ContattiVirtualGrid = () => {
  /**
   * Gestisce lo stato della dimensione della finestra per adattare
   * dinamicamente la griglia di visualizzazione delle card.
   */
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  /**
   * Stato per memorizzare i dati dei contatti caricati dal backend,
   * stato di caricamento e stato di errore.
   */
  const [contattiCRM, setContattiCRM] = useState<Contatto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hook per ottenere la funzione fetch autenticata e i parametri di ricerca
   * passati tramite URL, ad esempio un filtro iniziale su ragione sociale.
   */
  const { fetchWithAuth } = useAuth();
  const searchParams = useSearchParams();
  const initialRagSoc = searchParams.get("ragSoc") || "";

  /**
   * Stato per mantenere i valori attuali dei filtri usati nella ricerca.
   * Inizializzato con un filtro "Rag.Soc." da eventuale query string.
   */
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>({
    "Rag.Soc.": initialRagSoc,
  });

  const router = useRouter();
  const pathname = usePathname();

  const [fetchedOnce, setFetchedOnce] = useState(false);

  useEffect(() => {
    if (!fetchWithAuth) return;

    const reload = searchParams.get("reload");
    const ragSoc = searchParams.get("ragSoc") || "";

    const fetchAndClean = async () => {
      try {
        setLoading(true);

        let data;
        if (ragSoc.trim() !== "") {
          data = await getContatti(fetchWithAuth, { nome: ragSoc });
        } else {
          data = await getContatti(fetchWithAuth);
        }

        setContattiCRM(data.map(mapRawToContatto));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento dei contatti.");
        console.error(err);
      } finally {
        setLoading(false);
        setFetchedOnce(true);
      }

      // Ricostruisci URL senza reload e ragSoc
      if (reload === "true" || ragSoc) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("reload");
        newParams.delete("ragSoc");

        const newQueryString = newParams.toString();
        const newUrl = pathname + (newQueryString ? `?${newQueryString}` : "");

        router.replace(newUrl, { scroll: false });
      }
    };

    fetchAndClean();
  }, [fetchWithAuth, pathname, searchParams, router]);

  /**
   * Effetto per gestire il ridimensionamento della finestra e aggiornare
   * gli stati di larghezza e altezza in modo da adattare dinamicamente la griglia.
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
   * Costanti per configurare la griglia virtuale in base alla dimensione della finestra,
   * decidendo numero di colonne, dimensioni delle card e righe totali.
   */
  const CARD_COUNT = windowHeight < 600 ? 2 : windowHeight < 800 ? 3 : 4;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor((windowWidth * 0.98) / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(contattiCRM.length / columnCount);

  /**
   * Funzione chiamata quando si esce dal campo filtro per aggiornare
   * la lista filtrata di contatti. Richiama l'API con i filtri correnti
   * e aggiorna la lista visualizzata.
   */
  async function handleFiltersBlur(values: Record<string, string>) {
    setFiltersValues(values);
    setLoading(true);

    try {
      const areAllFiltersEmpty = Object.values(values).every(
        (v) => v.trim() === ""
      );

      let data;
      if (areAllFiltersEmpty) {
        data = await getContatti(fetchWithAuth);
      } else {
        console.log(values);
        data = await getContatti(fetchWithAuth, values);
      }

      setContattiCRM(data.map(mapRawToContatto));
      setError(null);
    } catch (err) {
      setError("Errore nel caricamento dei contatti.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Funzione componente per il rendering di ogni cella della griglia virtualizzata.
   * Calcola l'indice corretto in base a riga e colonna, esclude celle fuori range,
   * e mostra i dati del contatto in una Card con icone e link attivi.
   */
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= contattiCRM.length) return null;

    const contatto = contattiCRM[index];

    return (
      <div style={{ ...style, margin: 0, padding: 0, cursor: "pointer" }}>
        <Card
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
              value: contatto.tel,
              href: `tel:${contatto.tel}`,
            },
          ]}
          dato={contatto}
        />
      </div>
    );
  };

  /**
   * Funzione di utilità per mappare un oggetto raw proveniente dall'API
   * in un oggetto Contatto conforme all'interfaccia usata nel componente.
   */
  function mapRawToContatto(raw: any): Contatto {
    return {
      idContatto: raw.IdContatto,
      nome: raw.Nome,
      cognome: raw.Cognome,
      ragioneSociale: raw.RagSoc,
      cellulare: raw.Cell,
      email: raw.EMail,
      tipoContatto: raw.TipoContatto,
      tel: raw.Tel,
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
        onBlur={handleFiltersBlur}
        initialValues={{ nome: initialRagSoc }}
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
          height={windowHeight * 0.8}
          width={isMobile ? windowWidth * 0.92 : windowWidth}
        >
          {Cell}
        </Grid>
      )}
    </ProtectedRoute>
  );
};

export default ContattiVirtualGrid;

const filtersConfig: FilterConfig[] = [
  {
    type: "text",
    label: "Nome/Rag.Soc",
    name: "nome",
    placeholder: "Cerca nome...",
  },
];
