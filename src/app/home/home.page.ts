import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonContent, IonFooter,
  IonSegment, IonSegmentButton, IonCard, IonCardContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonList,
  IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption,
  ToastController, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline,
  personOutline, carSportOutline, constructOutline, cubeOutline, cashOutline,
  cameraOutline, addOutline, closeOutline, searchOutline, documentTextOutline,
  arrowBackOutline, hammerOutline, timeOutline, logoInstagram, shareSocialOutline
} from 'ionicons/icons';
import {
  RegistroTrabajo, Repuesto, MarcaAuto, EstadoTrabajo, TipoItem, ItemCatalogo
} from '../models/mecanico.model';

type Errores = Record<string, string>;

/** Valor especial de los selectores para "agregar otra marca/modelo" */
const NUEVA_OPCION = '__nueva__';

const MARCAS_BASE: MarcaAuto[] = [
  { nombre: 'BMW', modelos: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'] },
  { nombre: 'Chery', modelos: ['Tiggo 2', 'Tiggo 3', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5'] },
  { nombre: 'Chevrolet', modelos: ['Sail', 'Spark', 'Spark GT', 'Aveo', 'Onix', 'Cruze', 'Tracker', 'Captiva', 'Groove', 'Colorado', 'Silverado'] },
  { nombre: 'Citroën', modelos: ['C3', 'C4', 'C-Elysée', 'Berlingo'] },
  { nombre: 'Fiat', modelos: ['Uno', 'Palio', 'Mobi', 'Argo', 'Fiorino', 'Strada'] },
  { nombre: 'Ford', modelos: ['Fiesta', 'Focus', 'EcoSport', 'Escape', 'Ranger', 'F-150'] },
  { nombre: 'Great Wall', modelos: ['Wingle 5', 'Wingle 7', 'Poer'] },
  { nombre: 'Honda', modelos: ['City', 'Fit', 'Civic', 'HR-V', 'CR-V'] },
  { nombre: 'Hyundai', modelos: ['Grand i10', 'Accent', 'Elantra', 'Creta', 'Tucson', 'Santa Fe', 'Porter'] },
  { nombre: 'JAC', modelos: ['JS2', 'JS4', 'T8', 'Sunray'] },
  { nombre: 'Kia', modelos: ['Morning', 'Rio', 'Rio 5', 'Cerato', 'Soul', 'Sportage', 'Sorento', 'Frontier'] },
  { nombre: 'Mazda', modelos: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-30', 'CX-5', 'BT-50'] },
  { nombre: 'MG', modelos: ['MG3', 'MG5', 'ZS', 'HS'] },
  { nombre: 'Mitsubishi', modelos: ['Lancer', 'ASX', 'Outlander', 'Montero', 'L200'] },
  { nombre: 'Nissan', modelos: ['March', 'Versa', 'Sentra', 'Kicks', 'Qashqai', 'X-Trail', 'NP300', 'Navara'] },
  { nombre: 'Peugeot', modelos: ['208', '2008', '301', '308', '3008', 'Partner'] },
  { nombre: 'Renault', modelos: ['Clio', 'Logan', 'Sandero', 'Duster', 'Oroch', 'Koleos', 'Kangoo'] },
  { nombre: 'Subaru', modelos: ['Impreza', 'XV', 'Forester', 'Outback'] },
  { nombre: 'Suzuki', modelos: ['Alto', 'Celerio', 'Swift', 'Baleno', 'Dzire', 'Vitara', 'Grand Vitara', 'Jimny'] },
  { nombre: 'Toyota', modelos: ['Yaris', 'Corolla', 'Avensis', 'Rush', 'RAV4', 'Fortuner', 'Hilux'] },
  { nombre: 'Volkswagen', modelos: ['Gol', 'Polo', 'Golf', 'Virtus', 'Jetta', 'Bora', 'T-Cross', 'Tiguan', 'Saveiro', 'Amarok'] }
];

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonContent, IonFooter,
    IonSegment, IonSegmentButton, IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonList,
    IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption
  ]
})
export class HomePage implements OnInit {

  @ViewChild(IonContent) content?: IonContent;

  private readonly CLAVE_HISTORIAL = 'historial_audiotuning';
  private readonly CLAVE_MARCAS = 'marcas_audiotuning';
  private readonly CLAVE_CATALOGO = 'catalogo_audiotuning';
  readonly NUEVA = NUEVA_OPCION;

  seccion: string = 'nuevo';
  filtroTexto: string = '';
  filtroEstado: EstadoTrabajo | 'todos' = 'todos';

  estados: { valor: EstadoTrabajo; texto: string }[] = [
    { valor: 'pendiente', texto: 'Pendiente' },
    { valor: 'en-proceso', texto: 'En proceso' },
    { valor: 'terminado', texto: 'Terminado' },
    { valor: 'pagado', texto: 'Pagado' }
  ];

  tipos: { valor: TipoItem; titulo: string; placeholder: string; icono: string }[] = [
    { valor: 'repuesto', titulo: 'Repuestos', placeholder: 'Repuesto', icono: 'cube-outline' },
    { valor: 'mano-obra', titulo: 'Mano de obra', placeholder: 'Trabajo realizado', icono: 'hammer-outline' }
  ];

  serviciosLogo: string[] = [
    'Mecánica Automotriz General',
    'Limpieza de Inyectores',
    'Instalaciones Eléctricas y de Audio',
    'Copias de Llaves Codificadas',
    'Escáner y Diagnóstico Electrónico'
  ];

  // --- Marcas ---
  catalogoAutos: MarcaAuto[] = [];
  private marcasPersonalizadas: MarcaAuto[] = [];
  modelosDisponibles: string[] = [];
  private marcaPrevia = '';
  private modeloPrevio = '';

  // --- Precios cobrados antes ---
  private catalogoPrecios: ItemCatalogo[] = [];

  // --- Formulario (nuevo o edición) ---
  trabajoActual: RegistroTrabajo = this.inicializarTrabajo();
  errores: Errores = {};
  nuevo: Record<TipoItem, { nombre: string; costo: number | null }> = this.nuevoVacio();
  totalRepuestos: number = 0;
  totalManoObra: number = 0;
  totalCalculado: number = 0;
  procesandoFoto: boolean = false;
  editandoId: string | null = null;

  // --- Historial y vista cliente ---
  historial: RegistroTrabajo[] = [];
  itemClienteSeleccionado: RegistroTrabajo | null = null;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline,
      personOutline, carSportOutline, constructOutline, cubeOutline, cashOutline,
      cameraOutline, addOutline, closeOutline, searchOutline, documentTextOutline,
      arrowBackOutline, hammerOutline, timeOutline, logoInstagram, shareSocialOutline
    });
  }

  ngOnInit() {
    this.cargarMarcas();
    this.cargarHistorial();
    this.cargarCatalogo();
    this.asegurarGuardia();
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
      duration: 2500,
      color,
      position: 'top',
      cssClass: 'toast-neon'
    });
    await toast.present();
  }

  limpiarError(campo: string) {
    delete this.errores[campo];
  }

  private mismoTexto(a?: string | null, b?: string | null): boolean {
    return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
  }

  private limpiarTelefono(tel?: string | null): string {
    return (tel || '').replace(/\D/g, '');
  }

  private limpiarPatente(pat?: string | null): string {
    return (pat || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /** "@Juan.Perez " -> "juan.perez" (también acepta el link del perfil) */
  limpiarInstagram(usuario?: string | null): string {
    let u = (usuario || '').trim();
    const desdeLink = u.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
    if (desdeLink) u = desdeLink[1];
    return u.replace(/^@/, '').replace(/[^A-Za-z0-9._]/g, '').toLowerCase();
  }

  /** BBCL12 -> BB-CL-12 | AB1234 -> AB-12-34 */
  formatearPatente(pat?: string | null): string {
    const limpia = this.limpiarPatente(pat);
    return limpia.length === 6 ? (limpia.match(/.{2}/g) as string[]).join('-') : limpia;
  }

  private async pedirTexto(header: string, placeholder: string): Promise<string | null> {
    const alerta = await this.alertCtrl.create({
      header,
      cssClass: 'alerta-neon',
      inputs: [{ name: 'texto', type: 'text', placeholder }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Agregar', role: 'confirm' }
      ]
    });
    await alerta.present();
    const { data, role } = await alerta.onDidDismiss();
    const texto = (data?.values?.texto || '').trim();
    return role === 'confirm' && texto ? texto : null;
  }

  private validarDatos(datos: any): Errores {
    const e: Errores = {};

    if (!datos.marcaAuto) e['marca'] = 'Selecciona la marca.';
    if (!datos.modeloAuto) e['modelo'] = 'Selecciona el modelo.';
    if (!datos.servicioSeleccionado) e['servicio'] = 'Selecciona el tipo de servicio.';

    if (datos.anoAuto) {
      const ano = Number(datos.anoAuto);
      const maximo = new Date().getFullYear() + 1;
      if (isNaN(ano) || ano < 1950 || ano > maximo) e['ano'] = `Ingresa un año entre 1950 y ${maximo}.`;
    }

    const tel = this.limpiarTelefono(datos.telefonoCliente);
    if (tel && !/^569\d{8}$/.test(tel)) e['telefono'] = 'Debe ser 569 + 8 dígitos. Ej: 56912345678';

    const pat = this.limpiarPatente(datos.patenteCliente);
    if (pat && !/^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/.test(pat)) e['patente'] = 'Formato válido: BBCL12 o AB1234.';

    return e;
  }

  // =========================================================
  // BOTÓN VOLVER (flecha del header y botón atrás del celular)
  // =========================================================

  puedeVolver(): boolean {
    return !!this.itemClienteSeleccionado || this.editandoId !== null || this.seccion === 'historial';
  }

  volver() {
    if (this.itemClienteSeleccionado) {
      this.itemClienteSeleccionado = null;
      return;
    }
    if (this.editandoId !== null) {
      this.cancelarEdicion();
      return;
    }
    if (this.seccion === 'historial') {
      this.seccion = 'nuevo';
    }
  }

  /** Deja un paso extra en el historial del navegador para que "atrás" no saque de la app */
  private asegurarGuardia() {
    if (!history.state || !history.state.audiotuning) {
      history.pushState({ audiotuning: true }, '');
    }
  }

  @HostListener('window:popstate')
  onBotonAtras() {
    if (this.puedeVolver()) {
      this.volver();
      this.asegurarGuardia();
    } else {
      this.mostrarToast('Presiona atrás otra vez para salir.', 'warning');
    }
  }

  onCambiarSeccion() {
    if (this.seccion === 'historial') this.asegurarGuardia();
  }

  // =========================================================
  // MARCAS Y MODELOS (con marcas propias)
  // =========================================================

  private cargarMarcas() {
    try {
      this.marcasPersonalizadas = JSON.parse(localStorage.getItem(this.CLAVE_MARCAS) || '[]');
    } catch {
      this.marcasPersonalizadas = [];
    }
    this.construirCatalogoAutos();
  }

  private guardarMarcas() {
    localStorage.setItem(this.CLAVE_MARCAS, JSON.stringify(this.marcasPersonalizadas));
  }

  private construirCatalogoAutos() {
    const catalogo: MarcaAuto[] = MARCAS_BASE.map(m => ({ nombre: m.nombre, modelos: [...m.modelos] }));
    for (const extra of this.marcasPersonalizadas) {
      const existente = catalogo.find(m => this.mismoTexto(m.nombre, extra.nombre));
      if (existente) {
        extra.modelos.forEach(mod => {
          if (!existente.modelos.some(x => this.mismoTexto(x, mod))) existente.modelos.push(mod);
        });
      } else {
        catalogo.push({ nombre: extra.nombre, modelos: [...extra.modelos] });
      }
    }
    this.catalogoAutos = catalogo.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  private modelosDe(marca: string): string[] {
    const encontrada = this.catalogoAutos.find(m => this.mismoTexto(m.nombre, marca));
    return encontrada ? [...encontrada.modelos] : [];
  }

  private agregarMarca(nombre: string, avisar = true) {
    if (this.catalogoAutos.some(m => this.mismoTexto(m.nombre, nombre))) return;
    this.marcasPersonalizadas.push({ nombre, modelos: [] });
    this.guardarMarcas();
    this.construirCatalogoAutos();
    if (avisar) this.mostrarToast(`Marca "${nombre}" agregada.`);
  }

  private agregarModelo(marca: string, modelo: string, avisar = true) {
    if (this.modelosDe(marca).some(m => this.mismoTexto(m, modelo))) return;
    let extra = this.marcasPersonalizadas.find(m => this.mismoTexto(m.nombre, marca));
    if (!extra) {
      extra = { nombre: marca, modelos: [] };
      this.marcasPersonalizadas.push(extra);
    }
    extra.modelos.push(modelo);
    this.guardarMarcas();
    this.construirCatalogoAutos();
    if (avisar) this.mostrarToast(`Modelo "${modelo}" agregado a ${marca}.`);
  }

  async onCambiarMarca() {
    if (this.trabajoActual.marcaAuto === NUEVA_OPCION) {
      const nombre = await this.pedirTexto('Nueva marca', 'Ej: SsangYong');
      if (!nombre) {
        this.trabajoActual.marcaAuto = this.marcaPrevia;
        return;
      }
      this.agregarMarca(nombre);
      const marca = this.catalogoAutos.find(m => this.mismoTexto(m.nombre, nombre));
      this.trabajoActual.marcaAuto = marca ? marca.nombre : nombre;
    }
    this.marcaPrevia = this.trabajoActual.marcaAuto;
    this.modelosDisponibles = this.modelosDe(this.trabajoActual.marcaAuto);
    this.trabajoActual.modeloAuto = '';
    this.modeloPrevio = '';
    this.limpiarError('marca');
  }

  async onCambiarModelo() {
    if (this.trabajoActual.modeloAuto === NUEVA_OPCION) {
      const nombre = await this.pedirTexto(`Nuevo modelo de ${this.trabajoActual.marcaAuto}`, 'Ej: Rio 4');
      if (!nombre) {
        this.trabajoActual.modeloAuto = this.modeloPrevio;
        return;
      }
      this.agregarModelo(this.trabajoActual.marcaAuto, nombre);
      this.modelosDisponibles = this.modelosDe(this.trabajoActual.marcaAuto);
      const existente = this.modelosDisponibles.find(m => this.mismoTexto(m, nombre));
      this.trabajoActual.modeloAuto = existente || nombre;
    }
    this.modeloPrevio = this.trabajoActual.modeloAuto;
    this.limpiarError('modelo');
  }

  // =========================================================
  // REPUESTOS Y MANO DE OBRA
  // =========================================================

  private nuevoVacio(): Record<TipoItem, { nombre: string; costo: number | null }> {
    return {
      'repuesto': { nombre: '', costo: null },
      'mano-obra': { nombre: '', costo: null }
    };
  }

  tipoDe(item: Repuesto): TipoItem {
    return item.tipo || 'repuesto';
  }

  itemsDe(tipo: TipoItem, trabajo: RegistroTrabajo = this.trabajoActual): Repuesto[] {
    return (trabajo.repuestos || []).filter(i => this.tipoDe(i) === tipo);
  }

  totalDe(tipo: TipoItem, trabajo: RegistroTrabajo = this.trabajoActual): number {
    return this.itemsDe(tipo, trabajo).reduce((acc, i) => acc + Number(i.costo || 0), 0);
  }

  agregarItem(tipo: TipoItem) {
    const nombre = this.nuevo[tipo].nombre.trim();
    const costo = Number(this.nuevo[tipo].costo);
    if (!nombre || !costo || costo <= 0) {
      this.mostrarToast('Escribe la descripción y un costo mayor a 0.', 'warning');
      return;
    }
    this.trabajoActual.repuestos.push({ nombre, costo, tipo });
    this.nuevo[tipo] = { nombre: '', costo: null };
    this.calcularTotal();
  }

  agregarSugerencia(s: ItemCatalogo) {
    this.trabajoActual.repuestos.push({ nombre: s.nombre, costo: s.costo, tipo: s.tipo });
    this.nuevo[s.tipo] = { nombre: '', costo: null };
    this.calcularTotal();
  }

  eliminarItem(item: Repuesto) {
    const i = this.trabajoActual.repuestos.indexOf(item);
    if (i >= 0) this.trabajoActual.repuestos.splice(i, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalRepuestos = this.totalDe('repuesto');
    this.totalManoObra = this.totalDe('mano-obra');
    this.totalCalculado = this.totalRepuestos + this.totalManoObra;
    this.trabajoActual.costoManoObra = this.totalManoObra;
    this.trabajoActual.totalCobrado = this.totalCalculado;
  }

  /** Lo que ya cobraste antes: primero los de la misma marca y los más usados */
  sugerenciasDe(tipo: TipoItem): ItemCatalogo[] {
    const texto = this.nuevo[tipo].nombre.trim().toLowerCase();
    const yaAgregados = this.itemsDe(tipo).map(i => (i.nombre || '').trim().toLowerCase());
    const marca = this.trabajoActual.marcaAuto;

    return this.catalogoPrecios
      .filter(c => c.tipo === tipo)
      .filter(c => !yaAgregados.includes(c.nombre.toLowerCase()))
      .filter(c => !texto || c.nombre.toLowerCase().includes(texto))
      .sort((a, b) => {
        const marcaA = marca && this.mismoTexto(a.marca, marca) ? 1 : 0;
        const marcaB = marca && this.mismoTexto(b.marca, marca) ? 1 : 0;
        return (marcaB - marcaA) || (b.usos - a.usos) || (b.ultimaVez - a.ultimaVez);
      })
      .slice(0, 6);
  }

  // =========================================================
  // CATÁLOGO DE PRECIOS (lo que ya cobraste)
  // =========================================================

  private cargarCatalogo() {
    const data = localStorage.getItem(this.CLAVE_CATALOGO);
    if (data) {
      try {
        this.catalogoPrecios = JSON.parse(data);
        return;
      } catch { /* si falla, se reconstruye abajo */ }
    }
    // Primera vez: se arma con los presupuestos que ya tenías
    this.catalogoPrecios = [];
    [...this.historial].reverse().forEach(t => this.registrarEnCatalogo(t, true, Number(t.id) || Date.now()));
    this.guardarCatalogo();
  }

  private guardarCatalogo() {
    try {
      localStorage.setItem(this.CLAVE_CATALOGO, JSON.stringify(this.catalogoPrecios));
    } catch { /* el catálogo es opcional */ }
  }

  private registrarEnCatalogo(trabajo: RegistroTrabajo, contarUso: boolean, momento: number = Date.now()) {
    for (const item of trabajo.repuestos || []) {
      const nombre = (item.nombre || '').trim();
      const costo = Number(item.costo || 0);
      if (!nombre || costo <= 0) continue;

      const tipo = this.tipoDe(item);
      const existente = this.catalogoPrecios.find(c => c.tipo === tipo && this.mismoTexto(c.nombre, nombre));
      if (existente) {
        existente.costo = costo;
        existente.marca = trabajo.marcaAuto;
        existente.ultimaVez = momento;
        if (contarUso) existente.usos++;
      } else {
        this.catalogoPrecios.push({ nombre, costo, tipo, marca: trabajo.marcaAuto, usos: 1, ultimaVez: momento });
      }
    }
  }

  // =========================================================
  // FORMULARIO: NUEVO Y EDICIÓN
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
      instagramCliente: '',
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

  private limpiarFormulario() {
    this.trabajoActual = this.inicializarTrabajo();
    this.modelosDisponibles = [];
    this.marcaPrevia = '';
    this.modeloPrevio = '';
    this.nuevo = this.nuevoVacio();
    this.errores = {};
    this.calcularTotal();
  }

  activarEdicion(item: RegistroTrabajo) {
    this.trabajoActual = { ...item, repuestos: item.repuestos.map(r => ({ ...r })) };
    this.editandoId = item.id;

    // Si la marca o el modelo no están en la lista, se agregan para poder mostrarlos
    if (item.marcaAuto) this.agregarMarca(item.marcaAuto, false);
    if (item.marcaAuto && item.modeloAuto) this.agregarModelo(item.marcaAuto, item.modeloAuto, false);
    this.modelosDisponibles = this.modelosDe(item.marcaAuto);
    this.marcaPrevia = item.marcaAuto;
    this.modeloPrevio = item.modeloAuto;

    this.nuevo = this.nuevoVacio();
    this.errores = {};
    this.calcularTotal();
    this.seccion = 'nuevo';
    this.asegurarGuardia();
    this.content?.scrollToTop(300);
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.limpiarFormulario();
    this.seccion = 'historial';
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mostrarToast('El archivo debe ser una imagen.', 'warning');
      return;
    }

    this.procesandoFoto = true;
    try {
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
    // Si dejaste algo escrito en "agregar" con nombre y precio, se suma solo
    (['repuesto', 'mano-obra'] as TipoItem[]).forEach(t => {
      if (this.nuevo[t].nombre.trim() && Number(this.nuevo[t].costo) > 0) this.agregarItem(t);
    });

    this.errores = this.validarDatos(this.trabajoActual);
    if (Object.keys(this.errores).length > 0) {
      this.mostrarToast('Revisa los campos marcados en rojo.', 'danger');
      this.content?.scrollToTop(300);
      return;
    }

    const items: Repuesto[] = this.trabajoActual.repuestos
      .filter(i => (i.nombre || '').trim())
      .map(i => ({ nombre: i.nombre.trim(), costo: Number(i.costo || 0), tipo: this.tipoDe(i) }));

    const datos: RegistroTrabajo = {
      ...this.trabajoActual,
      nombreCliente: (this.trabajoActual.nombreCliente || '').trim(),
      telefonoCliente: this.limpiarTelefono(this.trabajoActual.telefonoCliente),
      instagramCliente: this.limpiarInstagram(this.trabajoActual.instagramCliente),
      patenteCliente: this.formatearPatente(this.trabajoActual.patenteCliente),
      anoAuto: this.trabajoActual.anoAuto ? Number(this.trabajoActual.anoAuto) : null,
      descripcionServicio: (this.trabajoActual.descripcionServicio || '').trim(),
      notaInterna: (this.trabajoActual.notaInterna || '').trim(),
      repuestos: items,
      estado: this.trabajoActual.estado || 'pendiente'
    };
    datos.costoManoObra = this.totalDe('mano-obra', datos);
    datos.totalCobrado = this.totalDe('repuesto', datos) + datos.costoManoObra;

    const anterior = this.historial;
    const indice = this.editandoId ? this.historial.findIndex(h => h.id === this.editandoId) : -1;

    if (indice >= 0) {
      // Edición: conserva el id y la fecha original
      const original = this.historial[indice];
      const actualizado: RegistroTrabajo = { ...datos, id: original.id, fecha: original.fecha };
      const copia = [...this.historial];
      copia[indice] = actualizado;
      this.historial = copia;
      if (!this.guardarEnStorage()) {
        this.historial = anterior;
        return;
      }
      this.registrarEnCatalogo(actualizado, false);
      this.guardarCatalogo();
      this.editandoId = null;
      this.limpiarFormulario();
      this.seccion = 'historial';
      this.mostrarToast('Cambios guardados.');
    } else {
      // Nuevo presupuesto
      const nuevoRegistro: RegistroTrabajo = {
        ...datos,
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString('es-CL')
      };
      this.historial = [nuevoRegistro, ...this.historial];
      if (!this.guardarEnStorage()) {
        this.historial = anterior;
        return;
      }
      this.registrarEnCatalogo(nuevoRegistro, true);
      this.guardarCatalogo();
      this.editandoId = null;
      this.limpiarFormulario();
      this.mostrarToast('Presupuesto guardado.');
    }
  }

  // =========================================================
  // ALMACENAMIENTO DEL HISTORIAL
  // =========================================================

  cargarHistorial() {
    try {
      const data = localStorage.getItem(this.CLAVE_HISTORIAL);
      if (data) {
        this.historial = JSON.parse(data).map((i: any) => this.normalizar(i));
      }
    } catch {
      this.historial = [];
      this.mostrarToast('No se pudo leer el historial guardado.', 'danger');
    }
  }

  /** Adapta registros antiguos: la mano de obra única pasa a ser un ítem */
  private normalizar(i: any): RegistroTrabajo {
    const items: Repuesto[] = (i.repuestos || []).map((r: any) => ({
      nombre: r.nombre,
      costo: Number(r.costo || 0),
      tipo: r.tipo || 'repuesto'
    }));
    if (!items.some(r => r.tipo === 'mano-obra') && Number(i.costoManoObra) > 0) {
      items.push({ nombre: 'Mano de obra', costo: Number(i.costoManoObra), tipo: 'mano-obra' });
    }
    const registro: RegistroTrabajo = {
      ...i,
      estado: i.estado || 'pendiente',
      notaInterna: i.notaInterna || '',
      instagramCliente: i.instagramCliente || '',
      repuestos: items
    };
    registro.costoManoObra = this.totalDe('mano-obra', registro);
    registro.totalCobrado = this.totalDe('repuesto', registro) + registro.costoManoObra;
    return registro;
  }

  guardarEnStorage(): boolean {
    try {
      localStorage.setItem(this.CLAVE_HISTORIAL, JSON.stringify(this.historial));
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
      (item.instagramCliente || '').toLowerCase().includes(txt) ||
      (item.servicioSeleccionado || '').toLowerCase().includes(txt) ||
      (item.notaInterna || '').toLowerCase().includes(txt) ||
      item.repuestos.some(r => (r.nombre || '').toLowerCase().includes(txt))
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
      const f = new Date(Number(i.id));
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
            if (this.editandoId === item.id) {
              this.editandoId = null;
              this.limpiarFormulario();
            }
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
  // VISTA CLIENTE, WHATSAPP, INSTAGRAM Y COMPARTIR
  // (nunca incluyen la nota interna)
  // =========================================================

  verPresentacionCliente(item: RegistroTrabajo) {
    this.itemClienteSeleccionado = item;
    this.asegurarGuardia();
  }

  cerrarPresentacionCliente() {
    this.itemClienteSeleccionado = null;
  }

  /** Arma el texto del presupuesto. Con negritas (*) solo para WhatsApp */
  private armarMensaje(item: RegistroTrabajo, conNegritas: boolean): string {
    const b = conNegritas ? '*' : '';
    const lineas = (tipo: TipoItem) =>
      this.itemsDe(tipo, item).map(r => `• ${r.nombre}: ${this.clp(r.costo)}`).join('\n');
    const repuestosTexto = lineas('repuesto');
    const manoObraTexto = lineas('mano-obra');
    const vehiculo = `${item.marcaAuto} ${item.modeloAuto}${item.anoAuto ? ' (' + item.anoAuto + ')' : ''}`;

    return `🛸 ${b}AUDIOTUNING - OTRA DIMENSIÓN${b} 🛸\n\n` +
      `Estimado/a ${b}${item.nombreCliente || 'Cliente'}${b}:\n` +
      `Presupuesto para su vehículo ${b}${vehiculo}${b} (Patente: ${item.patenteCliente || 'N/A'})\n\n` +
      `🔧 ${b}Servicio:${b} ${item.servicioSeleccionado}\n` +
      (item.descripcionServicio ? `📝 ${b}Detalle:${b} ${item.descripcionServicio}\n\n` : '\n') +
      (repuestosTexto ? `⚙️ ${b}Repuestos:${b}\n${repuestosTexto}\n\n` : '') +
      (manoObraTexto ? `🛠️ ${b}Mano de obra:${b}\n${manoObraTexto}\n\n` : '') +
      `💰 ${b}TOTAL A PAGAR: ${this.clp(item.totalCobrado)}${b}`;
  }

  /** Copia texto al portapapeles (con plan B para celulares antiguos) */
  private async copiarTexto(texto: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    }
  }

  enviarWhatsApp(item: RegistroTrabajo) {
    const mensaje = this.armarMensaje(item, true);
    const telefono = this.limpiarTelefono(item.telefonoCliente);
    if (!telefono) {
      this.mostrarToast('Este presupuesto no tiene teléfono: elige el contacto en WhatsApp.', 'warning');
    }
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  /** Instagram no deja escribir el mensaje por link: se copia y se abre el chat */
  async enviarInstagram(item: RegistroTrabajo) {
    const mensaje = this.armarMensaje(item, false);
    const copiado = await this.copiarTexto(mensaje);
    const usuario = this.limpiarInstagram(item.instagramCliente);
    const url = usuario ? `https://ig.me/m/${usuario}` : 'https://www.instagram.com/direct/inbox/';

    window.open(url, '_blank');

    if (copiado) {
      this.mostrarToast(
        usuario
          ? 'Mensaje copiado. En el chat, mantén presionado y elige "Pegar".'
          : 'Mensaje copiado. Elige el chat del cliente y pégalo.'
      );
    } else {
      this.mostrarToast('No se pudo copiar el mensaje. Usa el botón Compartir.', 'warning');
    }
  }

  /** Abre el menú de compartir del celular (Instagram, Messenger, Telegram, correo...) */
  async compartir(item: RegistroTrabajo) {
    const texto = this.armarMensaje(item, false);
    const nav: any = navigator;

    if (!nav.share) {
      const copiado = await this.copiarTexto(texto);
      this.mostrarToast(
        copiado ? 'Tu navegador no permite compartir: el mensaje quedó copiado.' : 'No se pudo compartir.',
        copiado ? 'success' : 'warning'
      );
      return;
    }

    try {
      const datos: any = { title: 'Presupuesto AudioTuning', text: texto };

      // Si hay foto, se intenta enviar junto al texto
      if (item.fotoTrabajo) {
        const archivo = await this.fotoComoArchivo(item.fotoTrabajo);
        if (archivo && nav.canShare && nav.canShare({ files: [archivo] })) {
          datos.files = [archivo];
        }
      }

      await nav.share(datos);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        this.mostrarToast('No se pudo compartir.', 'warning');
      }
    }
  }

  private async fotoComoArchivo(dataUrl: string): Promise<File | null> {
    try {
      const respuesta = await fetch(dataUrl);
      const blob = await respuesta.blob();
      return new File([blob], 'trabajo-audiotuning.jpg', { type: blob.type || 'image/jpeg' });
    } catch {
      return null;
    }
  }
}