import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ProyectoCardComponent } from '../../shared/components/proyecto-card/proyecto-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subscription } from 'rxjs';

interface Proyecto {
  id?: string;
  nombreProyecto: string;
  clienteId: string;
  nombreCliente: string;
  contratoId?: string;
  tipoServicio: string;
  responsable: string;
  fechaEntregaEstimada: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  progreso: number;
  estadoProyecto: 'planificacion' | 'en-progreso' | 'en-revision' | 'completado';
  descripcion?: string;
  presupuesto?: number;
  prioridad: 'baja' | 'media' | 'alta';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    HeaderComponent,
    ProyectoCardComponent
  ],
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss']
})
export class ProyectosComponent implements OnInit, OnDestroy {
  // Propiedades del componente
  cargando = true;
  actualizandoProyecto = false;
  proyectos: Proyecto[] = [];
  proyectosEnPlanificacion: Proyecto[] = [];
  proyectosEnProgreso: Proyecto[] = [];
  proyectosEnRevision: Proyecto[] = [];
  proyectosCompletados: Proyecto[] = [];
  totalProyectos = 0;

  // Modal y formulario
  mostrarModal = false;
  editando = false;
  proyectoActual: Proyecto | null = null;
  proyectoForm: FormGroup;

  // Suscripciones
  private proyectosSubscription?: Subscription;

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.proyectoForm = this.fb.group({
      nombreProyecto: ['', [Validators.required, Validators.minLength(3)]],
      clienteId: ['', Validators.required],
      nombreCliente: ['', Validators.required],
      contratoId: [''],
      tipoServicio: ['', Validators.required],
      responsable: ['', Validators.required],
      fechaEntregaEstimada: ['', Validators.required],
      fechaInicio: [''],
      fechaFin: [''],
      progreso: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      estadoProyecto: ['planificacion', Validators.required],
      descripcion: [''],
      presupuesto: [0, [Validators.min(0)]],
      prioridad: ['media', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  ngOnDestroy(): void {
    if (this.proyectosSubscription) {
      this.proyectosSubscription.unsubscribe();
    }
  }

  // Cargar proyectos desde Firebase
  cargarProyectos(): void {
    this.cargando = true;
    this.proyectosSubscription = this.firebaseService.getProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.filtrarProyectosPorEstado();
        this.totalProyectos = proyectos.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.cargando = false;
      }
    });
  }

  // Filtrar proyectos por estado para las columnas del Kanban
  filtrarProyectosPorEstado(): void {
    this.proyectosEnPlanificacion = this.proyectos.filter(p => p.estadoProyecto === 'planificacion');
    this.proyectosEnProgreso = this.proyectos.filter(p => p.estadoProyecto === 'en-progreso');
    this.proyectosEnRevision = this.proyectos.filter(p => p.estadoProyecto === 'en-revision');
    this.proyectosCompletados = this.proyectos.filter(p => p.estadoProyecto === 'completado');
  }

  // Abrir modal para crear nuevo proyecto
  abrirModalCrearProyecto(): void {
    this.editando = false;
    this.proyectoActual = null;
    this.proyectoForm.reset({
      progreso: 0,
      estadoProyecto: 'planificacion',
      prioridad: 'media'
    });
    this.mostrarModal = true;
  }

  // Abrir modal para editar proyecto
  editarProyecto(proyecto: Proyecto): void {
    this.editando = true;
    this.proyectoActual = proyecto;
    
    // Convertir fechas a formato string para el formulario
    const formData = {
      ...proyecto,
      fechaEntregaEstimada: this.formatearFechaParaForm(proyecto.fechaEntregaEstimada),
      fechaInicio: proyecto.fechaInicio ? this.formatearFechaParaForm(proyecto.fechaInicio) : '',
      fechaFin: proyecto.fechaFin ? this.formatearFechaParaForm(proyecto.fechaFin) : ''
    };
    
    this.proyectoForm.patchValue(formData);
    this.mostrarModal = true;
  }

  // Ver detalles del proyecto
  verDetallesProyecto(proyecto: Proyecto): void {
    // TODO: Implementar vista de detalles
    console.log('Ver detalles del proyecto:', proyecto);
  }

  // Guardar proyecto (crear o actualizar)
  async guardarProyecto(): Promise<void> {
    console.log('🔄 ProyectosComponent: Iniciando guardado de proyecto...');
    console.log('📋 Estado del formulario:', this.proyectoForm.valid);
    console.log('📋 Errores del formulario:', this.proyectoForm.errors);
    
    if (this.proyectoForm.invalid) {
      console.log('❌ ProyectosComponent: Formulario inválido, no se puede guardar');
      this.mostrarNotificacion('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    this.actualizandoProyecto = true;

    try {
      const formData = this.proyectoForm.value;
      console.log('📋 Datos del formulario:', formData);
      
      const proyectoData: Proyecto = {
        ...formData,
        fechaEntregaEstimada: new Date(formData.fechaEntregaEstimada),
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio) : undefined,
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin) : undefined,
        fechaCreacion: this.proyectoActual?.fechaCreacion || new Date(),
        fechaActualizacion: new Date()
      };

      console.log('📋 Datos del proyecto a guardar:', proyectoData);

      if (this.editando && this.proyectoActual?.id) {
        console.log('📝 ProyectosComponent: Actualizando proyecto existente:', this.proyectoActual.id);
        await this.firebaseService.updateProyecto(this.proyectoActual.id, proyectoData);
        console.log('✅ ProyectosComponent: Proyecto actualizado correctamente');
        this.mostrarNotificacion('Proyecto actualizado exitosamente', 'success');
      } else {
        console.log('📝 ProyectosComponent: Creando nuevo proyecto');
        await this.firebaseService.createProyecto(proyectoData);
        console.log('✅ ProyectosComponent: Proyecto creado correctamente');
        this.mostrarNotificacion('Proyecto creado exitosamente', 'success');
      }
      
      this.cerrarModal();
      this.cargarProyectos(); // Recargar la lista
    } catch (error: any) {
      console.error('❌ ProyectosComponent: Error al guardar proyecto:', error);
      const mensajeError = error.message || 'Error desconocido al guardar el proyecto';
      this.mostrarNotificacion(mensajeError, 'error');
    } finally {
      this.actualizandoProyecto = false;
    }
  }

