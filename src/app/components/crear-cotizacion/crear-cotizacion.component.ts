import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../core/services/firebase.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-crear-cotizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './crear-cotizacion.component.html',
  styleUrl: './crear-cotizacion.component.scss'
})
export class CrearCotizacionComponent implements OnInit {
  cotizacionForm!: FormGroup;
  serviciosDisponibles = [
    { id: 'charlas', nombre: 'Charlas', descripcion: 'Presentaciones orales' },
    { id: 'capacitaciones', nombre: 'Capacitaciones', descripcion: 'Talleres prácticos' },
    { id: 'certificaciones', nombre: 'Certificaciones', descripcion: 'Programas con diploma' },
    { id: 'consultorias', nombre: 'Consultorías', descripcion: 'Diagnóstico y plan de acción' },
    { id: 'mentorias', nombre: 'Mentorías', descripcion: 'Acompañamiento a largo plazo' },
    { id: 'asesorias', nombre: 'Asesorías de IA', descripcion: 'Soporte en proyectos de IA' }
  ];

  modalidades = ['Presencial', 'Online', 'Semipresencial'];
  tiposCobro = [
    { value: 'sesion', label: 'Por sesión' },
    { value: 'alumno', label: 'Por alumno' },
    { value: 'directo', label: 'Total directo' }
  ];
  monedas = ['CLP', 'USD', 'EUR', 'ARS', 'BRL', 'PEN', 'UYU', 'PYG', 'BOB'];
  atendedores = [
    'Rodrigo Carrillo',
    'Bruno Villalobos', 
    'Mario Muñoz',
    'Nicolás Valenzuela',
    'Ignacio Villarroel'
  ];

