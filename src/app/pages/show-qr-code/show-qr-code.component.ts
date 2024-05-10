import { group } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import * as QRCode from 'qrcode';
import { db } from 'src/app/services/firebase-config';
@Component({
  selector: 'app-show-qr-code',
  templateUrl: './show-qr-code.component.html',
  styleUrls: ['./show-qr-code.component.scss'],
})
export class ShowQrCodeComponent implements OnInit {
  @Input() site: any;
  group: any;
  constructor(
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    const querySnapshot = await getDocs(query(collection(db, "groups"), where("id", "==", this.site.group_id)))
    querySnapshot.forEach((doc) => {
      this.group = doc.data();
    });
    console.log(this.group);
    
    const qrCodeText = 'https://krungthon-air.web.app/booking/' + this.site.key;
    const qrcodeContainer = document.getElementById('qrcode-container');

    this.generateQRCode(qrCodeText)
      .then(qrCodeDataURL => {
        const img = document.createElement('img');
        img.src = qrCodeDataURL;
        img.width = 400;
        img.height = 400;
        img.style.border = '1px solid black';
        img.style.borderRadius = '10px';
        qrcodeContainer.appendChild(img);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    
  }

  async generateQRCode(text: string): Promise<string> {
    try {
      const qrCodeDataURL: string = await QRCode.toDataURL(text);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
