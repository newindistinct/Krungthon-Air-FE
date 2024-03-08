import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobSchedulePage } from './job-schedule.page';

describe('JobSchedulePage', () => {
  let component: JobSchedulePage;
  let fixture: ComponentFixture<JobSchedulePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(JobSchedulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
