import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { FirebaseService } from '../../core/services/firebase.service';

interface Cliente {
  id?: string;
  empresa: string;
  rut: string;
  nombre: string;
  cargo?: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  valorTotalFacturado?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit, OnDestroy {
  clientes$: Observable<Cliente[]> | undefined;
  loading = true;
  procesando = false;
  mostrarModal = false;
  clienteEnEdicion: Cliente | null = null;
  guardando = false;
  clienteForm: FormGroup;
  private subscription = new Subscription();

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      empresa: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      cargo: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      direccion: [''],
      ciudad: [''],
      notas: ['']
    });
  }

  ngOnInit(): void {
    console.log('🚀 ClientesComponent: Inicializando...');
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async cargarClientes(): Promise<void> {
    try {
      console.log('📋 ClientesComponent: Cargando clientes...');
      this.loading = true;
      
      this.clientes$ = this.firebaseService.getClientes();
      
      // Suscribirse para manejar errores
      this.subscription.add(
        this.clientes$!.subscribe({
          next: (clientes) => {
            console.log('✅ ClientesComponent: Clientes cargados:', clientes?.length || 0);
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ ClientesComponent: Error al cargar clientes:', error);
            this.loading = false;
          }
        })
      );
    } catch (error) {
      console.error('❌ ClientesComponent: Error en cargarClientes:', error);
      this.loading = false;
    }
  }

  abrirModalCliente(): void {
    console.log('📝 ClientesComponent: Abriendo modal para nuevo cliente');
    this.clienteEnEdicion = null;
    this.clienteForm.reset();
    this.mostrarModal = true;
  }

  editarCliente(cliente: Cliente): void {
    console.log('✏️ ClientesComponent: Editando cliente:', cliente);
    this.clienteEnEdicion = cliente;
    this.clienteForm.patchValue({
      empresa: cliente.empresa,
      rut: cliente.rut,
      nombre: cliente.nombre,
      cargo: cliente.cargo || '',
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      notas: cliente.notas || ''
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    console.log('❌ ClientesComponent: Cerrando modal');
    this.mostrarModal = false;
    this.clienteEnEdicion = null;
    this.clienteForm.reset();
  }

  async guardarCliente(): Promise<void> {
    if (this.clienteForm.invalid) {
      console.warn('⚠️ ClientesComponent: Formulario inválido');
      this.marcarCamposComoTocados();
      return;
    }

    try {
      console.log('💾 ClientesComponent: Guardando cliente...');
      this.guardando = true;

      const datosCliente: Cliente = {
        ...this.clienteForm.value,
        fechaActualizacion: new Date()
      };

      if (this.clienteEnEdicion) {
        // Actualizar cliente existente
        console.log('🔄 ClientesComponent: Actualizando cliente existente');
        await this.firebaseService.updateCliente(this.clienteEnEdicion.id!, datosCliente);
        console.log('✅ ClientesComponent: Cliente actualizado exitosamente');
      } else {
        // Crear nuevo cliente
        console.log('➕ ClientesComponent: Creando nuevo cliente');
        datosCliente.fechaCreacion = new Date();
        datosCliente.valorTotalFacturado = 0; // Inicializar en 0
        await this.firebaseService.createCliente(datosCliente);
        console.log('✅ ClientesComponent: Cliente creado exitosamente');
      }

      this.cerrarModal();
    } catch (error) {
      console.error('❌ ClientesComponent: Error al guardar cliente:', error);
      alert('Error al guardar el cliente. Por favor, inténtalo de nuevo.');
    } finally {
      this.guardando = false;
    }
  }

  async eliminarCliente(clienteId: string | undefined): Promise<void> {
    if (!clienteId) {
      console.warn('⚠️ ClientesComponent: ID de cliente no válido');
      return;
    }
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🗑️ ClientesComponent: Eliminando cliente:', clienteId);
      await this.firebaseService.deleteCliente(clienteId);
      console.log('✅ ClientesComponent: Cliente eliminado exitosamente');
    } catch (error) {
      console.error('❌ ClientesComponent: Error al eliminar cliente:', error);
      alert('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos auxiliares para validación
  esCampoInvalido(campo: string): boolean {
    const control = this.clienteForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.clienteForm.get(campo);
    
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (control.errors['email']) {
      return 'Ingresa un email válido';
    }
    
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    
    if (control.errors['pattern']) {
      if (campo === 'rut') {
        return 'Formato de RUT inválido (ej: 12.345.678-9)';
      }
      if (campo === 'telefono') {
        return 'Formato de teléfono inválido';
      }
    }

    return 'Campo inválido';
  }

  async procesarContratosExistentes(): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres procesar todos los contratos existentes para crear clientes automáticamente? Esta acción puede tomar unos momentos.')) {
      return;
    }

    try {
      console.log('🔄 ClientesComponent: Procesando contratos existentes...');
      this.procesando = true;
      
      await this.firebaseService.procesarContratosExistentesParaClientes();
      
      // Recargar la lista de clientes
      await this.cargarClientes();
      
      alert('✅ Procesamiento completado. Los clientes han sido creados automáticamente desde los contratos firmados.');
    } catch (error) {
      console.error('❌ ClientesComponent: Error al procesar contratos existentes:', error);
      alert('❌ Error al procesar contratos existentes. Por favor, inténtalo de nuevo.');
    } finally {
      this.procesando = false;
    }
  }
}