  codigoActual = 1;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    public router: Router
  ) {
    console.log('🔧 Constructor CrearCotizacionComponent ejecutado');
    console.log('📊 Servicios disponibles:', this.serviciosDisponibles);
  }

  ngOnInit(): void {
    console.log('🚀 CrearCotizacionComponent inicializado');
    this.inicializarFormulario();
    console.log('✅ Formulario inicializado:', this.cotizacionForm);
  }

  inicializarFormulario(): void {
    this.cotizacionForm = this.fb.group({
      // Datos básicos del cliente
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', [Validators.required]],
      empresa: ['', [Validators.required]],
      telefono: [''],
      direccion: [''],
      comuna: [''],
      ciudad: [''],
      region: [''],
      
      // Configuración de la cotización
      moneda: ['CLP', [Validators.required]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      atendedor: ['', [Validators.required]],
      notas: [''],
      
      // Servicios seleccionados
      serviciosSeleccionados: this.fb.array([]),
      
      // Detalles de servicios (se llenará dinámicamente)
      serviciosDetalle: this.fb.array([])
    });
  }

  get serviciosSeleccionadosArray(): FormArray {
    return this.cotizacionForm.get('serviciosSeleccionados') as FormArray;
  }

  get serviciosDetalleArray(): FormArray {
    return this.cotizacionForm.get('serviciosDetalle') as FormArray;
  }

  onServicioChange(servicioId: string, isChecked: boolean): void {
    if (isChecked) {
      // Agregar servicio seleccionado
      this.serviciosSeleccionadosArray.push(this.fb.control(servicioId));
      
      // Agregar detalle del servicio
      this.serviciosDetalleArray.push(this.crearFormGroupServicio(servicioId));
    } else {
      // Remover servicio seleccionado
      const index = this.serviciosSeleccionadosArray.value.indexOf(servicioId);
      if (index > -1) {
        this.serviciosSeleccionadosArray.removeAt(index);
        this.serviciosDetalleArray.removeAt(index);
      }
    }
  }

  onCheckboxChange(event: Event, servicioId: string): void {
    const target = event.target as HTMLInputElement;
    this.onServicioChange(servicioId, target.checked);
  }

  crearFormGroupServicio(servicioId: string): FormGroup {
    const servicio = this.serviciosDisponibles.find(s => s.id === servicioId);
    
    return this.fb.group({
      servicioId: [servicioId],
      nombre: [servicio?.nombre || ''],
      detalle: ['', [Validators.required]],
      modalidad: ['', [Validators.required]],
      alumnos: [1, [Validators.required, Validators.min(1)]],
      tipoCobro: ['sesion', [Validators.required]],
      
      // Campos específicos por tipo de cobro
      sesiones: [1, [Validators.min(1)]],
      valorSesion: [0, [Validators.min(0)]],
      valorAlumno: [0, [Validators.min(0)]],
      totalDirecto: [0, [Validators.min(0)]],
      
      subtotal: [0]
    });
  }

  onTipoCobroChange(index: number, tipoCobro: string): void {
    const servicioForm = this.serviciosDetalleArray.at(index) as FormGroup;
    
    // Resetear validaciones según el tipo de cobro
    if (tipoCobro === 'sesion') {
      servicioForm.get('sesiones')?.setValidators([Validators.required, Validators.min(1)]);
      servicioForm.get('valorSesion')?.setValidators([Validators.required, Validators.min(0)]);
      servicioForm.get('valorAlumno')?.clearValidators();
      servicioForm.get('totalDirecto')?.clearValidators();
    } else if (tipoCobro === 'alumno') {
      servicioForm.get('valorAlumno')?.setValidators([Validators.required, Validators.min(0)]);
      servicioForm.get('sesiones')?.clearValidators();
      servicioForm.get('valorSesion')?.clearValidators();
      servicioForm.get('totalDirecto')?.clearValidators();
    } else if (tipoCobro === 'directo') {
      servicioForm.get('totalDirecto')?.setValidators([Validators.required, Validators.min(0)]);
      servicioForm.get('sesiones')?.clearValidators();
      servicioForm.get('valorSesion')?.clearValidators();
      servicioForm.get('valorAlumno')?.clearValidators();
    }
    
    servicioForm.get('sesiones')?.updateValueAndValidity();
    servicioForm.get('valorSesion')?.updateValueAndValidity();
    servicioForm.get('valorAlumno')?.updateValueAndValidity();
    servicioForm.get('totalDirecto')?.updateValueAndValidity();
    
    this.calcularSubtotal(index);
  }

  calcularSubtotal(index: number): void {
    const servicioForm = this.serviciosDetalleArray.at(index) as FormGroup;
    const tipoCobro = servicioForm.get('tipoCobro')?.value;
    const alumnos = servicioForm.get('alumnos')?.value || 0;
    let subtotal = 0;

    if (tipoCobro === 'sesion') {
      const sesiones = servicioForm.get('sesiones')?.value || 0;
      const valorSesion = servicioForm.get('valorSesion')?.value || 0;
      subtotal = sesiones * valorSesion;
    } else if (tipoCobro === 'alumno') {
      const valorAlumno = servicioForm.get('valorAlumno')?.value || 0;
      subtotal = alumnos * valorAlumno;
    } else if (tipoCobro === 'directo') {
      subtotal = servicioForm.get('totalDirecto')?.value || 0;
    }

    servicioForm.patchValue({ subtotal });
  }

  generarCodigo(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    
    return `COT-${año}${mes}${dia}-${hora}${minuto}-${String(this.codigoActual).padStart(3, '0')}`;
  }

  async onSubmit(): Promise<void> {
    if (this.cotizacionForm.valid) {
      try {
        const formData = this.cotizacionForm.value;
        
        // Generar código único
        const codigo = this.generarCodigo();
        this.codigoActual++;

        // Preparar datos de servicios
        const servicios = formData.serviciosDetalle.map((servicio: any) => {
          let detallesCobro = {};
          
          if (servicio.tipoCobro === 'sesion') {
            detallesCobro = { 
              sesiones: servicio.sesiones, 
              valorSesion: servicio.valorSesion 
            };
          } else if (servicio.tipoCobro === 'alumno') {
            detallesCobro = { valorAlumno: servicio.valorAlumno };
          } else if (servicio.tipoCobro === 'directo') {
            detallesCobro = { totalDirecto: servicio.totalDirecto };
          }

          return {
            nombre: servicio.nombre,
            detalle: servicio.detalle,
            modalidad: servicio.modalidad,
            alumnos: servicio.alumnos,
            tipoCobro: servicio.tipoCobro,
            subtotal: servicio.subtotal,
            detallesCobro
          };
        });

        // Calcular totales
        const subtotal = servicios.reduce((sum: number, servicio: any) => sum + servicio.subtotal, 0);
        const descuento = formData.descuento || 0;
        const descuentoValor = (subtotal * descuento) / 100;
        const totalConDescuento = subtotal - descuentoValor;

        // Crear objeto de cotización
        const cotizacion = {
          codigo,
          nombre: formData.nombre,
          email: formData.email,
          rut: formData.rut,
          empresa: formData.empresa,
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          comuna: formData.comuna || '',
          ciudad: formData.ciudad || '',
          region: formData.region || '',
          moneda: formData.moneda,
          servicios,
          atendido: formData.atendedor,
          subtotal,
          descuento,
          descuentoValor,
          totalConDescuento,
          total: totalConDescuento,
          notas: formData.notas || '',
          estado: 'Pendiente'
        };

        // Guardar en Firebase
        await this.firebaseService.createCotizacion(cotizacion);
        
        // Mostrar mensaje de éxito y redirigir
        alert(`✅ Cotización ${codigo} creada exitosamente!`);
        this.router.navigate(['/cotizaciones']);
        
      } catch (error) {
        console.error('Error al crear cotización:', error);
        alert('❌ Error al crear la cotización. Por favor, inténtalo de nuevo.');
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  marcarCamposInvalidos(): void {
    Object.keys(this.cotizacionForm.controls).forEach(key => {
      const control = this.cotizacionForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  isServicioSeleccionado(servicioId: string): boolean {
    return this.serviciosSeleccionadosArray.value.includes(servicioId);
  }

  getServicioIndex(servicioId: string): number {
    return this.serviciosSeleccionadosArray.value.indexOf(servicioId);
  }

  getServicioFormGroup(index: number): FormGroup {
    return this.serviciosDetalleArray.at(index) as FormGroup;
  }

  testSubmit(): void {
    console.log('🧪 Test submit ejecutado');
    alert('✅ Componente funcionando correctamente!');
  }
}
