import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FirebaseService } from '../../core/services/firebase.service';
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

interface Tarea {
  id?: string;
  descripcion: string;
  completada: boolean;
  fechaCreacion: Date;
  fechaCompletada?: Date;
  prioridad: 'baja' | 'media' | 'alta';
  responsable?: string;
}

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent
  ],
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.scss']
})
export class ProyectoDetalleComponent implements OnInit, OnDestroy {
  // Propiedades del componente
  proyectoId: string = '';
  proyecto: Proyecto | null = null;
  tareas: Tarea[] = [];
  cargando = true;
  error = false;

  // Formulario para nueva tarea
  tareaForm: FormGroup;

  // Suscripciones
  private proyectoSubscription?: Subscription;
  private tareasSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private fb: FormBuilder
  ) {
    this.tareaForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      prioridad: ['media', Validators.required],
      responsable: ['']
    });
  }

  ngOnInit(): void {
    this.proyectoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.proyectoId) {
      this.cargarProyecto();
      this.cargarTareas();
    } else {
      this.error = true;
      this.cargando = false;
    }
  }

  ngOnDestroy(): void {
    if (this.proyectoSubscription) {
      this.proyectoSubscription.unsubscribe();
    }
    if (this.tareasSubscription) {
      this.tareasSubscription.unsubscribe();
    }
  }

  // Cargar datos del proyecto
  cargarProyecto(): void {
    this.proyectoSubscription = this.firebaseService.getProyectoById(this.proyectoId).subscribe({
      next: (proyecto) => {
        this.proyecto = proyecto;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar proyecto:', error);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  // Cargar tareas del proyecto
  cargarTareas(): void {
    this.tareasSubscription = this.firebaseService.getTareasForProyecto(this.proyectoId).subscribe({
      next: (tareas) => {
        this.tareas = tareas;
        this.actualizarProgresoProyecto();
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
      }
    });
  }

  // Agregar nueva tarea
  async agregarTarea(): Promise<void> {
    if (this.tareaForm.invalid) {
      return;
    }

    const tareaData: Tarea = {
      ...this.tareaForm.value,
      completada: false,
      fechaCreacion: new Date()
    };

    try {
      await this.firebaseService.addTareaToProyecto(this.proyectoId, tareaData);
      this.tareaForm.reset({
        prioridad: 'media',
        responsable: ''
      });
      console.log('Tarea agregada correctamente');
    } catch (error) {
      console.error('Error al agregar tarea:', error);
    }
  }

  // Actualizar estado de tarea
  async actualizarEstadoTarea(tarea: Tarea, completada: boolean): Promise<void> {
    const datosActualizar = {
      completada: completada,
      fechaCompletada: completada ? new Date() : null
    };

    try {
      if (tarea.id) {
        await this.firebaseService.updateTareaInProyecto(this.proyectoId, tarea.id, datosActualizar);
        console.log('Estado de tarea actualizado');
        this.actualizarProgresoProyecto();
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  }

  // Eliminar tarea
  async eliminarTarea(tareaId: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await this.firebaseService.deleteTareaFromProyecto(this.proyectoId, tareaId);
        console.log('Tarea eliminada correctamente');
        this.actualizarProgresoProyecto();
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  }

  // Actualizar progreso del proyecto basado en tareas completadas
  async actualizarProgresoProyecto(): Promise<void> {
    if (!this.proyecto || this.tareas.length === 0) return;

    const tareasCompletadas = this.tareas.filter(t => t.completada).length;
    const nuevoProgreso = Math.round((tareasCompletadas / this.tareas.length) * 100);

    if (nuevoProgreso !== this.proyecto.progreso) {
      try {
        await this.firebaseService.updateProyecto(this.proyectoId, {
          progreso: nuevoProgreso
        });
        console.log('Progreso del proyecto actualizado:', nuevoProgreso);
      } catch (error) {
        console.error('Error al actualizar progreso:', error);
      }
    }
  }

  // Navegar de vuelta a la lista de proyectos
  volverAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }

  // Obtener tareas completadas
  get tareasCompletadas(): Tarea[] {
    return this.tareas.filter(t => t.completada);
  }

  // Obtener tareas pendientes
  get tareasPendientes(): Tarea[] {
    return this.tareas.filter(t => !t.completada);
  }

  // Obtener texto del estado
  getEstadoText(estado: string): string {
    const estados = {
      'planificacion': 'Planificación',
      'en-progreso': 'En Progreso',
      'en-revision': 'En Revisión',
      'completado': 'Completado'
    };
    return estados[estado as keyof typeof estados] || estado;
  }

  // Obtener texto de prioridad
  getPrioridadText(prioridad: string): string {
    const prioridades = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta'
    };
    return prioridades[prioridad as keyof typeof prioridades] || prioridad;
  }

  // Obtener clase CSS para prioridad
  getPrioridadClass(prioridad: string): string {
    return `prioridad-${prioridad}`;
  }

  // Manejar cambio de checkbox
  onCheckboxChange(tarea: Tarea, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.actualizarEstadoTarea(tarea, target?.checked || false);
  }
}
