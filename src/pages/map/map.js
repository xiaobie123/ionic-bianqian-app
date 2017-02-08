var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform } from 'ionic-angular';
var MapPage = (function () {
    function MapPage(confData, platform) {
        this.confData = confData;
        this.platform = platform;
    }
    MapPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.confData.getMap().subscribe(function (mapData) {
            var mapEle = _this.mapElement.nativeElement; /*拿到原生dom元素，然后，开始干活*/
            var map = new BMap.Map(); // 创建地图实例  
            var point = new BMap.Point(116.404, 39.915); // 创建点坐标  
            map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别  
            /*let map = new google.maps.Map(mapEle, {
              center: mapData.find(d => d.center),
              zoom: 16
            });
    
            mapData.forEach(markerData => {
              let infoWindow = new google.maps.InfoWindow({
                content: `<h5>${markerData.name}</h5>`
              });
    
              let marker = new google.maps.Marker({
                position: markerData,
                map: map,
                title: markerData.name
              });
    
              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });
            });
    
            google.maps.event.addListenerOnce(map, 'idle', () => {
              mapEle.classList.add('show-map');
            });*/
        });
    };
    return MapPage;
}());
__decorate([
    ViewChild('mapCanvas'),
    __metadata("design:type", ElementRef)
], MapPage.prototype, "mapElement", void 0);
MapPage = __decorate([
    Component({
        selector: 'page-map',
        templateUrl: 'map.html'
    }),
    __metadata("design:paramtypes", [ConferenceData, Platform])
], MapPage);
export { MapPage };
//# sourceMappingURL=map.js.map