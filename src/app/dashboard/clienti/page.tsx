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
import { getClienti } from "@/app/services/api";
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

  const { fetchWithAuth,isReady } = useAuth();

  useEffect(() => {

    if(!isReady) return;

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
    : Math.floor(windowWidth / columnCount);
  const CARD_HEIGHT = Math.floor((windowHeight * 0.8) / CARD_COUNT);
  const rowCount = Math.ceil(clientiCRM.length / columnCount);

  const handleFiltersChange = (values: Record<string, string>) => {
    setFiltersValues(values);
  };

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
      noteCliente: raw.NoteAmn,
      Sem1: raw.Sem1 || 0,
      Sem2: raw.Sem2 || 0,
      Sem3: raw.Sem3 || 0,
      Sem4: raw.Sem4 || 0,
    };
  }

  return (
    <ProtectedRoute>
      <GenericFilters filters={filtersConfig} onChange={handleFiltersChange} />

      {loading && <LoadingComponent />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && clientiCRM.length === 0 && (
        <p>Nessun cliente trovato.</p>
      )}
      {!loading && !error && clientiCRM.length > 0 && (
        <Grid
          height={windowHeight * 0.8}
          width={windowWidth}
          columnCount={columnCount}
          columnWidth={CARD_WIDTH}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT}
        >
          {Cell}
        </Grid>
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
