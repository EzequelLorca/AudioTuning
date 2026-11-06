export type TipoItem = 'repuesto' | 'mano-obra';

export interface Repuesto {
  nombre: string;
  costo: number;
  tipo?: TipoItem;   // si no tiene tipo, es un repuesto (registros antiguos)
}

export interface MarcaAuto {
  nombre: string;
  modelos: string[];
}

export type EstadoTrabajo = 'pendiente' | 'en-proceso' | 'terminado' | 'pagado';

/** Repuestos y trabajos cobrados antes, para sugerirlos de nuevo */
export interface ItemCatalogo {
  nombre: string;
  costo: number;
  tipo: TipoItem;
  marca?: string;
  usos: number;
  ultimaVez: number;
}

export interface RegistroTrabajo {
  id: string;
  fecha: string;
  marcaAuto: string;
  modeloAuto: string;
  anoAuto?: number | string | null;
  patenteCliente?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  instagramCliente?: string;      // Usuario de Instagram (sin @)
  servicioSeleccionado: string;
  descripcionServicio?: string;   // Detalle que ve el cliente
  notaInterna?: string;           // Solo lo ve el mecánico
  repuestos: Repuesto[];          // Repuestos y mano de obra (cada uno con su tipo)
  costoManoObra: number;          // Suma de los ítems de mano de obra
  totalCobrado: number;
  fotoTrabajo?: string;
  estado?: EstadoTrabajo;
}