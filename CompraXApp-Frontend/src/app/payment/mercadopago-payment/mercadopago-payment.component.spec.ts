import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercadopagoPaymentComponent } from './mercadopago-payment.component';

describe('MercadopagoPaymentComponent', () => {
  let component: MercadopagoPaymentComponent;
  let fixture: ComponentFixture<MercadopagoPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercadopagoPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MercadopagoPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
