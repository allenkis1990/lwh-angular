/**
 * Created by 亡灵走秀 on 2017/2/22.
 *
 *
 * @ 模块控制播放器在播放的时候安全控制
 */
define ( function ( mod ) {
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
    var tips = document.createElement ( 'div' );
    if ( BrowserDetect.browser === 'Internet Explorer' && BrowserDetect.version < 8 ) {
        tips.innerHTML = '<div id="tip_brows" style="position: fixed;top: 50%;left: 50%;width: 800px;margin-left: -400px;height: 300px;margin-top: -150px;text-align: center;background-color: gray;"><span style="line-height: 300px;font-size: 20px;color: white;font-weight: bold;font-family: 微软雅黑;">您当前的浏览器为' + BrowserDetect.browser + ' ' + BrowserDetect.version + '，请使用至少ie8及以上的版本学习!</span></div>';
        document.getElementsByTagName ( 'body' )[0].appendChild ( tips );
    }
    return BrowserDetect;
} );
