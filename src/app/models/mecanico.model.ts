export type TipoItem = 'repuesto' | 'accesorio' | 'otro' | 'mano-obra';

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
  repuestos: Repuesto[];          // Repuestos, accesorios, otros y mano de obra
  costoManoObra: number;          // Suma de los ítems de mano de obra
  totalCobrado: number;
  fotoTrabajo?: string;
  estado?: EstadoTrabajo;
}