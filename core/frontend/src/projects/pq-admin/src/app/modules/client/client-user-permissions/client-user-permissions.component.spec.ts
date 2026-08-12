import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientUserPermissionsComponent } from './client-user-permissions.component';

describe('ClientUserPermissionsComponent', () => {
  let component: ClientUserPermissionsComponent;
  let fixture: ComponentFixture<ClientUserPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientUserPermissionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientUserPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
