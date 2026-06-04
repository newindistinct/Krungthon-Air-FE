import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { sendOTPverify, sendOTPverifyFail, InvalidOTP, NoUserData } from 'src/app/common/constant/alert-messages';
import { auth } from 'src/app/services/firebase-config';
import { AppUserService } from 'src/app/services/app-user.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  formPhone!: FormGroup;
  formOTP!: FormGroup;
  has_user = false;
  confirmationResult: any;

  constructor(
    private appUserService: AppUserService,
    private service: ServiceService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.formPhone = this.formBuilder.group({ phone: ['', Validators.required] });
    this.formOTP = this.formBuilder.group({ otp: ['', Validators.required] });
  }

  submitPhone() {
    this.LoginWithPhone(this.formPhone.value.phone);
  }

  submitOTP() {
    this.confirmOTP(this.formOTP.value.otp);
  }

  LoginWithPhone(phone: string) {
    this.service.presentLoadingWithOutTime('waiting...');
    this.appUserService.checkUserOnSite(phone).then((data) => {
      this.service.dismissLoading();
      if (data.length > 0) {
        const { header, message } = sendOTPverify(phone);
        this.service.showAlert(header, message, () => {
          this.signInWithPhoneNumber(phone);
        }, { confirmOnly: false });
      } else {
        const { header, message } = NoUserData();
        this.service.showAlert(header, message, () => {}, { confirmOnly: true });
      }
    });
  }

  async signInWithPhoneNumber(phone: string) {
    this.service.presentLoadingWithOutTime('waiting...');
    const verifier = new RecaptchaVerifier(auth, 'sign-in-button', {
      size: 'invisible',
      callback: () => { this.onSignInSubmit(); },
    });
    const tel = '+66' + phone.replace(/\D[^.]/g, '').slice(1);
    signInWithPhoneNumber(auth, tel, verifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        this.has_user = true;
        this.service.dismissLoading();
      })
      .catch(() => {
        const { header, message } = sendOTPverifyFail();
        this.service.showAlert(header, message, () => {}, { confirmOnly: true });
        this.service.dismissLoading();
      });
  }

  onSignInSubmit() {}

  confirmOTP(otp: string) {
    this.service.presentLoadingWithOutTime('waiting...');
    this.confirmationResult.confirm(otp)
      .then(async (result: any) => {
        localStorage.setItem('token', result.user.accessToken);
        window.location.reload();
        this.service.dismissLoading();
      })
      .catch(() => {
        this.service.dismissLoading();
        const { header, message } = InvalidOTP();
        this.service.showAlert(header, message, () => {}, { confirmOnly: true });
      });
  }
}
