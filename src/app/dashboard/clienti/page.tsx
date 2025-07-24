/**
 * ClientiVirtualGrid
 *
 * Componente principale che gestisce la visualizzazione di una griglia virtuale
 * di clienti CRM. Utilizza filtri per cercare e filtrare i clienti,
 * carica i dati da API protette tramite autenticazione e mostra i clienti
 * in una griglia responsiva e virtualizzata per ottimizzare le performance.
 * Gestisce anche il caricamento, eventuali errori e la gestione dinamica della
 * dimensione della finestra per adattare il layout.
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


  // Stato dimensioni della finestra (altezza e larghezza)
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Stato lista clienti caricata dall'API
  const [clientiCRM, setClientiCRM] = useState<Cliente[]>([]);

  // Stato di caricamento dati e gestione errori
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook personalizzato per autenticazione e fetch protetto
  const { fetchWithAuth } = useAuth();
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

  useEffect(() => {
    if (!fetchWithAuth) return;

    const reload = searchParams.get("reload");

    const fetchAndClean = async () => {
      if (reload === "true") {
        await fetchClienti();

        // Ricostruisci query senza reload
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("reload");

        const newQueryString = newParams.toString();
        const newUrl = pathname + (newQueryString ? `?${newQueryString}` : "");

        // Cambia URL senza ricaricare pagina e senza scroll
        router.replace(newUrl, { scroll: false });
      } else {
        await fetchClienti();
      }
    };

    fetchAndClean();
  }, [fetchWithAuth, pathname, searchParams, router]);

  /**
   * useEffect per gestire il ridimensionamento della finestra e aggiornare
   * dinamicamente le dimensioni per il layout responsivo.
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

  // Configurazioni per dimensioni e numero di card nella griglia
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
   * Funzione asincrona chiamata quando i filtri perdono il focus (blur).
   * Confronta i nuovi valori con quelli precedenti e, se diversi, aggiorna i filtri,
   * ricarica i dati filtrati da API e gestisce stati di caricamento e errori.
   */
  async function handleFiltersBlur(values: Record<string, string>) {
   

  
    setLoading(true);

    try {
      const areAllFiltersEmpty = Object.values(values).every(
        (v) => v.trim() === ""
      );

      let data;
      if (areAllFiltersEmpty) {
        data = await getClienti(fetchWithAuth);
      } else {
        console.log(values);
        data = await getClienti(fetchWithAuth, values);
      }

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
   * Componente usato dalla griglia virtualizzata per rappresentare ogni cella,
   * che contiene una card con i dati del cliente. Calcola l'indice e se esiste
   * restituisce la card con informazioni di contatto e link mappe.
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
   * Genera un URL per la ricerca su Google Maps basato sull'indirizzo fornito,
   * codificando correttamente i dati per la query.
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
   * Converte una stringa HTML in testo semplice, sostituendo i tag di paragrafo e
   * line break con nuovi linee e rimuovendo ogni altro markup HTML.
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
   * Mappa un oggetto raw ricevuto dall'API in un oggetto Cliente tipizzato,
   * applicando eventuali trasformazioni necessarie, come la conversione da HTML a testo semplice.
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
      noteCliente: htmlToPlainText(raw.NoteCrmElab),
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
