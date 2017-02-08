import { Component, ViewChild, ElementRef } from '@angular/core';

import { ConferenceData } from '../../providers/conference-data';
import { Dialogs } from 'ionic-native';
import { Platform } from 'ionic-angular';


/*declare var google: any;*//*意思是先把这个变量拿过来*/
declare var BMap: any;
declare let baidu_location:any;
declare let window: any;
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('mapCanvas') mapElement: ElementRef;/*通过模版变量注入，但类型是元素类型*/
  constructor(public confData: ConferenceData, public platform: Platform) {
     this.platform.ready().then((readySource) => {
      this.locate();
      // Platform now ready, execute any required native code
    });
  }

  ionViewDidLoad() {
      //this.baidumap();
      this.confData.getMap().subscribe(mapData => {
        /*let mapEle = this.mapElement.nativeElement;*//*拿到原生dom元素，然后，开始干活*/
      });

  }
  locate(){
        baidu_location.getCurrentPosition((data)=>{
        alert(data);
        let map = new BMap.Map("map_canvas");          // 创建地图实例  
        let point = new BMap.Point(data.lontitude,data.latitude);
        map.centerAndZoom(point, 11);  // 初始化地图,设置中心点坐标和地图级别
        var marker = new BMap.Marker(point);// 创建标注
        map.addOverlay(marker);             // 将标注添加到地图中
        marker.disableDragging();           // 不可拖拽
        map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    },(err)=>{
      alert("错误："+err)
    });
  }

}
