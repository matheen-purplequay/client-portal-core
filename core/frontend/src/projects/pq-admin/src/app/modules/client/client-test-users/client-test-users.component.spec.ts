import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTestUsersComponent } from './client-test-users.component';

describe('ClientTestUsersComponent', () => {
  let component: ClientTestUsersComponent;
  let fixture: ComponentFixture<ClientTestUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTestUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTestUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
