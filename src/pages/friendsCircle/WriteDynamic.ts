import { Component,ViewChild } from '@angular/core';
import { ModalController, ViewController,NavController} from 'ionic-angular';

@Component({
  selector: 'page-writeDynamic-list',
  templateUrl: 'WriteDynamic.html'
})
export class WriteDynamic {
  @ViewChild("navber") navbar: any;
  submitted: boolean = false;
  back: boolean = false;
  supportMessage: string;
  constructor(public viewCtrl: ViewController,public navCtrl: NavController) {}

  ionViewDidLoad() {
    /*this.navbar.backButtonClick(this.viewCtrl.dismiss());*/
  }

  submit(form) {
    this.submitted = true;

    if (form.valid) {
      this.dismiss(this.supportMessage);
      this.supportMessage = '';
      this.submitted = false;

      /*let toast = this.toastCtrl.create({
        message: '你的动态已经发送完毕！',
        duration: 3000
      });
      toast.present();*/
    }
  }
  dismiss(data) {
   /*let data = { 'foo': 'bar' };*/
   this.viewCtrl.dismiss(data);
 }
}
