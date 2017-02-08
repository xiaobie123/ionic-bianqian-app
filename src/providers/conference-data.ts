import { Injectable } from '@angular/core';

import { Http,Response } from '@angular/http';

import { UserData } from './user-data';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class ConferenceData {
  data: any;/*存放数据*/

  constructor(public http: Http, public user: UserData) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/data.json')
        .map(this.processData);
    }
  }

  processData(data) {
    //拿到所有数据
    this.data = data.json();

    this.data.tracks = [];/*新增一个分类*/

    // 遍历schedule数组
    this.data.schedule.forEach(day => {
      // 遍历groups
      day.groups.forEach(group => {
        // loop through each session in the timeline group
        group.sessions.forEach(session => {
          session.speakers = [];/*新增一个speakers 数组*/
          if (session.speakerNames) {/*如果有发言人*/
            session.speakerNames.forEach(speakerName => {/*find（fn） 返回满足fn的第一个元素*/
              let speaker = this.data.speakers.find(s => s.name === speakerName);/*返回匹配到的第一个人物数据*/
              if (speaker) {/*如果有speaker*/
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            });
          }

          if (session.tracks) {
            session.tracks.forEach(track => {
              if (this.data.tracks.indexOf(track) < 0) {
                this.data.tracks.push(track);/*如果没有的话添加一个分类*/
              }
            });
          }
        });
      });
    });

    return this.data;
  }
/*
 @dayIndex
 @queryText
 @excludeTracks
 @segment
 */
  getTimeline(dayIndex, queryText = '', excludeTracks = [], segment = 'all') {
    return this.load().map(data => {
      let day = data.schedule[dayIndex];/*拿到schedule数组的第0个*/
      day.shownSessions = 0;/*加一个变量*/

      queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');/*小写，把  ，\. - 替换成空格*/
      let queryWords = queryText.split(' ').filter(w => !!w.trim().length);/*分割为数组，并过滤空元素*/

      day.groups.forEach(group => {
        group.hide = true;/*加一个变量*/

        group.sessions.forEach(session => {/**/
          // check if this session should show or not
          this.filterSession(session, queryWords, excludeTracks, segment);

          if (!session.hide) {
            // if this session is not hidden then this group should show
            group.hide = false;
            day.shownSessions++;
          }
        });

      });

      return day;
    });
  }

  filterSession(session, queryWords, excludeTracks, segment) {

    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach(queryWord => {
        if (session.name.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }

    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    let matchesTracks = false;
    session.tracks.forEach(trackName => {
      if (excludeTracks.indexOf(trackName) === -1) {
        matchesTracks = true;
      }
    });

    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }

    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
  }

  getSpeakers() {/*上面在speak里面存了sessions*/
    return this.load().map(data => {
      return data.speakers.sort((a, b) => {
        let aName = a.name.split(' ').pop();
        let bName = b.name.split(' ').pop();
        return aName.localeCompare(bName);
      });
    });
  }

  getTracks() {
    return this.load().map(data => {
      return data.tracks.sort();
    });
  }

  getMap() {
    return this.load().map(data => {
      return data.map;
    });
  }

  getFriendsCirce (): any {
    return this.http.get('assets/data/friendsCircle.json')
                    .map((res: Response)=>{
                      let body = res.json();
                      return body.friendsdynamic || [];
                    })
  }

}
