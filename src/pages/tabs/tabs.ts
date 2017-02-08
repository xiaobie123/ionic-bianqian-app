import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';/*获取*/

import { AboutPage } from '../about/about';
import { MapPage } from '../map/map';
import { SchedulePage } from '../schedule/schedule';
import { SpeakerListPage } from '../speaker-list/speaker-list';
import { FriendsCircle } from '../friendsCircle/friendsCircle';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = SchedulePage;
  tab2Root: any = SpeakerListPage;
  tab3Root: any = MapPage;
  tab4Root: any = AboutPage;
  tab5Root: any = FriendsCircle;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {/*通过穿过来的参数选择tab 如：0，1，2。。。*/
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }

}
