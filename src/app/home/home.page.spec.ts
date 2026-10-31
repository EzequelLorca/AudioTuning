import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, 
  IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardSubtitle, IonCardContent, IonItem, IonLabel, 
  IonInput, IonTextarea, IonList, IonNote, IonButton, 
  IonIcon, IonRow, IonCol, IonSearchbar, IonSelect, IonSelectOption 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline } from 'ionicons/icons';
import { RegistroTrabajo, Repuesto, MarcaAuto } from '../models/mecanico.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, 
    IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonItem, IonLabel, 
    IonInput, IonTextarea, IonList, IonNote, IonButton, 
    IonIcon, IonRow, IonCol, IonSearchbar, IonSelect, IonSelectOption
  ]
})
export class HomePage implements OnInit {

  seccion: string = 'nuevo';
  filtroTexto: string = '';

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

  modelosDisponibles: string[] = [];
  trabajoActual: RegistroTrabajo = this.inicializarTrabajo();
  
  nuevoRepuestoNombre: string = '';
  nuevoRepuestoCosto: number | null = null;
  totalRepuestos: number = 0;
  totalCalculado: number = 0;

  historial: RegistroTrabajo[] = [];
  
  // Control de edición y vista cliente en el historial
  editandoId: string | null = null;
  itemClienteSeleccionado: RegistroTrabajo | null = null;

  constructor() {
    addIcons({ trashOutline, logoWhatsapp, createOutline, eyeOutline, checkmarkOutline });
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  inicializarTrabajo(): RegistroTrabajo {
    return {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-CL'),
      marcaAuto: '',
      modeloAuto: '',
      patenteCliente: '',
      nombreCliente: '',
      telefonoCliente: '',
      servicioSeleccionado: '',
      descripcionServicio: '',
      repuestos: [],
      costoManoObra: 0,
      totalCobrado: 0,
      fotoTrabajo: ''
    };
  }

  onCambiarMarca() {
    const marcaEncontrada = this.catalogoAutos.find(m => m.nombre === this.trabajoActual.marcaAuto);
    if (marcaEncontrada) {
      this.modelosDisponibles = marcaEncontrada.modelos;
    } else {
      this.modelosDisponibles = [];
    }
    this.trabajoActual.modeloAuto = '';
  }

  agregarRepuesto() {
    if (this.nuevoRepuestoNombre.trim() !== '' && this.nuevoRepuestoCosto && this.nuevoRepuestoCosto > 0) {
      this.trabajoActual.repuestos.push({
        nombre: this.nuevoRepuestoNombre,
        costo: Number(this.nuevoRepuestoCosto)
      });
      this.nuevoRepuestoNombre = '';
      this.nuevoRepuestoCosto = null;
      this.calcularTotal();
    }
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.trabajoActual.fotoTrabajo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarTrabajo() {
    if (!this.trabajoActual.marcaAuto || !this.trabajoActual.modeloAuto || !this.trabajoActual.servicioSeleccionado) {
      alert('Por favor selecciona la marca, el modelo y el tipo de servicio.');
      return;
    }

    this.calcularTotal();
    this.historial.unshift({ ...this.trabajoActual });
    localStorage.setItem('historial_audiotuning', JSON.stringify(this.historial));

    this.trabajoActual = this.inicializarTrabajo();
    this.modelosDisponibles = [];
    this.totalRepuestos = 0;
    this.totalCalculado = 0;
    alert('¡Presupuesto guardado con éxito!');
  }

  cargarHistorial() {
    const data = localStorage.getItem('historial_audiotuning');
    if (data) {
      this.historial = JSON.parse(data);
    }
  }

  eliminarRegistro(id: string) {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
      this.historial = this.historial.filter(item => item.id !== id);
      localStorage.setItem('historial_audiotuning', JSON.stringify(this.historial));
    }
  }

  // Funciones para editar el historial
  activarEdicion(item: RegistroTrabajo) {
    this.editandoId = item.id;
  }

  guardarEdicion(item: RegistroTrabajo) {
    // Recalcular total basado en mano de obra y repuestos si cambiaron
    const repuestosTotal = item.repuestos.reduce((acc, r) => acc + r.costo, 0);
    item.totalCobrado = repuestosTotal + Number(item.costoManoObra);
    
    this.editandoId = null;
    localStorage.setItem('historial_audiotuning', JSON.stringify(this.historial));
    alert('¡Registro actualizado correctamente!');
  }

  // Mostrar vista de presentación para el cliente
  verPresentacionCliente(item: RegistroTrabajo) {
    this.itemClienteSeleccionado = item;
  }

  cerrarPresentacionCliente() {
    this.itemClienteSeleccionado = null;
  }

  enviarWhatsApp(item: RegistroTrabajo) {
    const repuestosTexto = item.repuestos.map(r => `• ${r.nombre}: $${r.costo.toLocaleString()}`).join('\n');
    const mensaje = `🛸 *AUDIOTUNING - OTRA DIMENSIÓN* 🛸\n\n` +
      `Estimado/a *${item.nombreCliente || 'Cliente'}*:\n` +
      `Presupuesto para su vehículo *${item.marcaAuto} ${item.modeloAuto}* (Patente: ${item.patenteCliente || 'N/A'})\n\n` +
      `🔧 *Servicio:* ${item.servicioSeleccionado}\n` +
      (item.descripcionServicio ? `📝 *Detalle:* ${item.descripcionServicio}\n\n` : '\n') +
      (item.repuestos.length > 0 ? `⚙️ *Repuestos:*\n${repuestosTexto}\n\n` : '') +
      `🛠️ *Mano de Obra:* $${item.costoManoObra.toLocaleString()}\n` +
      `💰 *TOTAL A PAGAR: $${item.totalCobrado.toLocaleString()}*`;

    const url = `https://api.whatsapp.com/send?phone=${item.telefonoCliente || ''}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  historialFiltrado() {
    if (!this.filtroTexto.trim()) {
      return this.historial;
    }
    const txt = this.filtroTexto.toLowerCase();
    return this.historial.filter(item => 
      item.marcaAuto.toLowerCase().includes(txt) || 
      item.modeloAuto.toLowerCase().includes(txt) ||
      (item.patenteCliente && item.patenteCliente.toLowerCase().includes(txt)) ||
      (item.nombreCliente && item.nombreCliente.toLowerCase().includes(txt)) ||
      item.servicioSeleccionado.toLowerCase().includes(txt)
    );
  }
}