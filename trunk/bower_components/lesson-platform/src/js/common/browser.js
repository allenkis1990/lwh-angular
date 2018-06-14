/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
define ( function ( mod ) {
    /**
     * Created by 亡灵走秀 on 2017/2/22.
     *
     *
     * @ 模块控制播放器在播放的时候安全控制
     */
    'use strict';

    var BrowserDetect = {
        init         : function () {
            this.browser = this.searchString ( this.dataBrowser ) || "An unknown browser";
            this.version = this.searchVersion ( navigator.userAgent )
                || this.searchVersion ( navigator.appVersion )
                || "an unknown version";
            this.OS      = this.searchString ( this.dataOS ) || "an unknown OS";
        },
        searchString : function ( data ) {
            for ( var i = 0; i < data.length; i++ ) {
                var dataString           = data[i].string;
                var dataProp             = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if ( dataString ) {
                    if ( dataString.indexOf ( data[i].subString ) != -1 )
                        return data[i].identity;
                }
                else if ( dataProp )
                    return data[i].identity;
            }
        },
        searchVersion: function ( dataString ) {
            var index = dataString.indexOf ( this.versionSearchString );
            if ( index == -1 ) return;
            return parseFloat ( dataString.substring ( index + this.versionSearchString.length + 1 ) );
        },
        dataBrowser  : [
            {
                string   : navigator.userAgent,
                subString: "Chrome",
                identity : "Chrome"
            },
            {
                string       : navigator.userAgent,
                subString    : "OmniWeb",
                versionSearch: "OmniWeb/",
                identity     : "OmniWeb"
            },
            {
                string       : navigator.vendor,
                subString    : "Apple",
                identity     : "Safari",
                versionSearch: "Version"
            },
            {
                prop    : window.opera,
                identity: "Opera"
            },
            {
                string   : navigator.vendor,
                subString: "iCab",
                identity : "iCab"
            },
            {
                string   : navigator.vendor,
                subString: "KDE",
                identity : "Konqueror"
            },
            {
                string   : navigator.userAgent,
                subString: "Firefox",
                identity : "Firefox"
            },
            {
                string   : navigator.vendor,
                subString: "Camino",
                identity : "Camino"
            },
            {		// for newer Netscapes (6+)
                string   : navigator.userAgent,
                subString: "Netscape",
                identity : "Netscape"
            },
            {
                string       : navigator.userAgent,
                subString    : "MSIE",
                identity     : "Internet Explorer",
                versionSearch: "MSIE"
            },
            {
                string       : navigator.userAgent,
                subString    : "Gecko",
                identity     : "Mozilla",
                versionSearch: "rv"
            },
            {		 // for older Netscapes (4-)
                string       : navigator.userAgent,
                subString    : "Mozilla",
                identity     : "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS       : [
            {
                string   : navigator.platform,
                subString: "Win",
                identity : "Windows"
            },
            {
                string   : navigator.platform,
                subString: "Mac",
                identity : "Mac"
            },
            {
                string   : navigator.userAgent,
                subString: "iPhone",
                identity : "iPhone/iPod"
            },
            {
                string   : navigator.platform,
                subString: "Linux",
                identity : "Linux"
            }
        ]

    };

    BrowserDetect.init ();
    var notice = '<div style="background-color: white;font-family:微软雅黑;position: absolute;top: 50%;left: 50%;width: 600px;margin-left: -320px;margin-top: -280px;height: 500px;border:1px solid gray;padding: 30px 20px;z-index: 10000;">' +
        '<p>已检测到您当前的浏览器无法播放课程。为了不影响学习，建议尝试以下检测：</p>' +
        '<h4 style="font-size: 16px;margin: 5px;font-weight: bold;">检测1：请确认已使用主流浏览器进行学习</h4>' +
        '<p style="font-size: 13px;margin: 10px;">推荐用以下主流浏览器（点击下载）</p>' +
        '<div>' +
        '<a target="_blank" href="/mfs/softs/360se8.1.1.248.exe" style="border: 1px solid gray;padding: 8px 18px;background-color: white;cursor: pointer;display: inline-block;margin: 5px;"' +
        ' title="下载360浏览器">' +
        '<img style="vertical-align: middle"' +
        ' src="images/logo-360.jpg">' +
        '<span>360浏览器</span></a>' +
        '<a target="_blank" href="/mfs/softs/ChromeSetup.exe"  style="border: 1px solid gray;padding: 8px 18px;background-color: white;cursor: pointer;display: inline-block;margin: 5px;"' +
        ' title="下载chrome浏览器">' +
        '<img style="vertical-align: middle"' +
        ' src="images/logo-chrome.jpg">' +
        '<span>chrome浏览器</span>' +
        '</a>' +
        '<a target="_blank" href="/mfs/softs/Firefox-latest.exe"  style="border: 1px solid gray;padding: 8px 18px;background-color: white;cursor: pointer;display: inline-block;margin: 5px;"' +
        ' title="下载火狐浏览器">' +
        '<img style="vertical-align: middle"' +
        ' src="images/logo-firefox.jpg">' +
        '<span>火狐浏览器</span></a>' +
        '</div>' +
        '<h4 style="font-size: 16px;margin: 5px;font-weight: bold;">检测2：若您使用的是360浏览器，请确认将浏览器切换至 极速模式 后进行学习</h4>' +
        '<p style="font-size: 13px;margin: 10px;">切换方法说明：点击图中红色方框位置，将浏览器模式切换至 极速模式s</p>' +
        '<div style="text-align: center">' +
        '<img src="images/360pic.png" alt="">' +
        '</div>' +
        '<p style="margin: 10px;">若以上两种方式尝试后仍无法正常使用？请联系客服人员!' +
        '</div>'
    var tips   = document.createElement ( 'div' );
    if ( BrowserDetect.browser === 'Internet Explorer' && (BrowserDetect.version < 8 || document.documentMode < 8) ) {
        tips.innerHTML = notice;
        document.getElementsByTagName ( 'body' )[0].innerHTML = notice;
        // document.getElementsByTagName ( 'body' )[0].appendChild ( tips );
    }
    return BrowserDetect;
} );
