import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodSelectionComponent } from './payment-method-selection.component';

describe('PaymentMethodSelectionComponent', () => {
  let component: PaymentMethodSelectionComponent;
  let fixture: ComponentFixture<PaymentMethodSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
