var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ConferenceApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SchedulePage } from '../pages/schedule/schedule';
import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { SpeakerDetailPage } from '../pages/speaker-detail/speaker-detail';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';
import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    NgModule({
        declarations: [
            ConferenceApp,
            AboutPage,
            AccountPage,
            LoginPage,
            MapPage,
            PopoverPage,
            SchedulePage,
            ScheduleFilterPage,
            SessionDetailPage,
            SignupPage,
            SpeakerDetailPage,
            SpeakerListPage,
            TabsPage,
            TutorialPage,
            SupportPage
        ],
        imports: [
            IonicModule.forRoot(ConferenceApp)
        ],
        bootstrap: [IonicApp],
        entryComponents: [
            ConferenceApp,
            AboutPage,
            AccountPage,
            LoginPage,
            MapPage,
            PopoverPage,
            SchedulePage,
            ScheduleFilterPage,
            SessionDetailPage,
            SignupPage,
            SpeakerDetailPage,
            SpeakerListPage,
            TabsPage,
            TutorialPage,
            SupportPage
        ],
        providers: [ConferenceData, UserData, Storage]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map