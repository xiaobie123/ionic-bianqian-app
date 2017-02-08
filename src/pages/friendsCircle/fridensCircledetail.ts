import { Component } from '@angular/core';

import { NavParams,AlertController } from 'ionic-angular';


@Component({
  selector: 'page-FridensCircledetail-detail',
  templateUrl: 'fridensCircledetail.html'
})
export class FridensCircledetail {
  Friend: any;

  constructor(public navParams: NavParams,
  		private alertCtrl: AlertController) {
    this.Friend = navParams.data;
  }
  commentAlert(name) {
  	let title=name ? `回复${name}`:"评论";
  let alert = this.alertCtrl.create({
    title: title,
    inputs: [
      {
        name: 'comment',
        placeholder: '你也来一句'
      }
    ],
    buttons: [
      {
        text: '取消',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: '提交',
        handler: data => {
          console.log(data);
        }
      }
    ]
  });
  alert.present();
}
  clickLike(Friend){

  }
  clickComments(Friend){

  }
}