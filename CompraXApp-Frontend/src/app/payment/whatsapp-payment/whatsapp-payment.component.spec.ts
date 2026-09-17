import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappPaymentComponent } from './whatsapp-payment.component';

describe('WhatsappPaymentComponent', () => {
  let component: WhatsappPaymentComponent;
  let fixture: ComponentFixture<WhatsappPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
