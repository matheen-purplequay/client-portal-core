import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMasterComponent } from './client-master.component';

describe('ClientMasterComponent', () => {
  let component: ClientMasterComponent;
  let fixture: ComponentFixture<ClientMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
