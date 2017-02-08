import { Component } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { WriteDynamic } from './WriteDynamic';/*写说说动态*/
import { FridensCircledetail } from './fridensCircledetail';/*说说详情*/
import { ModalController ,NavController} from 'ionic-angular';
import { PhotoViewer,Dialogs } from 'ionic-native';
import { Geolocation } from 'ionic-native';
@Component({
  selector: 'page-FriendsCircle-list',
  templateUrl: 'FriendsCircle.html'
})
export class FriendsCircle {
  speakers = [];
  Friends =[];
  isLike =false;
  constructor(public confData: ConferenceData,
    public navCtrl: NavController,
    public modalCtrl: ModalController) {}

  ionViewDidLoad() {
    this.confData.getFriendsCirce().subscribe(
      friends =>{  
      this.Friends = friends
    });
  }
/*点赞*/
  clickLike(friend){
    if(friend.isLike){/**/
      return;
    }
   let id=friend.id;
   let Friends= this.Friends;
   Friends.map(friend=>{
     if(friend.id==id){
       friend.like+=1;
       friend.isLike=true;
     }
     return friend;
   })
  }
  clickComments(Friend){
    this.navCtrl.push(FridensCircledetail, Friend);
  }
  /*写动态*/
  WriteDynamic(){
    let contactModal = this.modalCtrl.create(WriteDynamic);
     contactModal.onDidDismiss(data => {
     console.log(data);
   });
    contactModal.present();
  }
  openImage(url){
    alert(url);
    /*PhotoViewer.show(url);*/
    Geolocation.getCurrentPosition().then((resp) => {
 alert(resp.coords.latitude);
  }).catch((error) => {
    console.log(error);
  });
  }
}
