/*!
 * jmessage-sdk-web.js
 * http://docs.jiguang.cn/client/im_sdk_js/
 * Version: 1.1.0
 *
 * Copyright 2016 jiguang
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JIM = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : self; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    var str = String(input).replace(/=+$/, '');
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],2:[function(require,module,exports){
"use strict";

var md5 = require(4)();
var Base64 = require(1);
module.exports = function() {
  var JIM = function() {
    this.version = '1.0.0';
  };
  var mediaUrl = 'http://media.file.jpush.cn/';
  var address, from_appkey, debug, timeout, transport, logLevel, $client;
  var ridSeq = 1;
  // 未收到ACK确认的消息,会暂存在dataCache里
  var dataCache = {};
  // 完全存储在内容中的临时数据，关闭浏览器后小时
  var memStore = {};
  var p = JIM.prototype;
  p.events = {
    ACK: 'ack',
    INIT: 'c_init',
    LOGIN: 'login',
    LOGOUT: 'logout', // TODO 尚未实现
    GET_USER_INFO: 'get_user_info',
    GET_ACROSS_USER_INFO: 'get_across_user_info',
    S_SINGLE_TEXT: 's_single_text',
    S_ACROSS_SINGLE_TEXT: 's_across_single_text',
    MSG_SYNC: 'msg_sync',
    MSG_RECV: 'msg_recv',
    SEND_GROUP_MSG: 'send_group_msg',
    CREATE_GROUP: 'create_group',
    GET_GROUPS_LIST: 'get_groups_list',
    GET_GROUP_INFO: 'get_group_info',
    ADD_GROUP_MEMBER: 'add_group_member',
    ADD_ACROSS_GROUP_MEMBER: 'add_across_group_member',
    DEL_GROUP_MEMBER: 'del_group_member',
    DEL_ACROSS_GROUP_MEMBER: 'del_across_group_member',
    GET_GROUP_MEMBERS: 'get_group_members',
    UPDATE_GROUP_INFO: 'update_group_info',
    EXIT_GROUP: 'exit_group',
    EVENT_NOTIFICATION: 'event_notification',
    GET_CONVERSATIONS: 'get_conversations',
    GET_UPLOAD_TOKEN: 'get_upload_token',
    NO_DISTURB: 'no_disturb',
    ADD_MSG_NO_DISTURB_SINGLE: 'add_msg_no_disturb_single',
    DELETE_MSG_NO_DISTURB_SINGLE: 'delete_msg_no_disturb_single',
    ADD_MSG_NO_DISTURB_GROUP: 'add_msg_no_disturb_group',
    DELETE_MSG_NO_DISTURB_GROUP: 'delete_msg_no_disturb_group',
    ADD_MSG_NO_DISTURB_GLOBAL: 'add_msg_no_disturb_global',
    DELETE_MSG_NO_DISTURB_GLOBAL: 'delete_msg_no_disturb_global',
    DISCONNECT: 'disconnect',
    GET_BLACK_LIST: 'get_black_list',
    ADD_BLACK_LIST: 'add_black_list',
    DEL_BLACK_LIST: 'del_black_list',
    REGISTER: 'register'
  };


  /** 业务方法 start **/
  // 初始化
  p.init = function(opt) {
    var _opt = opt ? opt : {};

    transport = window.WebSocket ? ['websocket'] : ['polling'];
    debug = _opt.debug ? _opt.debug : false;
    address = _opt.address ? _opt.address : "wss://ws.im.jpush.cn";
    logLevel = _opt.debug ? 3 : 0;
    timeout = _opt.timeout ? _opt.timeout : 30000;

    debug && console.log("transport with:" + transport);
  };

  //  注册
  p.register = function(username, password, auth_platform, $resp, $ack, $timeout, is_md5) {
    if (!transport || !address || !timeout) {
      return console.error('必须先执行JIM.init()才可以进行JIM.register()操作');
    }
    var self = this;
    debug && console.log('connect to ' + address);
    $client = io(address, {
      'transports': transport,
      'reconnection': true,
      'autoConnect': true,
      'force new connection': true,
      'reconnectionDelay': 500,
      'reconnectionDelayMax': 1000,
      'timeout': timeout,
      'max reconnection attempts': 1,
      'log level': logLevel
    });

    // 进行事件监听初始化
    initEventHandler(this, $client);

    // 进行init操作
    self.emitWithResp(self.events.INIT, auth_platform, function(data) {
      if (data && data.code == 0) {
        self.emitWithResp(self.events.REGISTER, {
          'username' : username,
          'password' : is_md5 ? password : md5(password)
        }, function(data) {
            $resp && $resp(data);
        }, $ack, $timeout);
      } else {
        // init失败
        debug && console.log('init fail : ' + JSON.stringify(data));
        $resp && $resp(data);
      }
    }, null, $timeout);

    //进行消息监听
    if($client) {
      self.onMsgReceive($resp);
    }
  }

  // 登录
  p.login = function(username, password, auth_platform, $resp, $ack, $timeout, is_md5) {
    console.log('log');
    if (!transport || !address || !timeout) {
      return console.error('必须先执行JIM.init()才可以进行JIM.login()操作');
    }
    var self = this;
    from_appkey = auth_platform.appkey;
    debug && console.log('connect to ' + address);
    $client = io(address, {
      'transports': transport,
      'reconnection': true,
      'autoConnect': true,
      'force new connection': true,
      'reconnectionDelay': 500,
      'reconnectionDelayMax': 1000,
      'timeout': timeout,
      'max reconnection attempts': 1,
      'log level': logLevel
    });

    // 进行事件监听初始化
    initEventHandler(this, $client);

    // 进行init操作
    self.emitWithResp(self.events.INIT, auth_platform, function(data) {
      if (data && data.code == 0) {
        self.emitWithResp(self.events.LOGIN, {
          'username' : username,
          'password' : is_md5 ? password : md5(password)
        }, function(data) {
          if (data && data.username) {
            memStore['state'] = 'online';
            memStore['username'] = data.username;
            $resp && $resp(data);
          } else if(data) {
            $resp && resp(data);
          }
        }, $ack, $timeout);
      } else {
        // init失败
        debug && console.log('init fail : ' + JSON.stringify(data));
        $resp && $resp(data);
      }
    }, null, $timeout);
    //进行消息监听
    if($client) {
      self.onMsgReceive($resp);
    }
  };

  // 获取用户信息
  p.getUserInfo = function(username, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_USER_INFO, {
      "key" : username
    }, $resp, $ack, $timeout);
  };
  // 获取跨应用用户信息
  p.getAcrossUserInfo = function(username, appkey, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_ACROSS_USER_INFO, {
      "key" : username,
      "appkey": appkey
    }, $resp, $ack, $timeout);
  };

  // 发送单聊消息
  p.sendSingleMsg = function(target_username, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('single')
        .setTarget(target_username)
        .setText(content)
        .send($resp, $ack, $timeout);
  };
  // 发送跨应用单聊消息
  p.sendAcrossSingleMsg = function(target_username, appkey, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('across_single')
    .setTarget(target_username)
    .setAppkey(appkey)
    .setText(content)
    .send($resp, $ack, $timeout);
  };

  //获取上传图片token
  p.getUploadToken = function($resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_UPLOAD_TOKEN, {}, $resp, $ack, $timeout);
  };

  //上传图片
  p.uploadImg = function(args) {
    var self = this;
    var adAppkey = from_appkey;
    if(args.appkey) {
      adAppkey = args.appkey;
    }

    self.getUploadToken(function(data) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://sdk.im.jpush.cn/resource?type=image');
      xhr.setRequestHeader('X-App-Key', from_appkey);
      xhr.setRequestHeader('Authorization', 'Basic ' + Base64.btoa(memStore['username'] + ':' + data.uptoken));
      xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
          console.log(this.responseText);
          //判断是否上传成功 ? 发送图片消息 : 异常
          var content = JSON.parse(this.responseText);
          if(args.type == 'single') {
            p.sendSinglePic(args.target_username, adAppkey, content, args.resp, args.ack, args.timeout);
          } else {
            p.sendGroupPic(args.target_gid, content, args.resp, args.ack, args.timeout);
          }
        }
      };
      xhr.send(args.fd);
    });


  };

  //发送单聊图片信息
  p.sendSinglePic = function(target_username, appkey, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('across_single')
        .setTarget(target_username)
        .setAppkey(appkey)
        .setImage(content)
        .send($resp, $ack, $timeout);
  };

  //发送群聊图片信息
  p.sendGroupPic = function(target_gid, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('group')
        .setTarget(target_gid)
        .setImage(content)
        .send($resp, $ack, $timeout);
  };

  // 发送群聊消息
  p.sendGroupMsg = function(target_gid, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('group')
        .setTarget(target_gid)
        .setText(content)
        .send($resp, $ack, $timeout);
  };

  //发送群聊图片信息
  p.sendSinglePic = function(target_username, appkey, content, $resp, $ack, $timeout) {
    new MsgContentBuilder(this).setType('across_single')
        .setTarget(target_username)
        .setAppkey(appkey)
        .setImage(content)
        .send($resp, $ack, $timeout);
  };

  // 发送单聊消息
  p.createMsgBuilder = function() {
    return new MsgContentBuilder(this);
  };

  // 创建群组
  p.createGroup = function(group_name, group_description, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.CREATE_GROUP, {
      "group_name" : group_name,
      "group_description" : group_description
    }, $resp, $ack, $timeout);
  };

  // 获取群组列表
  p.getGroupList = function($resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_GROUPS_LIST, {}, $resp, $ack, $timeout);
  };

  // 获取群组信息
  p.getGroupInfo = function(gid, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_GROUP_INFO, {
      "gid" : gid.toString()
    }, $resp, $ack, $timeout);
  };

  // 增加群组成员
  p.addGroupMember = function(gid, username_list, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.ADD_GROUP_MEMBER, {
      "gid" : gid.toString(),
      "member_usernames" : username_list
    }, $resp, $ack, $timeout);
  };

  // 增加跨应用群组成员
  p.addAcrossGroupMember = function(gid, username_list, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.ADD_ACROSS_GROUP_MEMBER, {
      "gid" : gid.toString(),
      "member_usernames" : username_list
    }, $resp, $ack, $timeout);
  };

  // 删除群组成员
  p.delGroupMember = function(gid, username_list, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.DEL_GROUP_MEMBER, {
      "gid" : gid.toString(),
      "member_usernames" : username_list
    }, $resp, $ack, $timeout);
  };

  // 删除跨应用群组成员
  p.delAcrossGroupMember = function(gid, username_list, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.DEL_ACROSS_GROUP_MEMBER, {
      "gid" : gid.toString(),
      "member_usernames" : username_list
    }, $resp, $ack, $timeout);
  };

  // 获取群组成员
  p.getGroupMembers = function(gid, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_GROUP_MEMBERS, {
      "gid" : gid.toString()
    }, $resp, $ack, $timeout);
  };

  // 更新群组信息
  p.updateGroupInfo = function(gid, group_name, group_description, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.UPDATE_GROUP_INFO, {
      "gid" : gid.toString(),
      "group_name" : group_name,
      "group_description" : group_description
    }, $resp, $ack, $timeout);
  };

  // 退出群组
  p.exitGroup = function(gid, $resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.EXIT_GROUP, {
      "gid" : gid.toString()
    }, $resp, $ack, $timeout);
  };

  // 获取会话列表
  p.getConversations = function($resp, $ack, $timeout) {
    var self = this;
    self.emitWithResp(self.events.GET_CONVERSATIONS, {}, $resp, $ack, $timeout);
  };

  //  获取免打扰列表
  p.getNoDisturb = function($resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.NO_DISTURB, {
       version: 0
     }, $resp, $ack, $timeout);
  }

  //  添加单聊免打扰
  p.addSingleNoDisturb = function(target_name, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.ADD_MSG_NO_DISTURB_SINGLE, {
       version: 0,
       target_name: target_name
     }, $resp, $ack, $timeout);
  }

  //  删除单聊免打扰
  p.deleteSingleNoDisturb = function(target_name, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.DELETE_MSG_NO_DISTURB_SINGLE, {
       version: 0,
       target_name: target_name
     }, $resp, $ack, $timeout);
  }

  //  添加群聊免打扰
  p.addGroupNoDisturb = function(gid, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.ADD_MSG_NO_DISTURB_GROUP, {
       version: 0,
       gid: gid.toString()
     }, $resp, $ack, $timeout);
  }

  //  删除群聊免打扰
  p.deleteGroupNoDisturb = function(gid, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.DELETE_MSG_NO_DISTURB_GROUP, {
       version: 0,
       gid: gid.toString()
     }, $resp, $ack, $timeout);
  }

  //  添加全局免打扰
  p.addGlobalNoDisturb = function($resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.ADD_MSG_NO_DISTURB_GLOBAL , {
       version: 0,
       none: ''
     }, $resp, $ack, $timeout);
  }

  //  删除全局免打扰
  p.deleteGlobalNoDisturb = function($resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.DELETE_MSG_NO_DISTURB_GLOBAL, {
       version: 0,
       none: ''
     }, $resp, $ack, $timeout);
  }

  //  获取黑名单
  p.getBlackList = function($resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.GET_BLACK_LIST, {}, $resp, $ack, $timeout);
  }

  //  添加黑名单
  p.addBlackList = function(member_list, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.ADD_BLACK_LIST, {
       'member_usernames': member_list
     }, $resp, $ack, $timeout);
  }

  //  删除黑名单
  p.delBlackList = function(member_list, $resp, $ack, $timeout) {
     var self = this;
     self.emitWithResp(self.events.DEL_BLACK_LIST, {
       'member_usernames': member_list
     }, $resp, $ack, $timeout);
  }

  // 登出操作
  p.loginOut = function() {
    if (!$client) {
      return console.error("必须执行login操作成功后才能执行此动作");
    }
    var self = this;
    self.disconnect();
  };

  // TODO 实现以下方法
  // TODO p.getGroupListWithGroupInfo() 获取群组成员的同时，将群组信息也获取
  // TODO p.getGroupMembersWithUserInfo() 获取群组成员的同时，将群组的个人信息也获取
  // TODO p.getConversationsDetail() 获取最近会话列表的时候，将会话列表中的群组信息与个人信息也获取

  /** 业务方法 end **/


  /** 事件监管理方法 start **/

  // 聊天消息接收事件
  p.onMsgReceive = function(callback) {
    var self = this;
    self.on(self.events.MSG_SYNC, function(data) {
      debug && console.log('消息同步:' + JSON.stringify(data));
      //处理接收到的消息（包含文本，图片，语音和文件）,重新包装消息体给开发者使用
      data.messages.forEach(function(item) {
        var packDataItem = {};
        packDataItem.target_type = item.content.target_type;
        packDataItem.target_name = item.content.target_name;
        packDataItem.target_id = item.content.target_id;
        packDataItem.from_name = item.content.from_name;
        packDataItem.from_id = item.content.from_id;
        packDataItem.from_platform = item.content.from_platform;
        packDataItem.create_time = item.ctime_ms;
        packDataItem.msg_type = item.content.msg_type;
        packDataItem.msg_body = item.content.msg_body;
        if (packDataItem.msg_body.isFileUploaded) {
          delete packDataItem.msg_body.isFileUploaded;
        }
        if (item.content.msg_type == 'image') {
          packDataItem.msg_body['media_url'] = mediaUrl + item.content.msg_body['media_id'];
        } else if (item.content.msg_type == 'voice') {
          packDataItem.msg_body['media_url'] = mediaUrl + item.content.msg_body['media_id'] + '.mp3';
        }
        if(item.msg_level === 0) {
          packDataItem.msg_level = 'normal';
        } else if(item.msg_level === 1) {
          packDataItem.msg_level = 'across';
          packDataItem.target_appkey = item.content.target_appkey;
          packDataItem.from_appkey = item.content.from_appkey;
        }
        callback && callback(packDataItem);
      });

      // 客户端接收到消息同步事件后，需要将消息原封不动的回复以表示已经收到该消息，服务端不再做下发重试
      var msgRecv = [];
      Array.prototype.push.apply(msgRecv, data.messages.map(function (item) {
        return {
          msg_id: item.msg_id,
          msg_type: item.msg_type,
          from_uid: item.from_uid,
          from_gid: item.from_gid
        };
      }));
      self.emitWithCallback(self.events.MSG_RECV, {
        messages: msgRecv
      });
    });
  };

  // WebSocket断开连接事件
  p.onDisconnect = function(callback) {
    // TODO 确认socket.io的disconnect事件是如何响应的, 服务端不会发出此事件
  };

  // TODO 事件消息同步，包好多种多样的业务事件，我们需要对这些事件进行分发
  // TODO 分发此业务事件，对开发者隐藏细节
  // 业务事件接收事件
  p.onEvent = function(callback) {
    var self = this;
    self.on(self.events.EVENT_NOTIFICATION, function(data) {
      debug && console.log('事件同步 : ' + JSON.stringify(data));
      callback && callback(data);
      // 客户端收到EVENT_NOTIFICATION后，需要将数据原封不动的回复以表示已经收到该消息，服务端不再做下发重试
      self.emitWithCallback(self.events.EVENT_NOTIFICATION, {
        event_id: data.event_id,
        event_type: data.event_type,
        from_uid: data.from_uid,
        gid: data.gid
      });
    });
  };
  /** 事件监管理方法 end **/



  /** 私有方法 start **/
  // 初始化事件监听处理
  function initEventHandler(self, client) {
    // 处理ACK事件
    // 1. 清除超时callback
    // 2. 回调ack_callback
    // 3. 如果无resp_callback,则删除
    client.on(self.events.ACK, function (data) {
      debug && console.log('ack:' + JSON.stringify(data));
      var $ack_callback;
      var $resp_callback;
      if (dataCache[data.rid]) {
        clearTimeout(dataCache[data.rid]['time_out_task']);
        $ack_callback = dataCache[data.rid]['ack_callback'];
        $resp_callback = dataCache[data.rid]['resp_callback'];
      }
      $ack_callback && $ack_callback(data);
      // 如果没有resp_callback，则删除对应回调请求
      // 此处存在服务端异常导致resp_callback失败，客户端会一直维持着resp_callback回调从而造成泄露
      !$resp_callback && delete dataCache[data.rid];
    });

    // 默认事件处理逻辑
    //for (var p in self.events) {
      //client.on(self.events[p], function(data) {
        //defaultEventHandler(self.events[p], data);
      //});
    //}
    client.on(self.events.INIT, function(data) {
      defaultEventHandler(self.events.INIT, data);
    });
    client.on(self.events.REGISTER, function(data) {
      defaultEventHandler(self.events.REGISTER, data);
    });
    client.on(self.events.LOGIN, function(data) {
      defaultEventHandler(self.events.LOGIN, data);
    });
    client.on(self.events.GET_USER_INFO, function(data) {
      defaultEventHandler(self.events.GET_USER_INFO, data);
    });
    client.on(self.events.GET_ACROSS_USER_INFO, function(data) {
      defaultEventHandler(self.events.GET_ACROSS_USER_INFO, data);
    });
    client.on(self.events.S_SINGLE_TEXT, function(data) {
      defaultEventHandler(self.events.S_SINGLE_TEXT, data);
    });
    client.on(self.events.S_ACROSS_SINGLE_TEXT, function(data) {
      defaultEventHandler(self.events.S_ACROSS_SINGLE_TEXT, data);
    });
    client.on(self.events.SEND_GROUP_MSG, function(data) {
      defaultEventHandler(self.events.SEND_GROUP_MSG, data);
    });
    client.on(self.events.CREATE_GROUP, function(data) {
      defaultEventHandler(self.events.CREATE_GROUP, data);
    });
    client.on(self.events.GET_GROUPS_LIST, function(data) {
      defaultEventHandler(self.events.GET_GROUPS_LIST, data);
    });
    client.on(self.events.GET_GROUP_INFO, function(data) {
      defaultEventHandler(self.events.GET_GROUP_INFO, data);
    });
    client.on(self.events.ADD_GROUP_MEMBER, function(data) {
      defaultEventHandler(self.events.ADD_GROUP_MEMBER, data);
    });
    client.on(self.events.ADD_ACROSS_GROUP_MEMBER, function(data) {
      defaultEventHandler(self.events.ADD_ACROSS_GROUP_MEMBER, data);
    });
    client.on(self.events.DEL_GROUP_MEMBER, function(data) {
      defaultEventHandler(self.events.DEL_GROUP_MEMBER, data);
    });
    client.on(self.events.DEL_ACROSS_GROUP_MEMBER, function(data) {
      defaultEventHandler(self.events.DEL_ACROSS_GROUP_MEMBER, data);
    });
    client.on(self.events.GET_GROUP_MEMBERS, function(data) {
      defaultEventHandler(self.events.GET_GROUP_MEMBERS, data);
    });
    client.on(self.events.UPDATE_GROUP_INFO, function(data) {
      defaultEventHandler(self.events.UPDATE_GROUP_INFO, data);
    });
    client.on(self.events.EXIT_GROUP, function(data) {
      defaultEventHandler(self.events.EXIT_GROUP, data);
    });
    client.on(self.events.GET_CONVERSATIONS, function(data) {
      defaultEventHandler(self.events.GET_CONVERSATIONS, data);
    });
    client.on(self.events.NO_DISTURB, function(data) {
      defaultEventHandler(self.events.NO_DISTURB, data);
    });
    client.on(self.events.ADD_MSG_NO_DISTURB_SINGLE, function(data) {
      defaultEventHandler(self.events.ADD_MSG_NO_DISTURB_SINGLE, data);
    });
    client.on(self.events.DELETE_MSG_NO_DISTURB_SINGLE, function(data) {
      defaultEventHandler(self.events.DELETE_MSG_NO_DISTURB_SINGLE, data);
    });
    client.on(self.events.ADD_MSG_NO_DISTURB_GROUP, function(data) {
      defaultEventHandler(self.events.ADD_MSG_NO_DISTURB_GROUP, data);
    });
    client.on(self.events.DELETE_MSG_NO_DISTURB_GROUP, function(data) {
      defaultEventHandler(self.events.DELETE_MSG_NO_DISTURB_GROUP, data);
    });
    client.on(self.events.ADD_MSG_NO_DISTURB_GLOBAL, function(data) {
      defaultEventHandler(self.events.ADD_MSG_NO_DISTURB_GLOBAL, data);
    });
    client.on(self.events.DELETE_MSG_NO_DISTURB_GLOBAL, function(data) {
      defaultEventHandler(self.events.DELETE_MSG_NO_DISTURB_GLOBAL, data);
    });
    client.on(self.events.GET_UPLOAD_TOKEN, function(data) {
      defaultEventHandler(self.events.GET_UPLOAD_TOKEN, data);
    });
    client.on(self.events.GET_BLACK_LIST, function(data) {
      defaultEventHandler(self.events.GET_BLACK_LIST, data);
    });
    client.on(self.events.ADD_BLACK_LIST, function(data) {
      defaultEventHandler(self.events.ADD_BLACK_LIST, data);
    });
    client.on(self.events.DEL_BLACK_LIST, function(data) {
      defaultEventHandler(self.events.DEL_BLACK_LIST, data);
    });
    client.on(self.events.REGISTER, function(data) {
      defaultEventHandler(self.events.REGISTER, data);
    });
  }

  // 默认事件处理handler
  function defaultEventHandler(event, data) {
    debug && console.log(event + ':' + JSON.stringify(data));
    var $resp_callback;
    if (data.rid && dataCache[data.rid]) {
      $resp_callback = dataCache[data.rid]['resp_callback'];
      $resp_callback && $resp_callback(data);
      delete dataCache[data.rid];
    }
  }

  /**
   * 发送事件消息
   * @param event 事件名
   * @param data 发送数据
   * @param $response 处理数据返回的callback
   * @param $ack 处理ACK返回的callback
   * @param $timeout 处理请求超时的callback
   * @returns 添加rid后的数据.
   */
  p.emitWithResp = function(event, data, $response, $ack, $timeout) {
    if (!$client) {
      return console.error("必须执行login操作后能执行此动作");
    }
    data.rid = ridSeq++;

    $client.emit(event, data);
    var timeOutTask = setTimeout(function () {
      $timeout && $timeout(data);
      delete dataCache[data.rid];
    }, timeout);

    dataCache[data.rid] = {
      'data': data,
      'time_out_task': timeOutTask,
      'ack_callback': $ack,
      'resp_callback': $response
    };
    return data;
  };

  /**
   * 发送事件消息并不进行任何消息回调处理
   * @param event 事件名
   * @param data 发送数据
   */
  p.emitWithCallback = function(event, data) {
    if (!$client) {
      return console.error("必须执行login操作成功后才能执行此动作");
    }
    data.rid = ridSeq++;
    $client.emit(event, data);
  };


  p.on = function() {
    if (!$client) {
      return console.error("必须执行login操作成功后才能进行此事件监听");
    }
    $client.on.apply($client, arguments);
  };
  /** 私有方法 end **/


  /** Builder **/
  function MsgContentBuilder(client) {
    this.client = client;
    this.version =1;
    this.from_platform = 'web';
    this.from_appkey = from_appkey;
  }

  MsgContentBuilder.prototype.setType = function(type) {
    this.type = type;
    return this;
  };

  MsgContentBuilder.prototype.setAppkey = function(appkey) {
    this.appkey = appkey;
    return this;
  };

  MsgContentBuilder.prototype.setTarget = function(target, target_name) {
    this.target_id = target.toString();
    this.target_name = target_name;
    return this;
  };

  MsgContentBuilder.prototype.setFromName = function(from_name) {
    this.from_name = from_name;
    return this;
  };

  MsgContentBuilder.prototype.setText = function(content, extras) {
    this.msg_type = 'text';
    this.msg_body = {
      'text' : content,
      'extras' : extras
    };
    return this;
  };

  // 暂时不提供
  //MsgContentBuilder.prototype.setVoice = function(media_id, media_crc32, duration, format, fsize, extras) {
  //  this.msg_type = 'voice';
  //  this.msg_body = {
  //    'media_id' : media_id,
  //    'media_crc32' : media_crc32,
  //    'duration' : duration,
  //    'format' : format,
  //    'fsize' : fsize,
  //    'extras' : extras
  //  };
  //  return this;
  //};

  MsgContentBuilder.prototype.setImage = function(imgObj) {
    this.msg_type = 'image';
    this.msg_body = {
      'media_id' : imgObj.media_id,
      'media_crc32' : imgObj.media_crc32,
      'width' : imgObj.width,
      'height' : imgObj.height,
      'format' : imgObj.format,
      'fsize' : imgObj.fsize
    };
    return this;
  };

  MsgContentBuilder.prototype.setCustom = function(custom) {
    this.msg_type = 'custom';
    this.msg_body = custom;
    return this;
  };

  MsgContentBuilder.prototype.build = function() {
    var username = memStore['username'];

    // validate
    if (!username) return console.error('必须执行login操作后能执行此动作');
    if (this.type != 'single' && this.type != 'group' && this.type != 'across_single') return console.log('消息类型必须是single或group');
    if(!this.target_id) return console.error('target_id不能为空');
    if (this.msg_type == 'text') {
      if (!this.msg_body['text']) return console.error('未设置文本消息内容');
    } else if (this.msg_type == 'custom') {
      if (!this.msg_body) return console.error('custom对象不能为空');
    } else if (this.msg_type == 'voice') {
      if (!this.msg_body['media_id']) return console.error('未设置voice消息media_id字段');
      //if (!this.msg_body['media_crc32']) return console.error('未设置voice消息media_crc32字段');
      if (!this.msg_body['duration']) return console.error('未设置voice消息duration字段');
      if (!this.msg_body['format']) return console.error('未设置voice消息format字段');
      if (!this.msg_body['fsize']) return console.error('未设置voice消息fsize字段');
    } else if (this.msg_type == 'image') {
      if (!this.msg_body['media_id']) return console.error('未设置image消息media_id字段');
      //if (!this.msg_body['media_crc32']) return console.error('未设置image消息media_crc32字段');
      if (!this.msg_body['width']) return console.error('未设置image消息width字段');
      if (!this.msg_body['height']) return console.error('未设置image消息height字段');
    } else {
      return console.error('请指定消息类型');
    }

    // build return payload
    var buildResult = {
      'version' : this.version,
      'target_type' : this.type,
      'from_platform' : this.from_platform,
      'target_id' : this.target_id,
      'target_name' : this.target_name,
      'from_id' : username,
      'from_name' : this.from_name,
      'create_time' : new Date().getTime(),
      'msg_type' : this.msg_type,
      'msg_body' : this.msg_body
    };
    if(this.appkey) {
      buildResult['target_appkey'] = this.appkey;
      buildResult['from_appkey'] = this.from_appkey;
    }
    return buildResult;
  };

  MsgContentBuilder.prototype.send = function($resp, $ack, $timeout) {
    var content = this.build();
    if (content) {
      var event;
      var payload;
      if(content['target_type'] == 'single') {
        event =this.client.events.S_SINGLE_TEXT;
        payload = {'target_name': content['target_id']};
      } else if(content['target_type'] == 'across_single') {
        event = this.client.events.S_ACROSS_SINGLE_TEXT;
        content['target_type'] = 'sigle';
        payload = {'target_name': content['target_id'], 'appkey': content['target_appkey']};
      } else {
        event = this.client.events.SEND_GROUP_MSG;
        payload = {'target_gid': content['target_id']};
      }
      debug && console.log(JSON.stringify(content));
      payload['content'] = content;
      this.client.emitWithResp(event, payload, $resp, $ack, $timeout);
    }
  };

  return JIM;
}

},{"1":1,"4":4}],3:[function(require,module,exports){
/*
 * @namespace JIM
 */

var JIM = require(2)();

window.JIM = module.exports = new JIM();

},{"2":2}],4:[function(require,module,exports){
"use strict";

module.exports = function() {
  function safe_add (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF)
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }
  function bit_rol (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5_cmn (q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
  }
  function md5_ff (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
  }
  function md5_gg (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
  }
  function md5_hh (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5_ii (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
  }
  function binl_md5 (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    var i
    var olda
    var oldb
    var oldc
    var oldd
    var a = 1732584193
    var b = -271733879
    var c = -1732584194
    var d = 271733878

    for (i = 0; i < x.length; i += 16) {
      olda = a
      oldb = b
      oldc = c
      oldd = d

      a = md5_ff(a, b, c, d, x[i], 7, -680876936)
      d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
      a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
      d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
      c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
      b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
      a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
      d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
      c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
      b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
      a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
      d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
      c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
      b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

      a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
      d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
      c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
      b = md5_gg(b, c, d, a, x[i], 20, -373897302)
      a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
      d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
      c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
      b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
      a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
      d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
      c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
      b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
      a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
      d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
      c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
      b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

      a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
      d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
      c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
      b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
      a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
      d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
      c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
      b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
      a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
      d = md5_hh(d, a, b, c, x[i], 11, -358537222)
      c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
      b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
      a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
      d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
      c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
      b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

      a = md5_ii(a, b, c, d, x[i], 6, -198630844)
      d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
      c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
      b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
      a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
      d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
      c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
      b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
      a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
      d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
      c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
      b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
      a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
      d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
      c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
      b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

      a = safe_add(a, olda)
      b = safe_add(b, oldb)
      c = safe_add(c, oldc)
      d = safe_add(d, oldd)
    }
    return [a, b, c, d]
  }

  function binl2rstr (input) {
    var i
    var output = ''
    for (i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
    }
    return output
  }

  function rstr2binl (input) {
    var i
    var output = []
    output[(input.length >> 2) - 1] = undefined
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0
    }
    for (i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
    }
    return output
  }

  function rstr_md5 (s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
  }

  function rstr_hmac_md5 (key, data) {
    var i
    var bkey = rstr2binl(key)
    var ipad = []
    var opad = []
    var hash
    ipad[15] = opad[15] = undefined
    if (bkey.length > 16) {
      bkey = binl_md5(bkey, key.length * 8)
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636
      opad[i] = bkey[i] ^ 0x5C5C5C5C
    }
    hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
  }

  function rstr2hex (input) {
    var hex_tab = '0123456789abcdef'
    var output = ''
    var x
    var i
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i)
      output += hex_tab.charAt((x >>> 4) & 0x0F) +
      hex_tab.charAt(x & 0x0F)
    }
    return output
  }

  function str2rstr_utf8 (input) {
    return unescape(encodeURIComponent(input))
  }

  function raw_md5 (s) {
    return rstr_md5(str2rstr_utf8(s))
  }
  function hex_md5 (s) {
    return rstr2hex(raw_md5(s))
  }
  function raw_hmac_md5 (k, d) {
    return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))
  }
  function hex_hmac_md5 (k, d) {
    return rstr2hex(raw_hmac_md5(k, d))
  }
  function md5(string, key, raw) {
    if (!key) {
      if (!raw) {
        return hex_md5(string)
      }
      return raw_md5(string)
    }
    if (!raw) {
      return hex_hmac_md5(key, string)
    }
    return raw_hmac_md5(key, string)
  };

  return md5;
}

},{}]},{},[3])(3)
});