"use client";

import GenericCard from "@/app/components/shared/card/card";
import GenericFilters, {
  FilterConfig,
} from "@/app/components/shared/filters/filters";
import { MapPin, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import { ProtectedRoute } from "@/app/auth/ProtectedRoute";
import { Cliente } from "@/app/interfaces/interfaces";
import { getClienti, getClientiFiltrati } from "@/app/services/api";
import { LoadingComponent } from "@/app/components/loading/loading";
import { useAuth } from "@/app/context/authContext";

import "./clienti.css";

const ClientiVirtualGrid = () => {
  const [filtersValues, setFiltersValues] = useState<Record<string, string>>(
    {}
  );
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [clientiCRM, setClientiCRM] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchWithAuth, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

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
    fetchClienti();
  }, [isReady]);

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
    : Math.floor(windowWidth*0.98 / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(clientiCRM.length / columnCount);

  // Funzione per aggiornare filtri e fare fetch solo se cambiano
    async function handleFiltersBlur(values: Record<string, string>) {
      // Se i filtri sono identici, non fare nulla
      if (JSON.stringify(values) === JSON.stringify(filtersValues)) return;
  
      setFiltersValues(values);
      setLoading(true);
      try {
        const data = await getClientiFiltrati(fetchWithAuth, values);
        setClientiCRM(data.map(mapRawToCliente));
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento delle visite filtrate.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= clientiCRM.length) return null;

    const cliente = clientiCRM[index];

    return (
      <div style={{ ...style, margin: 0, padding: 0 }}>
        <GenericCard
          title={cliente.ragSocCompleta}
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

  function htmlToPlainText(html: string): string {
    if (!html) return "";

    // Sostituisci i <br> con \n
    let text = html.replace(/<br\s*\/?>/gi, "\n");

    // Sostituisci i <p> e </p> con \n\n per separare paragrafi
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(/<p[^>]*>/gi, "");

    // Rimuovi eventuali altri tag HTML rimanenti
    text = text.replace(/<[^>]+>/g, "");

    // Rimuovi spazi vuoti multipli o linee vuote extra se vuoi
    text = text.replace(/\n\s*\n/g, "\n\n"); // doppio a capo consistente

    // Trim per rimuovere spazi inutili a inizio e fine
    return text.trim();
  }

  function mapRawToCliente(raw: any): Cliente {
    return {
      idCliente: raw.IdCliente,
      ragSocCompleta: raw.RagSoc,
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
             width={isMobile?windowWidth*0.92:windowWidth}
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
