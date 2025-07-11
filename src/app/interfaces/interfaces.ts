export interface Cliente {
  idCliente: number;
  ragSocCompleta: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  idZona: string;
  idPaese: string;
  tel: string;
  email: string;
  noteCliente?: string;
   Sem1:number         
  Sem2:number         
  Sem3:number         
  Sem4:number 
  // NoteCliFat:string
  // NoteCliLst:string
  // NoteCliOff:string
  // NoteCliOrd:string
  // NoteCliente:string
  // NoteCrmElab:string
}

export interface Visita {
  IdAttivita: number;           
  DescAttivita: string;       
  NoteAttivita: string;       
  DataAttivita: string;               
  RagSoc: string;   
  Sem1:number         
  Sem2:number         
  Sem3:number         
  Sem4:number         
}


export interface Contatto {
  idContatto: number;
  nome: string;
  cognome: string;
  ragioneSociale: string;
  cellulare: string;
  email: string;
  disabilita: boolean;
  tipoContatto: string;
  telefonoElaborato: string;
  cittaClienteFornitore: string;
  paeseClienteFornitore: string;
   Sem1:number         
  Sem2:number         
  Sem3:number         
  Sem4:number 
}
