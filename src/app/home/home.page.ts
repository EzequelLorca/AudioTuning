import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonContent, IonFooter,
  IonSegment, IonSegmentButton, IonCard, IonCardContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonList,
  IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption,
  ToastController, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline,
  personOutline, carSportOutline, constructOutline, cubeOutline, cashOutline,
  cameraOutline, addOutline, closeOutline, searchOutline, documentTextOutline
} from 'ionicons/icons';
import { RegistroTrabajo, Repuesto, MarcaAuto, EstadoTrabajo } from '../models/mecanico.model';

type Errores = Record<string, string>;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonContent, IonFooter,
    IonSegment, IonSegmentButton, IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonList,
    IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption
  ]
})
export class HomePage implements OnInit {

  private readonly CLAVE_STORAGE = 'historial_audiotuning';

  seccion: string = 'nuevo';
  filtroTexto: string = '';
  filtroEstado: EstadoTrabajo | 'todos' = 'todos';

  estados: { valor: EstadoTrabajo; texto: string }[] = [
    { valor: 'pendiente', texto: 'Pendiente' },
    { valor: 'en-proceso', texto: 'En proceso' },
    { valor: 'terminado', texto: 'Terminado' },
    { valor: 'pagado', texto: 'Pagado' }
  ];

  catalogoAutos: MarcaAuto[] = [
    { nombre: 'Volkswagen', modelos: ['Golf', 'Gol', 'Polo', 'Jetta', 'Bora', 'Tiguan', 'Amarok'] },
    { nombre: 'Kia', modelos: ['Morning', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Soul'] },
    { nombre: 'Chevrolet', modelos: ['Sail', 'Spark', 'Cruze', 'Tracker', 'Captiva', 'Silverado'] },
    { nombre: 'Hyundai', modelos: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Grand i10'] },
    { nombre: 'Toyota', modelos: ['Yaris', 'Corolla', 'Hilux', 'RAV4', 'Avensis'] },
    { nombre: 'Mazda', modelos: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-5', 'CX-30'] },
    { nombre: 'BMW', modelos: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'] },
    { nombre: 'Nissan', modelos: ['Versa', 'Sentra', 'Qashqai', 'X-Trail', 'NP300'] }
  ];

  serviciosLogo: string[] = [
    'Mecánica Automotriz General',
    'Limpieza de Inyectores',
    'Instalaciones Eléctricas y de Audio',
    'Copias de Llaves Codificadas',
    'Escáner y Diagnóstico Electrónico'
  ];

  // --- Formulario nuevo ---
  modelosDisponibles: string[] = [];
  trabajoActual: RegistroTrabajo = this.inicializarTrabajo();
  errores: Errores = {};
  nuevoRepuestoNombre: string = '';
  nuevoRepuestoCosto: number | null = null;
  totalRepuestos: number = 0;
  totalCalculado: number = 0;
  procesandoFoto: boolean = false;

  // --- Historial ---
  historial: RegistroTrabajo[] = [];

  // --- Edición ---
  editandoId: string | null = null;
  copiaEdicion: any = null;
  erroresEdicion: Errores = {};
  editRepNombre: string = '';
  editRepCosto: number | null = null;

  // --- Vista cliente ---
  itemClienteSeleccionado: RegistroTrabajo | null = null;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline,
      personOutline, carSportOutline, constructOutline, cubeOutline, cashOutline,
      cameraOutline, addOutline, closeOutline, searchOutline, documentTextOutline
    });
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  /** Formato peso chileno: 63000 -> $63.000 */
  clp(valor: number | null | undefined): string {
    return '$' + Math.round(Number(valor || 0)).toLocaleString('es-CL');
  }

  textoEstado(estado?: EstadoTrabajo): string {
    const encontrado = this.estados.find(e => e.valor === (estado || 'pendiente'));
    return encontrado ? encontrado.texto : 'Pendiente';
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2200,
      color,
      position: 'top',
      cssClass: 'toast-neon'
    });
    await toast.present();
  }

  limpiarError(campo: string) {
    delete this.errores[campo];
  }

  limpiarErrorEdicion(campo: string) {
    delete this.erroresEdicion[campo];
  }

  private limpiarTelefono(tel?: string | null): string {
    return (tel || '').replace(/\D/g, '');
  }

  private limpiarPatente(pat?: string | null): string {
    return (pat || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /** BBCL12 -> BB-CL-12 | AB1234 -> AB-12-34 */
  formatearPatente(pat?: string | null): string {
    const limpia = this.limpiarPatente(pat);
    return limpia.length === 6 ? (limpia.match(/.{2}/g) as string[]).join('-') : limpia;
  }

  private validarDatos(datos: any, completo: boolean): Errores {
    const e: Errores = {};

    if (completo) {
      if (!datos.marcaAuto) e['marca'] = 'Selecciona la marca.';
      if (!datos.modeloAuto) e['modelo'] = 'Selecciona el modelo.';
      if (datos.anoAuto) {
        const ano = Number(datos.anoAuto);
        const maximo = new Date().getFullYear() + 1;
        if (isNaN(ano) || ano < 1950 || ano > maximo) {
          e['ano'] = `Ingresa un año entre 1950 y ${maximo}.`;
        }
      }
    }

    if (!datos.servicioSeleccionado) e['servicio'] = 'Selecciona el tipo de servicio.';

    const tel = this.limpiarTelefono(datos.telefonoCliente);
    if (tel && !/^569\d{8}$/.test(tel)) {
      e['telefono'] = 'Debe ser 569 + 8 dígitos. Ej: 56912345678';
    }

    const pat = this.limpiarPatente(datos.patenteCliente);
    if (pat && !/^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/.test(pat)) {
      e['patente'] = 'Formato válido: BBCL12 o AB1234.';
    }

    return e;
  }

  // =========================================================
  // FORMULARIO NUEVO PRESUPUESTO
  // =========================================================

  inicializarTrabajo(): RegistroTrabajo {
    return {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-CL'),
      marcaAuto: '',
      modeloAuto: '',
      anoAuto: null,
      patenteCliente: '',
      nombreCliente: '',
      telefonoCliente: '',
      servicioSeleccionado: '',
      descripcionServicio: '',
      notaInterna: '',
      repuestos: [],
      costoManoObra: 0,
      totalCobrado: 0,
      fotoTrabajo: '',
      estado: 'pendiente'
    };
  }

  onCambiarMarca() {
    const marca = this.catalogoAutos.find(m => m.nombre === this.trabajoActual.marcaAuto);
    this.modelosDisponibles = marca ? marca.modelos : [];
    this.trabajoActual.modeloAuto = '';
    this.limpiarError('marca');
  }

  agregarRepuesto() {
    const nombre = this.nuevoRepuestoNombre.trim();
    const costo = Number(this.nuevoRepuestoCosto);
    if (!nombre || !costo || costo <= 0) {
      this.mostrarToast('Escribe el nombre del repuesto y un costo mayor a 0.', 'warning');
      return;
    }
    this.trabajoActual.repuestos.push({ nombre, costo });
    this.nuevoRepuestoNombre = '';
    this.nuevoRepuestoCosto = null;
    this.calcularTotal();
  }

  eliminarRepuesto(index: number) {
    this.trabajoActual.repuestos.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalRepuestos = this.trabajoActual.repuestos.reduce((acc: number, r: Repuesto) => acc + r.costo, 0);
    this.totalCalculado = this.totalRepuestos + Number(this.trabajoActual.costoManoObra || 0);
    this.trabajoActual.totalCobrado = this.totalCalculado;
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    event.target.value = ''; // permite volver a elegir la misma foto
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mostrarToast('El archivo debe ser una imagen.', 'warning');
      return;
    }

    this.procesandoFoto = true;
    try {
      // Se achica a 800px y se comprime para no llenar el almacenamiento
      this.trabajoActual.fotoTrabajo = await this.comprimirImagen(file, 800, 0.7);
    } catch {
      this.mostrarToast('No se pudo cargar la foto. Prueba con otra imagen.', 'danger');
    } finally {
      this.procesandoFoto = false;
    }
  }

  private comprimirImagen(file: File, maxLado: number, calidad: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Sin canvas'));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', calidad));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  quitarFoto() {
    this.trabajoActual.fotoTrabajo = '';
  }

  guardarTrabajo() {
    this.errores = this.validarDatos(this.trabajoActual, true);
    if (Object.keys(this.errores).length > 0) {
      this.mostrarToast('Revisa los campos marcados en rojo.', 'danger');
      return;
    }

    this.calcularTotal();

    const nuevo: RegistroTrabajo = {
      ...this.trabajoActual,
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-CL'),
      nombreCliente: (this.trabajoActual.nombreCliente || '').trim(),
      telefonoCliente: this.limpiarTelefono(this.trabajoActual.telefonoCliente),
      patenteCliente: this.formatearPatente(this.trabajoActual.patenteCliente),
      anoAuto: this.trabajoActual.anoAuto ? Number(this.trabajoActual.anoAuto) : null,
      descripcionServicio: (this.trabajoActual.descripcionServicio || '').trim(),
      notaInterna: (this.trabajoActual.notaInterna || '').trim(),
      repuestos: [...this.trabajoActual.repuestos],
      estado: 'pendiente'
    };

    this.historial.unshift(nuevo);
    if (!this.guardarEnStorage()) {
      this.historial.shift();
      return;
    }

    this.trabajoActual = this.inicializarTrabajo();
    this.modelosDisponibles = [];
    this.totalRepuestos = 0;
    this.totalCalculado = 0;
    this.errores = {};
    this.mostrarToast('Presupuesto guardado.');
  }

  // =========================================================
  // ALMACENAMIENTO
  // =========================================================

  cargarHistorial() {
    try {
      const data = localStorage.getItem(this.CLAVE_STORAGE);
      if (data) {
        // Normaliza registros antiguos que no tenían estado ni nota interna
        this.historial = JSON.parse(data).map((i: any) => ({
          ...i,
          estado: i.estado || 'pendiente',
          notaInterna: i.notaInterna || '',
          repuestos: i.repuestos || []
        }));
      }
    } catch {
      this.historial = [];
      this.mostrarToast('No se pudo leer el historial guardado.', 'danger');
    }
  }

  guardarEnStorage(): boolean {
    try {
      localStorage.setItem(this.CLAVE_STORAGE, JSON.stringify(this.historial));
      return true;
    } catch {
      this.mostrarToast('Almacenamiento lleno: elimina presupuestos antiguos para guardar más.', 'danger');
      return false;
    }
  }

  // =========================================================
  // HISTORIAL
  // =========================================================

  historialFiltrado(): RegistroTrabajo[] {
    let lista = this.historial;

    if (this.filtroEstado !== 'todos') {
      lista = lista.filter(i => i.estado === this.filtroEstado);
    }

    const txt = (this.filtroTexto || '').trim().toLowerCase();
    if (!txt) return lista;

    return lista.filter(item =>
      (item.marcaAuto || '').toLowerCase().includes(txt) ||
      (item.modeloAuto || '').toLowerCase().includes(txt) ||
      (item.patenteCliente || '').toLowerCase().includes(txt) ||
      (item.nombreCliente || '').toLowerCase().includes(txt) ||
      (item.servicioSeleccionado || '').toLowerCase().includes(txt) ||
      (item.notaInterna || '').toLowerCase().includes(txt)
    );
  }

  contarEstado(estado: EstadoTrabajo): number {
    return this.historial.filter(i => i.estado === estado).length;
  }

  trackById(index: number, item: RegistroTrabajo) {
    return item.id;
  }

  get resumenMes() {
    const ahora = new Date();
    const delMes = this.historial.filter(i => {
      const f = new Date(Number(i.id)); // el id es la fecha de creación
      return !isNaN(f.getTime()) && f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    });

    const presupuestado = delMes.reduce((acc, i) => acc + Number(i.totalCobrado || 0), 0);
    const pagado = delMes
      .filter(i => i.estado === 'pagado')
      .reduce((acc, i) => acc + Number(i.totalCobrado || 0), 0);

    const conteo: Record<string, number> = {};
    delMes.forEach(i => {
      const serv = i.servicioSeleccionado || 'Sin servicio';
      conteo[serv] = (conteo[serv] || 0) + 1;
    });
    const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];

    return {
      nombreMes: ahora.toLocaleDateString('es-CL', { month: 'long' }),
      cantidad: delMes.length,
      presupuestado,
      pagado,
      porCobrar: presupuestado - pagado,
      servicioTop: top ? top[0] : '—'
    };
  }

