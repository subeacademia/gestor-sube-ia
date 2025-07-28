import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-crear-cotizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './crear-cotizacion.component.html',
  styleUrl: './crear-cotizacion.component.scss'
})
export class CrearCotizacionComponent implements OnInit {
  cotizacionForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isGeneratingCode = false;

  // Opciones para los selects
  modalidades = ['Online', 'Presencial', 'Híbrido'];
  tiposCobro = ['sesion', 'mes', 'proyecto'];
  monedas = ['CLP', 'USD', 'EUR'];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.cotizacionForm = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', [Validators.required]],
      empresa: ['', [Validators.required]],
      moneda: ['CLP', [Validators.required]],
      servicios: this.fb.array([]),
      atendido: ['', [Validators.required]],
      subtotal: [0, [Validators.required, Validators.min(1)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      descuentoValor: [0],
      totalConDescuento: [0],
      total: [0, [Validators.required, Validators.min(1)]],
      notas: ['']
    });
  }

  async ngOnInit() {
    // Generar código automáticamente al cargar el componente
    await this.generarCodigoAutomatico();
    
    // Agregar primer servicio por defecto
    this.agregarServicio();
    
    // Suscribirse a cambios en el formulario para calcular totales
    this.cotizacionForm.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  // Método para generar código automáticamente
  async generarCodigoAutomatico() {
    this.isGeneratingCode = true;
    try {
      const codigo = await this.firebaseService.generarCodigoCotizacion();
      this.cotizacionForm.patchValue({ codigo });
      console.log('✅ Código generado automáticamente:', codigo);
    } catch (error) {
      console.error('❌ Error al generar código:', error);
      this.errorMessage = 'Error al generar el código de cotización';
    } finally {
      this.isGeneratingCode = false;
    }
  }

  // Método para regenerar código manualmente
  async regenerarCodigo() {
    await this.generarCodigoAutomatico();
  }

  get servicios() {
    return this.cotizacionForm.get('servicios') as FormArray;
  }

  agregarServicio() {
    const servicioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      detalle: ['', [Validators.required]],
      modalidad: ['Online', [Validators.required]],
      alumnos: [1, [Validators.required, Validators.min(1)]],
      tipoCobro: ['sesion', [Validators.required]],
      subtotal: [0, [Validators.required, Validators.min(1)]],
      detallesCobro: this.fb.group({
        sesiones: [1, [Validators.min(1)]],
        valorSesion: [0, [Validators.min(0)]],
        meses: [1, [Validators.min(1)]],
        valorMes: [0, [Validators.min(0)]],
        valorProyecto: [0, [Validators.min(0)]]
      })
    });

    this.servicios.push(servicioForm);
  }

  eliminarServicio(index: number) {
    if (this.servicios.length > 1) {
      this.servicios.removeAt(index);
    }
  }

  calcularTotales() {
    let subtotal = 0;
    
    // Calcular subtotal de servicios
    this.servicios.controls.forEach(servicioControl => {
      const servicio = servicioControl.value;
      subtotal += servicio.subtotal || 0;
    });

    // Calcular descuento
    const descuentoPorcentaje = this.cotizacionForm.get('descuento')?.value || 0;
    const descuentoValor = (subtotal * descuentoPorcentaje) / 100;
    const totalConDescuento = subtotal - descuentoValor;

    // Actualizar valores en el formulario
    this.cotizacionForm.patchValue({
      subtotal: subtotal,
      descuentoValor: descuentoValor,
      totalConDescuento: totalConDescuento,
      total: totalConDescuento
    }, { emitEvent: false });
  }

  calcularSubtotalServicio(index: number) {
    const servicioControl = this.servicios.at(index);
    const servicio = servicioControl.value;
    const detallesCobro = servicio.detallesCobro;
    
    let subtotal = 0;
    
    switch (servicio.tipoCobro) {
      case 'sesion':
        subtotal = detallesCobro.sesiones * detallesCobro.valorSesion;
        break;
      case 'mes':
        subtotal = detallesCobro.meses * detallesCobro.valorMes;
        break;
      case 'proyecto':
        subtotal = detallesCobro.valorProyecto;
        break;
    }
    
    servicioControl.patchValue({ subtotal: subtotal }, { emitEvent: false });
  }

  async onSubmit() {
    if (this.cotizacionForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    // Validaciones adicionales
    if (!this.cotizacionForm.get('nombre')?.value) {
      this.errorMessage = 'El nombre del cliente es obligatorio';
      return;
    }

    if (!this.cotizacionForm.get('atendido')?.value) {
      this.errorMessage = 'El campo "Atendido por" es obligatorio';
      return;
    }

    if (this.cotizacionForm.get('total')?.value <= 0) {
      this.errorMessage = 'El valor total debe ser mayor a cero';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const cotizacionData = this.cotizacionForm.value;
      
      // Agregar timestamp y fecha
      cotizacionData.fechaTimestamp = new Date();
      cotizacionData.fecha = new Date().toLocaleDateString('es-CL');
      cotizacionData.estado = 'Pendiente';

      await this.firebaseService.createCotizacion(cotizacionData);
      
      this.successMessage = 'Cotización creada exitosamente';
      
      // Redirigir al panel de cotizaciones después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/cotizaciones']);
      }, 2000);
      
    } catch (error) {
      console.error('Error al crear cotización:', error);
      this.errorMessage = 'Error al crear la cotización. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  marcarCamposInvalidos() {
    Object.keys(this.cotizacionForm.controls).forEach(key => {
      const control = this.cotizacionForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });

    // Marcar campos de servicios
    this.servicios.controls.forEach((servicioControl: any) => {
      Object.keys(servicioControl.controls).forEach((key: string) => {
        const control = servicioControl.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    });
  }

  onCancel() {
    this.router.navigate(['/cotizaciones']);
  }

  // Método para formatear números como moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}
