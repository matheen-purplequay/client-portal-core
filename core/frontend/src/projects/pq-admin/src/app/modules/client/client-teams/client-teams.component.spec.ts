import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTeamsComponent } from './client-teams.component';

describe('ClientTeamsComponent', () => {
  let component: ClientTeamsComponent;
  let fixture: ComponentFixture<ClientTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTeamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
