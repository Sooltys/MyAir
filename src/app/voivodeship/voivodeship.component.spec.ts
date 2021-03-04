import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoivodeshipComponent } from './voivodeship.component';

describe('VoivodeshipComponent', () => {
  let component: VoivodeshipComponent;
  let fixture: ComponentFixture<VoivodeshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoivodeshipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoivodeshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
