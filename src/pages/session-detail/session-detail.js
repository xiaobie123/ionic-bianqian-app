var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
var SessionDetailPage = (function () {
    function SessionDetailPage(navParams) {
        this.navParams = navParams;
        this.session = navParams.data;
    }
    return SessionDetailPage;
}());
SessionDetailPage = __decorate([
    Component({
        selector: 'page-session-detail',
        templateUrl: 'session-detail.html'
    }),
    __metadata("design:paramtypes", [NavParams])
], SessionDetailPage);
export { SessionDetailPage };
//# sourceMappingURL=session-detail.js.map