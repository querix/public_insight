/**
 *  CMS wrappers:
 * - containermenu_transformer - modifies left-side menu and adds topbar
 * - toolbar_transformer + tbutton_transformer - modifies toolbar
 * - formsearch_transformer - adds search field to topbar
 * - title_transformer - shows application title
 */
/*
    attach - is called before attaching the element to DOM tree
            when returns false, the framework will perform no default actions
            takes the DOM element where the other element will be attached as its first argument
    prop(propertName, propertyValue) signals that the property value changed
            when returns false, the default action on the property will be suppressed
            propertyName is a dollar-separated string specifying the path to the property in the abstract model (e.g., MinSize$Height for minimal height)
    detach - is called before detaching the element from DOM tree
    remove - is called before removing the element
    focus/blur - is called than the element receives or loses 4gl focus at runtime
    noHeavyInit - suppresses any heavy initialization actions performed by LyciaClient API
*/

(function(querix){
    var setDeviceDependentClasses = function() {
        var $ = window.top.$;
        var root = $('html');

        if (root.hasClass('qx-target-web') && root.hasClass('qx-target-tablet')) {//tablet mode forced on web
            root.addClass('qx-devicemode-tablet');
            return;
        } else if (root.hasClass('qx-target-web') && root.hasClass('qx-target-mobile')) {//phone mode forced on web
            root.addClass('qx-devicemode-phone');
            return;
        // } else if (root.hasClass('qx-target-web')) {//normal desktop mode
        //         root.addClass('qx-devicemode-desktop');
        //         return;
        }
        var minDeviceWidth = screen.width < screen.height ? screen.width : screen.height;
        var maxDeviceWidth = screen.width > screen.height ? screen.width : screen.height;
        if (minDeviceWidth >= 300 && maxDeviceWidth <= 400) {
            root.addClass('qx-devicemode-phone');
        } else if (minDeviceWidth >= 400 && maxDeviceWidth <= 1080) {
            root.addClass('qx-devicemode-tablet');
        } else {
            root.addClass('qx-devicemode-desktop');
        }
}

setDeviceDependentClasses();

var qux = function(childId) {
    if (childId === querix.childId) {
        return querix;
    } else {
        if (querix.children && querix.children[childId]) {
            return querix.children[childId].root;
        }
    }
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\nquerix object not found for childId ',childId);
    return null;
};

var topbar = (function() {
    var devicemode = null;
        var topbarInstalled = false;

        function getDeviceMode($) {
                if (devicemode === null) {
                        var root = $('html');
                        if (root.hasClass('qx-devicemode-tablet')) {
                                devicemode = 'tablet';
                        } else if (root.hasClass('qx-devicemode-phone')) {
                                devicemode = 'phone';
                        } else {
                                devicemode = 'desktop';
                        }
                }
                return devicemode;
        }

        function setCss(el,name, value) {
                if(value === 'do not change') {
                        return;
                } else {
                        if (typeof value == 'function') {
                                el.css(name,value());
                        } else {
                                el.css(name,value);
                        }
                }
        }

        function addStylesheet($,id,styles) {
                var stylesheet = $('<style id="'+id+'" type="text/css"/>').append(styles);
                var head = $('head');
                head.remove('#'+id);
                head.append(stylesheet);
        }

        function addTopbar($) {
                var styles = '';
                var defaults = {
                        phone: {
                                menuWidth: '100%',
                                topbarPadding: 'do not change',
                                menuDisplay: 'table-cell'
                        },
                        tablet: {
                                menuWidth: function(){
                                        if(window.top.innerWidth > 300) {
                                                return 300;
                                        } else {
                                                return '100%';
                                        }
                                },
                                topbarPadding: 'do not change',
                                menuDisplay: 'table-cell'
                        },
                        desktop: {
                                menuWidth: 300,
                                topbarPadding: 300,
                                menuDisplay: 'table-cell'
                        }
                };
                var topbar = $('<form id=\"cms-topbar\" class="cms-show-logo"><a id=\"cms-button-mainmenu\">Main Menu</a><p class="cms-search-widget"></p><p><a id=\"lbValueUserName\"><img alt="" src="data:image/png;base64,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" /><span class="qx-text"/><i class="toggle-popup"></i></a></p></form>');
                var accountPopup = $('<div data-role="popup" id="cms-account-menu" class="qx-popup qx-popup-userdata"/>')
                        .append($('<p class="content"></p>')).appendTo($('body'));
                accountPopup.popup({
                    history: false,
                    arrow: 't'
                });
                var topmost = $('html');
                if (topmost.hasClass('qx-devicemode-desktop')) {
                        topmost.addClass('cms-mainmenu-visible');
                }
                function toggleMainmenu(e) {
                        var $ = e.target.ownerDocument.defaultView.$;
                        var cm = $('#qx-container-menu');
                        var tb = $('#cms-topbar');
                        var hidden = !topmost.hasClass('cms-mainmenu-visible');
                        var sp = defaults[getDeviceMode($)];
                        if (hidden) {
                                setCss(cm,'width',sp['menuWidth']);
                                setCss(cm,'min-width',sp['menuWidth']);
                                setCss(tb,'padding-left',sp['topbarPadding']);
                                topmost.addClass('cms-mainmenu-visible');
                        } else {
                                cm.css('width','1px');
                                cm.css('min-width','1px');
                                tb.css('padding-left',0);
                                topmost.removeClass('cms-mainmenu-visible');
                        }
                        var topqx = window.top.querix;
                        for(var i in topqx.children) {
                            childqx = topqx.children[i].root;
                            childqx.rjqui.signalWindowResize();
                        }
                        topqx.rjqui.signalWindowResize();
                }
                topbar.find('#cms-button-mainmenu').on('click',toggleMainmenu);
                topbar.find('#lbValueUserName').on('click',function(){
                    try{
                        accountPopup.popup("open",{positionTo: '#lbValueUserName .toggle-popup'});
                    }
                    catch(e){
                        console.error("cannot open popup",e);
                    }
                });
                $('body').remove('#cms-topbar').append(topbar);
        }

        return {
                remove: function() {
                        if (topbarInstalled) {
                                window.top.$('#cms-topbar').remove();
                                //window.top.$('#cms-topbar-styles').remove();
                        }
                },
                attach: function(to) {
                        var $ = window.top.$;
                        if ($('#cms-topbar').length == 0) {
                                addTopbar($);
                                topbarInstalled = true;
                        }
                        return true;
                },
                prop: function(propertyName, propertyValue){
                        return true;
                },
        };
})();

var toolbars = window.ADEBUG_TOOLBARS = {};
querix.plugins.wrappers.tbutton_transformer = {
    wrap: function(childId, el, sel) {
        function findParentToolbar(but) {
            var parent = qux(childId).themes.aumParent(but);
            if (parent && parent.ty() === 'ToolbarGroup') {
                parent = qux(childId).themes.aumParent(parent);
            }
            return parent;
        }

        return {
            remove: function() {
                var parent = findParentToolbar(this), pid = parent.length > 0 ? parent.id() : null;
                if (parent) {
                    fullPid = childId + '_' + pid;
                    bar = toolbars[fullPid];
                    if (!bar) {
                            bar = toolbars[fullPid] = {};
                    }
                    var id = this.id();
                    delete bar[id];
                    var $ = this[0].ownerDocument.defaultView.$;
                    var nativeParentClass = '.cms-wrapper-for-'+id;
                    var nativeParent = $(nativeParentClass);
                    if (!nativeParent) {
                        console.error('No parent for ',id);
                    }
                    nativeParent.append(this.detach());
                    parent.trigger('toolbarUpdated');
                }
                return true;
            },
            attach: function(to) {
                console.error('TBUTTON',this.id());
                var parent = findParentToolbar(this), pid = parent.length > 0 ? parent.id() : null;
                if (parent && parent.ty() == 'ToolbarGroup') {
                    parent2 = qux(childId).themes.aumParent(parent), pid = parent2.length > 0 ? parent2.id() : null;
                    parent = parent2;
                }
                if (parent) {
                    fullPid = childId + '_' + pid;
                    bar = toolbars[fullPid];
                    if (!bar) {
                            bar = toolbars[fullPid] = {};
                    }
                    this.removeClass('qx-ip-t qx-ip-b qx-ip-r').addClass('qx-ip-l');
                    bar[this.id()] = true;
                    parent.trigger('toolbarUpdated');
                }
                return true;
            }
        }
    }
};

var arrows = {
    key_home: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAALCAYAAAB/Ca1DAAAAAXNSR0IArs4c6QAAALpJREFUKBVj+P///3Ug9mFAAkA+OxCvBeIFSMLEMYGaQCAXphrI5gLi3UD8HYjdYeJE00BNIAA2EEjzAPFBIP4KxM5EG4KkkAXGBhrAD2TvAGJtIHZnZGQ8ApMjhYYZyAXUtA+I9YE4B4hBLjQE0qSCFwxAjSCwCUJRTD6BufAo0CnSQAxz4UlSnQZVD3dhLtBt/EB8HIg/AbENmQYyMME0AiPhI5DtCsTngXgn0FCyYhkWhlRNh1TNKQBNBtw2TK+99gAAAABJRU5ErkJggg==',
    key_end: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAALCAYAAAB/Ca1DAAAAAXNSR0IArs4c6QAAALxJREFUKBWt0zEKwjAYhuFECoIIXSveQhAXnYp00aO4ehIP4Cy4C4LgUBwcpJMn6AEqFMf4/mKgIIj5NfDQpOT7CKE1JnA459bYot2Msp7h2nz31ZxQhjv26PgQ8wWcXwc9yaWocURXwjz1ha+CMSU3nBD7wohJjw2JbAocNfuXWOGADUyEM/qy+GEMyJaSl8IhNCeU/AhywgI55tANrmqCtztsaeooSsntcMHUWltpep4Zyv77HVL48U95AKJ0n0IRv6sHAAAAAElFTkSuQmCC',
    previous: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAALCAYAAACgR9dcAAAAAXNSR0IArs4c6QAAAHVJREFUKBVjYEAD////Twbi+0DMjCaFnwvUkAjE/4C4F79KNFmghjgg/gvEk9Ck8HOBGqKhGqfiV4kqywjUFAkUWgzEh4G4GIj/AzEx4CVI8wugSnFiVKOpeUaRzWDDyPUz3CVAA8gLbZgJQAPIi2ckA4hOYQB62GjiaIPFFgAAAABJRU5ErkJggg==',
    next: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAALCAYAAACgR9dcAAAAAXNSR0IArs4c6QAAAH9JREFUKBVjYCAA/v//zwzE94E4mYBS7NJAjb1A/A+IE7GrICAK1DgJiP8CcRwBpdilgRqnQg2IBqlgAXKkgLQ4duUYonOBIlpAvBCo7x8jkHgK5IAMIBW8BGkmxWZGoA29QGwLxLEk2Qa0CMXPRGsGaiQvtIEayYtnoEacKQwAkQlnoU2XEqsAAAAASUVORK5CYII='
};

function isArrowButton($el) {
    for (var key in arrows) {
        if ($el.hasClass('qx-identifier-'+key)) {
            return key;
        }
    }
    return null;
}


var buttonDimensions = {
    w: 11 ,
};

function calcPopupDimension(buttonCount) {
    var d = {width:0,height:'auto'};
    if (buttonCount < 5) {
        d.width = buttonDimensions.w;
    } else if (buttonCount < 10) {
        d.width = buttonDimensions.w * 2;
    } else {
        var cols = Math.ceil(buttonCount/5);
        d.width = buttonDimensions.w * cols;
    }
    d.width += 'em';
    return d;
}

querix.plugins.wrappers.toolbar_transformer = {
    wrap: function(childId, el, sel) {
        function updateToolbar(e) {
            var $$ = this.ownerDocument.defaultView.$;
            var objDir = qux(childId)._private._objDir;
            var tid = this.qx$id;
            var tbar = objDir[tid];
            tbar.addClass('cms-toolbar-transformer');
            var tid = tbar.id();
            fullPid = childId + '_' + tid;
            bar = toolbars[fullPid];
            if (!bar) {
                return;
            }
            //3. get buttons
            var allButts = [];
            for(var bid in bar) {
                var fbid = '#'+childId+'_'+bid;
                var butt = objDir[bid];
                if (butt) {
                    if(!butt.hasClass('cms-wrapped')) {
                        var parentButt = butt.parent();
                        var parentClass = 'cms-wrapper-for-'+bid;
                        parentButt.addClass(parentClass);
                        butt.addClass('cms-wrapped');
                    }
                    allButts.push(butt);
                // } else {
                //     console.error('~~~~~~~~~~~Button not found',fbid);
                }
            }
            //4. sort buttons
            var expButts = [], popButts = [];
            for(var i in allButts) {
                var $b = allButts[i];
                var b = $b.storage();
                var arrow = isArrowButton($b);
                if (arrow) {
                    $b.addClass('cms-notxt').removeClass('cms-noimg');
                    var $img = $b.find('.qx-image');
                    var actualSrc = $img.attr('data-server-set-src');
                    if (!actualSrc) {
                        $img.attr('data-server-set-src',$b.attr('src'));
                        $img.attr('src',arrows[arrow]);
                    }
                    expButts.push($b);
                } else {
                    popButts.push($b);
                }
            }
            //5. show visible toolbar buttons
            //tbar.detach('.qx-aum-toolbar-button');
            toolbarHolder.detach('.qx-aum-toolbar-button');
            var more = toolbarHolder.find('.cms-button-more');
            for(var i in expButts) {
                expButts[i].insertBefore(more);
            }
            if (popButts.length > 0) {
                var group = $$();
                for (var i = 0; i < popButts.length; i++) {
                        group = group.add(popButts[i]);
                }
                group.enhanceWithin();
                moreMenu = $$('#p'+childId+'_'+tid);
                moreMenu.detach('.qx-aum-toolbar-button');
                moreMenu.append(group);
                more.css('display','block');
            } else {
                more.css('display','none');
            }
        }
        return {
            remove: function() {
                console.error('TOOLBAR DETACH',this.id());
                var $$ = this.getWindow().$;
                $$('html').removeClass('cms-toolbar-transformer');
                var tid = this.id();
                fullPid = childId + '_' + tid;
                bar = toolbars[fullPid];
                if (bar) {
                        delete toolbars[fullPid];
                }
                this.off('toolbarUpdated',updateToolbar);
                $$('#b'+childId+'_'+tid).remove();
                var moreMenu = $$('#p'+childId+'_'+tid);
                moreMenu.popup('destroy');
                moreMenu.remove();
                return true;
            },
            attach: function(to) {
                console.error('TOOLBAR ATTACH',this.id());
                var $$ = this.getWindow().$;
                initTitleAndToolbarHolder($$);
                $$('html').addClass('cms-toolbar-transformer');
                var tid = this.id();
                fullPid = childId + '_' + tid;
                bar = toolbars[fullPid];
                if (!bar) {
                        bar = toolbars[fullPid] = {};
                }
                // var buttons = this.find('.qx-aum-toolbar-button');
                // for(var i = 0; i < buttons.length; i++) {
                //         bar[$$(buttons[i]).id()] = true;
                // }
                var more = $$('<a id="b'+childId+'_'+tid+'" data-role="button" data-rel="popup" class="cms-button-more" style="display:none">More</a>');
                more.appendTo(toolbarHolder);
                var moreMenu = moreMenuGlobal = $$('<div data-role="popup" id="p'+childId+'_'+tid+'" class="qx-popup qx-popup-toolbar"/>').appendTo($$('body'));
                moreMenu.popup({
                    history: false,
//                                    transition: 'fade',
                    arrow: 't',
                    beforeposition: function(){
                        var w = 0,h = 0,popup = $(this);
                        var butts = popup.find('.qx-aum-toolbar-button');
                        var dim = calcPopupDimension(butts.length,popup);
                        popup.css(dim);
                    },
                });
                more.on('click',function(){
                    try{
                        moreMenu.popup("open",{positionTo: '#b'+childId+'_'+tid});
                    }
                    catch(e){
                        console.error("cannot open popup",e);
                    }
                });
                this.on('toolbarUpdated',updateToolbar);
                this.trigger('toolbarUpdated');
                return true;
            },
            prop: function(){return true;},
        };
    }
};

var titleAndToolbarHolder = null, toolbarHolder, titleHolder, moreMenuGlobal;
function initTitleAndToolbarHolder($) {
    if (titleAndToolbarHolder === null) {
        var existing = $('.cms-tito-holder');
        if (existing.length > 0) {
            titleAndToolbarHolder = existing;
        } else {
            titleAndToolbarHolder = $('<ul class="cms-tito-holder cms-increase-specificity"><li></li><li></li></ul>');
            $('#qx-t-c').prepend(titleAndToolbarHolder);
        }
        titleHolder = titleAndToolbarHolder.find('li:first-child');
        toolbarHolder = titleAndToolbarHolder.find('li:last-child');
    }
    return titleAndToolbarHolder;
}

/*querix.plugins.wrappers.title_transformer = {
    wrap: function(childId, el, sel) {
        return {
            remove: function() {
                var $$ = this.getWindow().$;
                initTitleAndToolbarHolder($$);
                titleHolder.html('');
                $$('html').removeClass('cms-title-transformer');
            },
            attach: function(to) {
                var $$ = this.getWindow().$;
                initTitleAndToolbarHolder($$);
                $$('html').addClass('cms-title-transformer');
                var qx = qux(childId);
                if(qx) {
                    this.css('display','none');
                    titleHolder.html(this.find('.qx-text').html());
                }
                return false;
            },
            prop: function(propertyName,propertyValue){
                console.error('~~~~~~~~~title_transformer',this,propertyName,propertyValue)
                return true;
            },
        };
    }
};*/

querix.plugins.wrappers.containermenu_transformer = {
    wrap: function(childId, el, sel) {
        return {
            remove: function() {
                var $$ = this.getWindow().$;
                //$$('html').removeClass('cmsfb');
                topbar.remove();
                this.parent().find('.cms-mainmenu-close').remove();
                this.removeClass('MENU-ITEM-TRANSFORMED');
            },
            attach: function(to) {
                var $$ = this.getWindow().$, cuscId = 'custom-scrollbar';
                $$('html').addClass('cmsfb');
/*                var doc = this.getWindow().document;
                if($('#'+cuscId).length == 0) {
                    var cusc = document.createElement('script');
                    cusc.id = cuscId;
                    cusc.src = querix.conf.server + querix.conf.pathPrefix + 'res/' + querix.conf.instance + '/' + querix.conf.progPath + 'extensions/cms-demo-redesign/'+cuscId+'.js';
                    cusc.type = 'text/javascript';
                    cusc.onload = function() {
                        console.error('~~~~~~~~~~~~custom-scrollbar.js loaded');
                    };
                    doc.body.appendChild(cusc);
                }
*/
                var $topbar = $$('#cms-topbar');
                if ($topbar.length == 0) {
                    topbar.attach();
                }
                this.find('a').on('click',function(){
                    $$('#qx-container-menu li').removeClass('menu-item-selected');
                    $$(this).parent().addClass('menu-item-selected');
                });
                this.addClass('MENU-ITEM-TRANSFORMED');
                var closeButton = this.parent().find('.cms-mainmenu-close');
                if (closeButton.length == 0) {
                    var closeButton = $$('<a class="cms-mainmenu-close"><i class="fa fa-close"/></a>');
                    closeButton.on('click',function(e){$$('#cms-button-mainmenu').trigger('click');})
                    this.parent().append(closeButton);
                }
                return true;
            },
            prop: function(){return true;}
        };
    }
};

querix.plugins.wrappers.formsearch_transformer = {
    wrap: function(childId, el, sel) {
        return {
            remove: function() {
                var $$ = this.getWindow().$;
                $$('html').removeClass('cms-formsearch-transformer');
            },
            attach: function(to) {
                var $$ = this.getWindow().$;
                $$('html').addClass('cms-formsearch-transformer');
                var qx = qux(childId);
                if(qx) {
                    this.detach();
                    this.find('.qx-text').attr('contenteditable','true').attr('placeholder','Search...');
                    $$('#cms-topbar > .cms-search-widget').empty().append(this);
                }
                return false;
            },
            prop: function(propertyName, propertyValue){
                return true;
            },
        };
    }
};

// querix.plugins.wrappers.table_transformer = {
//     wrap: function(childId, el, sel) {
//         return {
//             remove: function() {
//                 var $$ = this.getWindow().$;
//             },
//             attach: function(to) {
//                 var $$ = this.getWindow().$;
//                 var qx = qux(childId);
//                 return true;
//             },
//             prop: function(propertyName, propertyValue){
//                 console.error(this.id(),this.ty(),propertyName,' = ' ,propertyValue);
//                 return true;
//             },
//         };
//     }
// };

querix.plugins.wrappers.window_enumerator = {
    wrap: function(childId, el, sel) {
        var props = {};
        function initWindow($) {
            var winbo = this.closest('.qx-window-border');
            if (winbo.hasClass('cms-window-initialized')) {
                return;
            }
            //popup menu not closing automatically after click
            if (moreMenuGlobal) {
                moreMenuGlobal.popup('close');
            }
            var windowTitle = winbo.find('.qx-identifier-lbtitle:first .qx-text').html();
            var tito = $('.cms-tito-holder > li:first-child');
            tito.html(windowTitle);
            winbo.siblings('.qx-window-border').removeClass('cms-window-initialized');
            winbo.addClass('cms-window-initialized');
        }

        function releaseWindow($) {
            var winbo = this.closest('.qx-window-border');
            winbo.removeClass('cms-window-initialized');
        }

        // function centerWindow($,winbo) {
        //     var container,winbo,myd,cod;
        //     if ($('html').hasClass('qx-devicemode-desktop')) {
        //         container = this.closest('#qx-t-c');
        //     } else if ($('html').hasClass('qx-devicemode-tablet') || $('html').hasClass('qx-devicemode-mobile')) {
        //         container = this.closest('.qx-page.ui-page');
        //     }
        //     if (container.length == 0) {
        //         console.error('Unable to find window container',this,html);
        //         return;
        //     }
        //     var myd = {
        //         w: winbo.outerWidth(),
        //         h: winbo.outerHeight()
        //     };
        //     var cod = {
        //         w: container.outerWidth(),
        //         h: container.outerHeight(),
        //         offset: container.offset()
        //     };
        //     var css = {
        //         top: (cod.offset.top + (cod.h-myd.h)/2) + 'px',
        //         left: (cod.offset.left + (cod.w-myd.w)/2) + 'px',
        //     };
        //     winbo.css(css);
        // }

        return {
            remove: function() {
                var $$ = this.getWindow().$;
            },
            attach: function(to) {
                var $$ = this.getWindow().$;
                var qx = qux(childId);
                if (props.Identifier) {
                    this.closest('.qx-window-border').addClass('cms-border-of-'+props.Identifier);
                }
                //console.error(this.id(),'WINDOW ATTACH',this.closest('.qx-window-border'),props);
                return true;
            },
            prop: function(propertyName, propertyValue){
                var $$ = this.getWindow().$;
                props[propertyName] = propertyValue;
                //console.error(this.id(),this.ty(),propertyName,' = ' ,propertyValue);
                if (propertyName === 'HasFocus') {
                    if (propertyValue === true) {
                        return initWindow.call(this,$$);
                    } else {
                        return releaseWindow.call(this,$$);
                    }
                } else if (propertyName === 'Identifier') {
                    var i = [
                        'w_email_view',
                        'w_edit_email'
                    ].indexOf(propertyValue.toLowerCase());
                    if (i > -1) {
                        this.addClass('qx-c-cms-simple-window');
                    }
                }
                return true;
            },
        };
    }
};

})(querix);
