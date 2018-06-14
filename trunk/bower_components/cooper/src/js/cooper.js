/**
 * cooper - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v1.0.0
 * @link 
 * @license ISC
 */
(function ( factory ) {
    if ( define && define.amd ) {
        define ( ['jquery', './pdfobject'], factory );
    } else {
        window.Cooper = factory ();
    }
}) ( function ( $, pdfobject ) {
    /**
     *
     * @param options
     * @constructor
     */
    function Cooper() {
        this.viewerHtml = '../../bower_components/pdf-viewer/main/viewer.html';
    }

    /**
     *
     * @returns {boolean}
     */
    function isIe8() {
        var isIEEight = false;
        if ( (navigator.userAgent.indexOf ( "MSIE 9.0" ) > 0 && !window.innerWidth)
            || (navigator.userAgent.indexOf ( "MSIE 8.0" ) > 0 && !window.innerWidth) ) {
            isIEEight = true;
            return isIEEight;
        } else {
            return isIEEight;
        }
    }

    /**
     *
     * @param id
     * @returns {*|jQuery|HTMLElement}
     */
    function getDom( id ) {
        return $ ( '#' + id );
    }

    /**
     *
     * @param href
     * @param target
     */
    function openWindow( href, target ) {
        var $a = $ ( '<a></a>' );
        $a.attr ( 'href', href );
        $a.attr ( 'target', target || '_blank' );
        $ ( 'body' ).append ( $a );
        $a[0].click ();
        $a.remove ();
    }

    /**
     *
     * @param options
     * @returns {boolean}
     */
    function preview( options ) {
        if ( options.containerId ) {

            var theViewFrame = getDom ( options.containerId );

            if ( theViewFrame.length ) {
                if ( isIe8 () ) {
                    var myPDF = pdfobject ( {
                        url   : options.src,
                        width : '100%',
                        height: '500'
                    } );

                    myPDF.embed ( options.containerId );

                } else {
                    theViewFrame.attr ( 'src', this.viewerHtml + '?file=' + options.src );
                }
            }

        } else {
            openWindow ( this.viewerHtml + '?file=' + options.src );
        }
    }

    Cooper.prototype = {

        downloaderId  : 'ajax_down_loader_frame',
        downloaderName: 'AjaxDownloaderIFrame',

        request: function ( options ) {
            var defer    = $.Deferred (),
                sendData = options.sendData,
                url      = options.url,
                me       = this;
            if ( !sendData.isDownload ) {
                if ( typeof XDomainRequest !== 'undefined' ) {
                    var xdr        = new XDomainRequest ();
                    xdr.onload     = function () {
                        var data = JSON.parse ( xdr.responseText );
                        if ( data.status ) {
                            preview.call ( me, {
                                containerId: options.containerId,
                                src        : data.info.resourceUrl + data.info.path,
                                styles     : ''
                            } );
                            defer.resolve ( data );
                        }
                    };
                    xdr.onerror    = function () {
                        defer.reject ( {
                            code    : 500,
                            messages: '服务端异常'
                        } );
                    };
                    xdr.onprogress = function () {
                    };
                    xdr.open ( 'post', url );
                    xdr.send ( JSON.stringify ( sendData ) );
                } else {
                    $.ajax ( {
                        type       : "post",
                        url        : url,
                        contentType: 'text/plain',
                        data       : JSON.stringify ( sendData ),
                        success    : function ( data ) {
                            if ( data.status ) {
                                defer.resolve ( data );
                                preview.call ( me, {
                                    containerId: options.containerId,
                                    src        : data.info.resourceUrl + data.info.path,
                                    styles     : ''
                                } );
                            } else {
                                defer.reject ( data );
                            }
                        },
                        fail       : function ( data ) {
                            defer.reject ( data );
                        }
                    } );
                }
            } else {
                var downloader = $ ( '#' + this.downloaderId );

                if ( downloader.length > 0 ) {
                    downloader.remove ();
                }

                var theIframe = $ ( "<iframe>", {
                        id  : this.downloaderId,
                        name: this.downloaderName
                    } )
                    .hide ()
                    .appendTo ( "body" ),
                    ////////////////////////////////////////
                    ////////////////////////////////////////
                    settings  = $.extend ( true, {}, {
                        data: $.ajaxSetup ()["data"] || {},
                        url : $.ajaxSetup ()["url"]
                    }, options ),
                    ////////////////////////////////////////
                    ////////////////////////////////////////
                    form      = $ ( "<form>", {
                        action: options.url,
                        method: "POST",
                        target: this.downloaderName
                    } ).appendTo ( "body" );

                $.each ( settings.sendData, function ( key, val ) {
                    $ ( "<input>", {
                        type : "hidden",
                        name : key,
                        value: (typeof val == "object") ? JSON.stringify ( val ) : val
                    } ).appendTo ( form );
                } );

                form.submit ();
                form.remove ();

                defer.resolve ();
            }
            return defer;
        }
    };

    return Cooper;
} );