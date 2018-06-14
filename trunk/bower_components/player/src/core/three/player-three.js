define ( [
    '../single/player-single',
    '../../common/helper',
    '../pdf/operation',
    '../pdf/operationIE8',
    '../common/player-timer'
], function ( single, helper,  pdfPlayer, pdfIEPlayer, TimerFactory ) {
    'use strict';

    var catalogArr           = {}, //除去祖宗节点的所有节点
        lectureArr           = {},
        lectureDic           = {},
        lecturePdfDic        = {},
        currentLecLocation   = 0,
        currentCataLocation  = 0,
        //目录中所有的祖宗节点（可能有后代可能没后代）
        parentNodeCatalogArr = {},
        //所有播放节点
        playNodesCatalogArr  = [];

    function CurrentEvent( player ) {
        this.player        = player;
        this.moveMediaTime = function ( t ) {
            this.player.play ( t );
        }
    }

    //初始化数据 比如排序等等
    function initDataFormat( LaunchData ) {
        lecturePdfDic       = {};
        catalogArr          = {};
        lectureDic          = {};
        currentLecLocation  = 0;
        currentCataLocation = 0;

        parentNodeCatalogArr = $.grep ( LaunchData.extend.lessonCatalog, function ( obj, i ) {
            return obj.parentId == '0';
        } );

        catalogArr = $.grep ( LaunchData.extend.lessonCatalog, function ( obj, i ) {
            return obj.timePoint != '-1';
        } );

        catalogArr = catalogArr.sort ( function ( a, b ) {
            if ( a.timePoint > b.timePoint ) return 1;
            else if ( a.timePoint < b.timePoint ) return -1;
            else return 0;
        } );
        //讲义数据初始化（排序）
        lectureArr = LaunchData.extend.lessonDocument.sort ( function ( a, b ) {
            if ( a.timePoint > b.timePoint ) return 1;
            else if ( a.timePoint < b.timePoint ) return -1;
            else return 0;
        } );

        for ( var index = 0; index < lectureArr.length; index++ ) {
            lectureDic[Number ( lectureArr[index].timePoint )]    = lectureArr[index].path;
            lecturePdfDic[Number ( lectureArr[index].timePoint )] = lectureArr[index].expand;
        }
    }

    //构建目录结构
    function constructDirect() {
        playNodesCatalogArr = [];
        var catalog         = document.getElementById ( 'media-catalog' ),
            ////////////////////////////////////////////////////////
            div1            = document.createElement ( "div" ),
            div2            = document.createElement ( "div" );
        div2.setAttribute ( 'class', 'signer-content posrel' );

        var ul = document.createElement ( "ul" );
        ul.setAttribute ( 'class', 'ul-name' );
        ul.style.width = parentNodeCatalogArr.length * 152 + 'px';
        ul.style.left  = 0;

        for ( var i = 0; i < parentNodeCatalogArr.length; i++ ) {
            //该节点若没有下级节点则直接输出HTML
            if ( !contains ( catalogArr, parentNodeCatalogArr[i].id ) ) {
                $ ( ul ).append ( "<li id='" + parentNodeCatalogArr[i].id + "'  onclick='API.moveMediaTime("
                    + parentNodeCatalogArr[i].timePoint + ")' >" +
                    "<div class='txt'><p>" + parentNodeCatalogArr[i].name + "</p></div></li>" );
                playNodesCatalogArr.push ( parentNodeCatalogArr[i] );
            } else {
                //找出 下 级节点
                var secondCatalogList = $.grep ( catalogArr, function ( obj, i ) {
                    return obj.parentId == parentNodeCatalogArr[i].id;
                } );
                $ ( ul ).appendChild ( "<li class='passage-tree-li'><a class='tree-first-a' href='javascript:void(0)' >"
                    + parentNodeCatalogArr[i].name + "</a></li>" );

                for ( var j = 0; j < secondCatalogList.length; j++ ) {
                    var innerUl = document.createElement ( "ul" );
                    innerUl.setAttribute ( 'class', 'passage-tree-first' );
                    if ( !contains ( catalogArr, secondCatalogList[j].id ) ) {
                        //生成带一个下级节点的目录
                        //<i class='ico'></i>
                        $ ( innerUl ).append ( "<li class='tree-first-li'>" +
                            "<em class='chlid-ico ico child-se-ico hide'></em>" +
                            "<button name='catalogGroup' id='" + secondCatalogList[j].id + "'  onclick='API.moveMediaTime(" + secondCatalogList[j].timePoint + ")' class='tree-second-a'>" + secondCatalogList[j].name + "</button>" + +"<li>" );

                        playNodesCatalogArr.push ( secondCatalogList[j] );
                    } else {
                        //找出 下 下级节点
                        var thirdCatalogList = $.grep ( catalogArr, function ( obj, i ) {
                            return obj.ParentId == secondCatalogList[i].id;
                        } );
                        //<i class='ico'></i>
                        $ ( innerUl ).append ( "<li class='tree-first-li'>" +
                            "<em class='chlid-ico ico child-se-ico hide'></em>" +
                            "<a href='javascript:void(0)' class='tree-second-a'>" + secondCatalogList[j].name + "</a>" + +"<li>" );
                        var lastUl = document.createElement ( 'ul' );
                        for ( var k = 0; k < thirdCatalogList.length; k++ ) {
                            $ ( lastUl ).append ( "<li><button  id='" + thirdCatalogList[k].id + "' name='catalogGroup' onclick='API.moveMediaTime(" + thirdCatalogList[k].timePoint + ")>" + thirdCatalogList[k].name + "</button></li>" )
                            playNodesCatalogArr.push ( thirdCatalogList[k] );
                        }
                    }
                }
            }
        }
        if ( catalog )
            catalog.appendChild ( div1 );
        div2.appendChild ( ul );
        if ( catalog )
            catalog.appendChild ( div2 );
    }

    //寻找位置 返回数组位置
    function findLocation( time, array, column ) {
        if ( time == 0 ) return 0;

        var location = -1;
        for ( var index = 0; index < array.length; index++ ) {
            if ( Number ( array[index][column] ) <= time ) {
                location++;
            } else {
                return Number ( location );
            }
        }
        return location;
    }

    //开启正常模式讲义和目录切换定时器
    function timeInterval( kernel ) {
        var $mediaDocument = $ ( "#media-document" );
        if ( kernel == undefined ) return;
        if ( kernel.swfObject == undefined ) return;
        var t = Math.round ( kernel.getTime () );
        if ( t > 0 ) {
            var locationLecResult  = findLocation ( t, lectureArr, 'timePoint' ),
                locationCataResult = findLocation ( t, playNodesCatalogArr, 'timePoint' );
            if ( currentLecLocation != locationLecResult ) {
                currentLecLocation = locationLecResult;

                var path       = lectureArr[currentLecLocation].path,
                    sourcePath = $mediaDocument.attr ( "src" );
                if ( path !== sourcePath ) {
                    $mediaDocument.attr ( "src", path );
                }
            }

            if ( currentCataLocation != locationCataResult ) {
                currentCataLocation = locationCataResult;
                $ ( "button[name=catalogGroup]" ).attr ( 'class', '' );

                $ ( "#" + playNodesCatalogArr[currentCataLocation].id )

                    .addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
            helper.log ( "Document other invoke!" );
        }
    }

    //pdf 计时器
    function pdfTimeInterval( kernel ) {
        if ( kernel == undefined ) return;
        if ( kernel.swfObject == undefined ) return;
        var t = Math.round ( kernel.getTime () );
        if ( t > 0 ) {
            var locationLecResult  = findLocation ( t, lectureArr, 'timePoint' ),
                locationCataResult = findLocation ( t, playNodesCatalogArr, 'timePoint' );

            if ( currentLecLocation != locationLecResult ) {
                currentLecLocation = locationLecResult;
                //滚动到那一页
                if ( window.frames[0].PDFViewerApplication != undefined ) {
                    window.frames[0].PDFViewerApplication.pdfViewer.scrollPageIntoView ( lectureArr[currentLecLocation].expand )
                }
            }

            if ( currentCataLocation != locationCataResult ) {
                currentCataLocation = locationCataResult;
                $ ( "button[name=catalogGroup]" ).attr ( 'class', '' );
                $ ( "#" + playNodesCatalogArr[currentCataLocation].id )
                    .addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
            helper.log ( "Document pdf invoke!" );
        }
    }

    //IE8 PDF计时器
    function pdfIE8TimeInterval( kernel ) {
        var currentCataLocation = 0;
        if ( kernel == undefined ) return;
        if ( kernel.swfObject == undefined ) return;
        var t = Math.round ( kernel.getTime () );
        if ( t > 0 ) {
            var locationCataResult = findLocation ( t, playNodesCatalogArr, 'timePoint' );

            if ( currentCataLocation != locationCataResult ) {
                currentCataLocation = locationCataResult;
                $ ( "button[name=catalogGroup]" ).attr ( 'class', '' );
                $ ( "#" + playNodesCatalogArr[currentCataLocation].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
            helper.log ( "Document pdfIE8 invoke!" );
        }
    }

    ///查看目录是否有子节点
    function contains( arr, obj ) {
        var i = arr.length;
        while ( i-- ) {
            if ( arr[i].ParentId === obj ) {
                return true;
            }
        }
        return false;
    }

    //清理目录
    function clearCatalogUI() {
        $ ( "#media-catalog" ).html ( "" );
    }

    //初始化讲义区其他格式的三分屏
    function _InitNormalThreeView( LaunchData, three ) {
        //清理目录
        clearCatalogUI ();
        //对数据进行处理
        initDataFormat ( LaunchData );

        constructDirect ();

        var $mediaDomcument = $ ( "#media-document" ),
            currentLocation;

        if ( !three.__timerFactory ) {
            three.__timerFactory = new TimerFactory ();
        }

        three.__timerFactory.create ( helper.Const.Document.exchange, 1000, function () {
            timeInterval ( three.player );
        } );

        if ( LaunchData.extend.studyMode == 1 ) {

            //上次课程播放进度
            var studyLastScale = Number ( LaunchData.core.studyLastScale );
            //定义目录位置
            currentLocation    = findLocation ( studyLastScale, playNodesCatalogArr, 'timePoint' );

            $ ( "button[name=catalogGroup]" ).attr ( 'class', '' );

            if ( playNodesCatalogArr.length > 0 && currentLocation >= 0 ) {
                $ ( "#" + playNodesCatalogArr[currentLocation].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }

            currentCataLocation = currentLocation;

            if ( studyLastScale > 0 ) {
                //定义讲义位置
                currentLocation = findLocation ( studyLastScale, lectureArr, 'timePoint' );
                $mediaDomcument.attr ( "src", lectureArr[currentLocation].path );
            } else {
                $mediaDomcument.attr ( "src", lectureArr[0].path );
            }

            currentLecLocation = currentLocation;
        } else {
            if ( playNodesCatalogArr.length > 0 ) {
                $ ( "#" + playNodesCatalogArr[0].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
            $mediaDomcument.attr ( "src", lectureArr[0].path );
            three.__timerFactory.get ( helper.Const.Document.exchange ).start ();
        }

        if ( $mediaDomcument && $mediaDomcument[0] ) {
            var theIframe = $mediaDomcument[0];
            if ( theIframe.attachEvent ) {
                theIframe.attachEvent ( "onload", function () {
                    if ( LaunchData.styleOptions ) {
                        $ ( theIframe.contentWindow.document ).find ( 'body' ).css ( LaunchData.styleOptions.mediaDocument );
                    }
                } );
            } else {
                theIframe.onload = function () {
                    if ( LaunchData.styleOptions ) {
                        $ ( theIframe.contentWindow.document ).find ( 'body' ).css ( LaunchData.styleOptions.mediaDocument );
                    }
                };
            }
        }
    }

    //初始化讲义区为PDF的三分屏
    function _InitPdfThreeView( LaunchData, three, api ) {
        //清理目录
        clearCatalogUI ();
        //对数据进行处理
        initDataFormat ( LaunchData );

        //初始化PDF区控件
        var fileURL    = encodeURIComponent ( lectureArr[0].path );
        var launch     = {
            pdfHtmlAddress: LaunchData.pdfHtmlAddress,
            options       : {
                startAt    : LaunchData.options.startAt,
                containerId: 'media-document',
                width      : helper.getStyleByOptions ( LaunchData.style, LaunchData.type, 'width' ) || '823px',
                height     : helper.getStyleByOptions ( LaunchData.style, LaunchData.type, 'height' ) || '576px'
            }
        };
        three.Document = pdfPlayer.init ( api ).createPDF ( launch, fileURL );
        if ( !three.__timerFactory ) {
            three.__timerFactory = new TimerFactory ();
        }
        three.__timerFactory.create ( helper.Const.Document.exchange, 1000, function () {
            pdfTimeInterval ( three.player );
        } );

        //生成目录的页面DOM对象
        constructDirect ();
        if ( LaunchData.extend.studyMode == 1 ) {
            if ( window.frames[0].PDFViewerApplication != undefined ) {
                window.frames[0].PDFViewerApplication.pdfViewer.scrollPageIntoView ( 1 )
            }
            if ( playNodesCatalogArr.length > 0 ) {
                $ ( "#" + playNodesCatalogArr[0].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
        } else {
            if ( playNodesCatalogArr.length > 0 ) {
                $ ( "#" + playNodesCatalogArr[0].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
            if ( window.frames[0].PDFViewerApplication != undefined ) {
                window.frames[0].PDFViewerApplication.pdfViewer.scrollPageIntoView ( 1 )
            }
        }
        //three.__timerFactory.get(helper.Const.Document.exchange).start();
    }

    //IE8下初始化讲义区为PDF的三分屏
    function _InitPdfThreeIE8View( LaunchData, three, api ) {
        //清理目录
        clearCatalogUI ();
        //对数据进行处理
        initDataFormat ( LaunchData );
        //初始化PDFIE8视图
        LaunchData.options.containerId = 'media-document';
        three.Document                 = pdfIEPlayer.init ( api ).initPlayer ( LaunchData );
        if ( !three.__timerFactory ) {
            three.__timerFactory = new TimerFactory ();
        }
        three.__timerFactory.create ( helper.Const.Document.exchange, 1000, function () {
            pdfIE8TimeInterval ( three.player );
        } );

        constructDirect ();

        if ( LaunchData.extend.studyMode != 1 ) {
            if ( playNodesCatalogArr.length > 0 ) {
                $ ( "#" + playNodesCatalogArr[0].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
        } else {
            if ( playNodesCatalogArr.length > 0 ) {
                $ ( "#" + playNodesCatalogArr[0].id ).addClass ( 'current' ).siblings ().removeClass ( 'current' );
            }
        }
        //three.__timerFactory.get(helper.Const.Document.exchange).start();
    }

    var core = {
        init: function ( api ) {
            var three        = single.init ( api );
            three.type       = "three";
            three.initPlayer = function ( launchStudy ) {
                launchStudy.options.width  = launchStudy.options.width || '100%';
                launchStudy.options.height = launchStudy.options.height || '100%';
                this.__init ( launchStudy );
                $.extend ( window.API, new CurrentEvent ( three.player ) );
                if ( launchStudy.extend.lessonDocument.length > 0 && launchStudy.extend.lessonDocument[0].type == 4 ) {
                    if ( helper.isIE8 () ) {
                        _InitPdfThreeIE8View ( launchStudy, three, api );
                    } else {
                        _InitPdfThreeView ( launchStudy, three, api );
                    }
                }
                else if ( launchStudy.extend.lessonDocument.length > 0 && launchStudy.extend.lessonDocument[0].type != 4 ) {
                    _InitNormalThreeView ( launchStudy, three );
                }
            };
            return three;
        }
    };

    return core;
} );
