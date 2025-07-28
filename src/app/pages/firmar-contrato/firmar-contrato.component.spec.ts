import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmarContratoComponent } from './firmar-contrato.component';

describe('FirmarContratoComponent', () => {
  let component: FirmarContratoComponent;
  let fixture: ComponentFixture<FirmarContratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmarContratoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmarContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
