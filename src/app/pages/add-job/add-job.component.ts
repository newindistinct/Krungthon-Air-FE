import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { collection, query, where } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.scss'],
})
export class AddJobComponent implements OnInit {
  @Input() group: any;

  times = ['8.00', '9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00']
  form: FormGroup


  constructor(
    private firestoreService: FirestoreService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    console.log(this.group)
    this.initForm()
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      start_time: [''],
      time: [''],
      site_id: [''],
    })
  }

  submit() {
    console.log(this.form.value)
    const time = this.form.value.time;
    const hour = time.split(".")[0];
    const site_id = this.form.value.site_id;
    const group_id = this.group.id;

    const collectionRef = collection(db, "jobs");
    // const sites = ["1", "2", "3"];
    // const groups = [{ id: "1", sites: ["1", "3"] }, { id: "2", sites: ["2"] }];
    const room = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"];
    // const { time, hour } = this.randomTime();
    // const num = [1, 2];
    // const group = groups[Math.floor(Math.random() * groups.length)];
    // const site_id = group.sites[Math.floor(Math.random() * group.sites.length)];
    // const randomNum = Math.floor(Math.random() * num.length);
    const querydate = new Date(this.form.value.start_time).setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(querydate);
    formatQueryDate.setDate(formatQueryDate.getDate());
    const nextDay = new Date(formatQueryDate);
    nextDay.setDate(formatQueryDate.getDate() + 1);
    const q = query(collectionRef,
      where("group_id", "==", this.group.id),
      // where("site_id", "==", site_id),
      where("book.date", ">", formatQueryDate),
      where("book.date", "<", nextDay),
      where("book.time", "array-contains", time),
    );
    const date = new Date(this.form.value.start_time).setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    formatDate.setDate(formatDate.getDate());
    const data = {
      book: { time: [time], date: formatDate },
      group_id: this.group.id,
      job_id: "1",
      project_id: "1",
      room: room[Math.floor(Math.random() * room.length)],
      site_id: site_id,
      type: "ล้าง",
    }
    this.firestoreService.addDatatoFirebase(collectionRef, data, q);
  }
  randomTime() {
    const hours = ["8.00", "9.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00"];
    const randomHourIndex = Math.floor(Math.random() * hours.length);
    const randomHour = hours[randomHourIndex];
    const hourNumber = parseInt(randomHour.split(".")[0]);
    return { time: randomHour, hour: hourNumber };
  }
}