  // Eliminar proyecto
  async eliminarProyecto(proyectoId: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await this.firebaseService.deleteProyecto(proyectoId);
        console.log('Proyecto eliminado correctamente');
        this.cargarProyectos(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
      }
    }
  }

  // Cerrar modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.proyectoActual = null;
    this.proyectoForm.reset();
  }

  // Utilidades
  private formatearFechaParaForm(fecha: Date): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Getters para el template
  get tituloModal(): string {
    return this.editando ? 'Editar Proyecto' : 'Crear Nuevo Proyecto';
  }

  get textoBotonGuardar(): string {
    return this.editando ? 'Actualizar Proyecto' : 'Crear Proyecto';
  }

  // Navegar a la vista de detalle del proyecto
  navegarADetalleProyecto(proyectoId: string): void {
    this.router.navigate(['/proyectos', proyectoId]);
  }

  // Método para manejar el drop de drag and drop
  onDrop(event: CdkDragDrop<Proyecto[]>): void {
    if (event.previousContainer === event.container) {
      // Mover dentro de la misma columna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Mover entre columnas
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Obtener el proyecto movido
      const proyectoMovido = event.container.data[event.currentIndex];
      
      // Determinar el nuevo estado basado en la columna de destino
      let nuevoEstado: 'planificacion' | 'en-progreso' | 'en-revision' | 'completado';
      
      if (event.container.id === 'planificacion') {
        nuevoEstado = 'planificacion';
      } else if (event.container.id === 'en-progreso') {
        nuevoEstado = 'en-progreso';
      } else if (event.container.id === 'en-revision') {
        nuevoEstado = 'en-revision';
      } else if (event.container.id === 'completado') {
        nuevoEstado = 'completado';
      } else {
        return; // Estado no válido
      }
      
      // Actualizar el estado del proyecto en Firebase
      this.actualizarEstadoProyecto(proyectoMovido, nuevoEstado);
    }
  }

  // Método para actualizar el estado del proyecto en Firebase
  private async actualizarEstadoProyecto(proyecto: Proyecto, nuevoEstado: string): Promise<void> {
    if (!proyecto.id) {
      console.error('El proyecto no tiene ID');
      return;
    }

    this.actualizandoProyecto = true;

    try {
      const proyectoActualizado = {
        ...proyecto,
        estadoProyecto: nuevoEstado,
        fechaActualizacion: new Date()
      };

      // Ajustar el progreso automáticamente según el estado
      if (nuevoEstado === 'planificacion') {
        proyectoActualizado.progreso = Math.min(proyecto.progreso, 10);
      } else if (nuevoEstado === 'en-progreso') {
        proyectoActualizado.progreso = Math.max(proyecto.progreso, 20);
      } else if (nuevoEstado === 'en-revision') {
        proyectoActualizado.progreso = Math.max(proyecto.progreso, 80);
      } else if (nuevoEstado === 'completado') {
        proyectoActualizado.progreso = 100;
      }

      await this.firebaseService.updateProyecto(proyecto.id, proyectoActualizado);
      console.log(`Proyecto ${proyecto.nombreProyecto} movido a ${nuevoEstado}`);
      
      // Mostrar notificación de éxito
      this.mostrarNotificacion(`Proyecto "${proyecto.nombreProyecto}" movido a ${this.getEstadoText(nuevoEstado)}`, 'success');
      
      // Recargar los proyectos para reflejar los cambios
      this.cargarProyectos();
    } catch (error) {
      console.error('Error al actualizar el estado del proyecto:', error);
      // Mostrar notificación de error
      this.mostrarNotificacion('Error al actualizar el estado del proyecto', 'error');
      // Revertir el cambio visual si falla la actualización
      this.cargarProyectos();
    } finally {
      this.actualizandoProyecto = false;
    }
  }

  // Método para mostrar notificaciones
  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    if (tipo === 'success') {
      this.notificationService.showSuccess(mensaje);
    } else {
      this.notificationService.showError(mensaje);
    }
  }

  // Método para obtener texto del estado
  private getEstadoText(estado: string): string {
    const estados = {
      'planificacion': 'Planificación',
      'en-progreso': 'En Progreso',
      'en-revision': 'En Revisión',
      'completado': 'Completado'
    };
    return estados[estado as keyof typeof estados] || estado;
  }
}
