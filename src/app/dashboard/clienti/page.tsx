/**
 * ClientiVirtualGrid.tsx
 * 
 * Componente principale per visualizzare una griglia virtuale di clienti CRM.
 * Permette di filtrare i clienti tramite input, carica dati da API protette 
 * con autenticazione, gestisce stati di caricamento ed errori.
 * Utilizza una griglia virtualizzata (react-window) per ottimizzare le performance,
 * e si adatta dinamicamente alle dimensioni della finestra per il layout responsivo.
 */

"use client";

import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, { FilterConfig } from "@/app/components/shared/filters";
import { MapPin, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import { Cliente } from "@/app/interfaces/interfaces";
import { getClienti } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ClientiVirtualGrid = () => {
  // Stati per memorizzare dimensioni della finestra
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Lista clienti caricata dall’API
  const [clientiCRM, setClientiCRM] = useState<Cliente[]>([]);

  // Stati per gestione caricamento e errori
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook personalizzato per fetch con autenticazione
  const { fetchWithAuth } = useAuth();

  /**
   * fetchClienti
   * 
   * Funzione asincrona per recuperare clienti da API usando fetch autenticato,
   * mappa i dati raw nel formato Cliente, gestisce errori e stato caricamento.
   */
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * useEffect per eseguire fetch clienti al caricamento del componente,
   * o quando cambia fetchWithAuth, pathname o query string.
   * Se è presente il parametro reload=true nei parametri URL,
   * ricarica i dati e rimuove il parametro reload dall'URL senza ricaricare la pagina.
   */
  useEffect(() => {
    if (!fetchWithAuth) return;

    const reload = searchParams.get("reload");

    const fetchAndClean = async () => {
      if (reload === "true") {
        await fetchClienti();

        // Rimuove parametro reload dall’URL mantenendo gli altri
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("reload");
        const newQueryString = newParams.toString();
        const newUrl = pathname + (newQueryString ? `?${newQueryString}` : "");

        router.replace(newUrl, { scroll: false });
      } else {
        await fetchClienti();
      }
    };

    fetchAndClean();
  }, [fetchWithAuth, pathname, searchParams, router]);

  /**
   * useEffect per aggiornare le dimensioni della finestra quando viene ridimensionata,
   * usato per calcolare layout responsivo della griglia.
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    handleResize(); // inizializza subito
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcolo numero di righe e colonne e dimensioni card in base alla finestra
  const CARD_COUNT = windowHeight < 600 ? 2 : windowHeight < 800 ? 3 : 4;
  const isMobile = windowWidth < 768;
  const columnCount = isMobile ? 1 : 3;
  const CARD_WIDTH = isMobile
    ? Math.floor((windowWidth - 30) / columnCount)
    : Math.floor((windowWidth * 0.98) / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(clientiCRM.length / columnCount);

  /**
   * handleFiltersBlur
   * 
   * Funzione chiamata quando i filtri perdono il focus (blur).
   * Ricarica i dati clienti filtrati tramite API, gestisce stati di caricamento ed errori.
   */
  async function handleFiltersBlur(values: Record<string, string>) {
    setLoading(true);

    try {
      const areAllFiltersEmpty = Object.values(values).every(
        (v) => v.trim() === ""
      );

      const data = areAllFiltersEmpty
        ? await getClienti(fetchWithAuth)
        : await getClienti(fetchWithAuth, values);

      setClientiCRM(data.map(mapRawToCliente));
      setError(null);
    } catch (err) {
      setError("Errore nel caricamento dei contatti.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cell
   * 
   * Componente per ogni cella della griglia virtualizzata.
   * Calcola indice cliente da riga e colonna, se valido mostra la card con dati cliente,
   * inclusi link a mappe, mail e telefono.
   */
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= clientiCRM.length) return null;

    const cliente = clientiCRM[index];

    return (
      <div style={{ ...style, margin: 0, padding: 0 }}>
        <GenericCard
          title={cliente.RagSocCompleta}
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
          dato={cliente}
        />
      </div>
    );
  };

  /**
   * getMapLink
   * 
   * Crea URL Google Maps per la ricerca dell'indirizzo cliente, codificando i parametri.
   */
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

  /**
   * htmlToPlainText
   * 
   * Converte una stringa HTML in testo semplice, sostituendo <br>, <p> con
   * newline e rimuovendo altri tag HTML.
   */
  function htmlToPlainText(html: string): string {
    if (!html) return "";

    let text = html.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(/<p[^>]*>/gi, "");
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/\n\s*\n/g, "\n\n");

    return text.trim();
  }

  /**
   * mapRawToCliente
   * 
   * Converte un oggetto raw ricevuto dall’API in un oggetto Cliente tipizzato,
   * eseguendo conversioni necessarie come da HTML a testo.
   */
  function mapRawToCliente(raw: any): Cliente {
    return {
      IdCliente: raw.IdCliente,
      RagSocCompleta: raw.RagSoc,
      indirizzo: raw.Indirizzo,
      citta: raw.Citta,
      cap: raw.Cap,
      provincia: raw.Provincia || "",
      idZona: raw.IdZona,
      idPaese: raw.IdPaese,
      tel: raw.Tel,
      email: raw.EMail,
      noteCliente: htmlToPlainText(raw.NoteCrmElab) || raw.NoteCliente,
      Sem1: raw.Sem1 || 0,
      Sem2: raw.Sem2 || 0,
      Sem3: raw.Sem3 || 0,
      Sem4: raw.Sem4 || 0,
    };
  }

  return (
    <ProtectedRoute>
      <GenericFilters filters={filtersConfig} onBlur={handleFiltersBlur} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && clientiCRM.length === 0 && (
        <p>Nessun cliente trovato.</p>
      )}

      {!loading && !error && clientiCRM.length > 0 && (
        <div className="gr">
          <Grid
            height={windowHeight * 0.8}
            width={isMobile ? windowWidth * 0.92 : windowWidth}
            columnCount={columnCount}
            columnWidth={CARD_WIDTH}
            rowCount={rowCount}
            rowHeight={CARD_HEIGHT}
          >
            {Cell}
          </Grid>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default ClientiVirtualGrid;

const filtersConfig: FilterConfig[] = [
  {
    type: "text",
    label: "Nome/Rag.Soc",
    name: "ragioneSociale",
    placeholder: "Cerca...",
  },
];
