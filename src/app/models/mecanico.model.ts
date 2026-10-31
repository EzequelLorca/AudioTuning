export interface Repuesto {
  nombre: string;
  costo: number;
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
  servicioSeleccionado: string;
  descripcionServicio?: string;   // Detalle que ve el cliente
  notaInterna?: string;           // Solo lo ve el mecánico
  repuestos: Repuesto[];
  costoManoObra: number;
  totalCobrado: number;
  fotoTrabajo?: string;
  estado?: EstadoTrabajo;
}