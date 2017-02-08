var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';
import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
var ConferenceApp = (function () {
    function ConferenceApp(events, userData, menu, platform, confData, storage) {
        var _this = this;
        this.events = events;
        this.userData = userData;
        this.menu = menu;
        this.platform = platform;
        this.confData = confData;
        this.storage = storage;
        // List of pages that can be navigated to from the left menu
        // the left menu only works after login
        // the login page disables the left menu
        this.appPages = [
            { title: '时间表', component: TabsPage, icon: 'calendar' },
            { title: '朋友圈', component: TabsPage, index: 1, icon: 'contacts' },
            { title: '地图', component: TabsPage, index: 2, icon: 'map' },
            { title: '关于', component: TabsPage, index: 3, icon: 'information-circle' }
        ];
        this.loggedInPages = [
            { title: '个人中心', component: AccountPage, icon: 'person' },
            { title: '支持', component: SupportPage, icon: 'help' },
            { title: '注销', component: TabsPage, icon: 'log-out', logsOut: true }
        ];
        this.loggedOutPages = [
            { title: '登录', component: LoginPage, icon: 'log-in' },
            { title: '支持', component: SupportPage, icon: 'help' },
            { title: '注册', component: SignupPage, icon: 'person-add' }
        ];
        // Check if the user has already seen the tutorial
        this.storage.get('hasSeenTutorial')
            .then(function (hasSeenTutorial) {
            if (hasSeenTutorial) {
                _this.rootPage = TabsPage;
            }
            else {
                _this.rootPage = TutorialPage;
            }
            _this.platformReady();
        });
        // load the conference data
        confData.load();
        // decide which menu items should be hidden by current login status stored in local storage
        this.userData.hasLoggedIn().then(function (hasLoggedIn) {
            _this.enableMenu(hasLoggedIn === true);
        });
        this.listenToLoginEvents(); /*启用登录监听函数*/
    }
    ConferenceApp.prototype.openPage = function (page) {
        var _this = this;
        // the nav component was found using @ViewChild(Nav)
        // reset the nav to remove previous pages and only have this page
        // we wouldn't want the back button to show in this scenario
        if (page.index) {
            this.nav.setRoot(page.component, { tabIndex: page.index });
        }
        else {
            this.nav.setRoot(page.component).catch(function () {
                console.log("Didn't set nav root");
            });
        }
        if (page.logsOut === true) {
            // Give the menu time to close before changing to logged out
            setTimeout(function () {
                _this.userData.logout();
            }, 1000);
        }
    };
    ConferenceApp.prototype.openTutorial = function () {
        this.nav.setRoot(TutorialPage);
    };
    ConferenceApp.prototype.listenToLoginEvents = function () {
        var _this = this;
        this.events.subscribe('user:login', function () {
            _this.enableMenu(true);
        });
        this.events.subscribe('user:signup', function () {
            _this.enableMenu(true);
        });
        this.events.subscribe('user:logout', function () {
            _this.enableMenu(false);
        });
    };
    ConferenceApp.prototype.enableMenu = function (loggedIn) {
        this.menu.enable(loggedIn, 'loggedInMenu'); /*this.menuCtrl.enable(true, 'authenticated'); 启用该id的menu*/
        this.menu.enable(!loggedIn, 'loggedOutMenu');
    };
    ConferenceApp.prototype.platformReady = function () {
        // Call any initial plugins when ready
        this.platform.ready().then(function () {
            Splashscreen.hide();
        });
    };
    return ConferenceApp;
}());
__decorate([
    ViewChild(Nav),
    __metadata("design:type", Nav)
], ConferenceApp.prototype, "nav", void 0);
ConferenceApp = __decorate([
    Component({
        templateUrl: 'app.template.html'
    }),
    __metadata("design:paramtypes", [Events,
        UserData,
        MenuController,
        Platform,
        ConferenceData,
        Storage])
], ConferenceApp);
export { ConferenceApp };
//# sourceMappingURL=app.component.js.map