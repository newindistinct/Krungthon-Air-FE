import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  form: FormGroup
  constructor(
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    // this.form = this.formBuilder.group({
    //   status: ['', Validators.required],
    //   reader: ['', Validators.required],
    // })
    const hour = 8
    const date = new Date().setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    formatDate.setDate(formatDate.getDate() + 1);
  }

  formatDateToThaiString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      // weekday: 'long',
      // year: 'numeric',
      // month: 'long',
      // day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return date.toLocaleDateString('th-TH', options);
  }

  submit() {
    console.log(this.form.value)
  }

  // add() {
  //   const data = {
  //     test: "test",
  //     test2: "test2",
  //     test3: "test3"
  //   }
  //   this.firestoreService.addDatatoFirebase(collection(db, "test"), data).then((res) => {
  //     const collectionRef = (res._key.path.segments[0])
  //     const id = (res.id)
  //     console.log({ collectionRef, id })
  //     const docRef = doc(db, collectionRef, id);
  //     getDoc(docRef).then((doc) => {
  //       console.log({ ...doc.data(), id: doc.id })
  //     })
  //   }).catch((error) => {
  //     console.error(error)
  //   })
  // }
}