  onCambiarEstado(item: RegistroTrabajo) {
    if (this.guardarEnStorage()) {
      this.mostrarToast(`Estado: ${this.textoEstado(item.estado)}`);
    }
  }

  async eliminarRegistro(item: RegistroTrabajo) {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar presupuesto',
      message: `Se eliminará el presupuesto del ${item.marcaAuto} ${item.modeloAuto}. Esta acción no se puede deshacer.`,
      cssClass: 'alerta-neon',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.historial = this.historial.filter(i => i.id !== item.id);
            this.guardarEnStorage();
            this.mostrarToast('Presupuesto eliminado.', 'warning');
          }
        }
      ]
    });
    await alerta.present();
  }

  // =========================================================
  // EDICIÓN COMPLETA
  // =========================================================

  activarEdicion(item: RegistroTrabajo) {
    this.editandoId = item.id;
    this.copiaEdicion = {
      ...item,
      repuestos: item.repuestos.map(r => ({ ...r }))
    };
    this.erroresEdicion = {};
    this.editRepNombre = '';
    this.editRepCosto = null;
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.copiaEdicion = null;
    this.erroresEdicion = {};
  }

  agregarRepuestoEdicion() {
    const nombre = this.editRepNombre.trim();
    const costo = Number(this.editRepCosto);
    if (!nombre || !costo || costo <= 0) {
      this.mostrarToast('Escribe el nombre del repuesto y un costo mayor a 0.', 'warning');
      return;
    }
    this.copiaEdicion.repuestos.push({ nombre, costo });
    this.editRepNombre = '';
    this.editRepCosto = null;
  }

  eliminarRepuestoEdicion(index: number) {
    this.copiaEdicion.repuestos.splice(index, 1);
  }

  totalEdicion(): number {
    if (!this.copiaEdicion) return 0;
    const rep = this.copiaEdicion.repuestos.reduce((acc: number, r: Repuesto) => acc + r.costo, 0);
    return rep + Number(this.copiaEdicion.costoManoObra || 0);
  }

  guardarEdicion(item: RegistroTrabajo) {
    this.erroresEdicion = this.validarDatos(this.copiaEdicion, false);
    if (Object.keys(this.erroresEdicion).length > 0) {
      this.mostrarToast('Revisa los campos marcados en rojo.', 'danger');
      return;
    }

    item.nombreCliente = (this.copiaEdicion.nombreCliente || '').trim();
    item.telefonoCliente = this.limpiarTelefono(this.copiaEdicion.telefonoCliente);
    item.patenteCliente = this.formatearPatente(this.copiaEdicion.patenteCliente);
    item.servicioSeleccionado = this.copiaEdicion.servicioSeleccionado;
    item.descripcionServicio = (this.copiaEdicion.descripcionServicio || '').trim();
    item.notaInterna = (this.copiaEdicion.notaInterna || '').trim();
    item.repuestos = this.copiaEdicion.repuestos;
    item.costoManoObra = Number(this.copiaEdicion.costoManoObra || 0);
    item.estado = this.copiaEdicion.estado;
    item.totalCobrado = this.totalEdicion();

    this.cancelarEdicion();
    if (this.guardarEnStorage()) {
      this.mostrarToast('Cambios guardados.');
    }
  }

  // =========================================================
  // VISTA CLIENTE Y WHATSAPP (nunca incluyen la nota interna)
  // =========================================================

  verPresentacionCliente(item: RegistroTrabajo) {
    this.itemClienteSeleccionado = item;
  }

  cerrarPresentacionCliente() {
    this.itemClienteSeleccionado = null;
  }

  enviarWhatsApp(item: RegistroTrabajo) {
    const repuestosTexto = item.repuestos.map(r => `• ${r.nombre}: ${this.clp(r.costo)}`).join('\n');
    const vehiculo = `${item.marcaAuto} ${item.modeloAuto}${item.anoAuto ? ' (' + item.anoAuto + ')' : ''}`;

    const mensaje = `🛸 *AUDIOTUNING - OTRA DIMENSIÓN* 🛸\n\n` +
      `Estimado/a *${item.nombreCliente || 'Cliente'}*:\n` +
      `Presupuesto para su vehículo *${vehiculo}* (Patente: ${item.patenteCliente || 'N/A'})\n\n` +
      `🔧 *Servicio:* ${item.servicioSeleccionado}\n` +
      (item.descripcionServicio ? `📝 *Detalle:* ${item.descripcionServicio}\n\n` : '\n') +
      (item.repuestos.length > 0 ? `⚙️ *Repuestos:*\n${repuestosTexto}\n\n` : '') +
      `🛠️ *Mano de Obra:* ${this.clp(item.costoManoObra)}\n` +
      `💰 *TOTAL A PAGAR: ${this.clp(item.totalCobrado)}*`;

    const telefono = this.limpiarTelefono(item.telefonoCliente);
    if (!telefono) {
      this.mostrarToast('Este presupuesto no tiene teléfono: elige el contacto en WhatsApp.', 'warning');
    }
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
}