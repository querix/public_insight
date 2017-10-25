(function(querix){

var $ = querix.$;
var api = querix.plugins.api;

var get$ = function() {
    return window.top.$;
    //return api.getWindow(api.topWindow()).$;
};

var getPopup = function() {
    var widget, $$=get$();
    if (!widget) {
        widget = $$('#message-popup');
        if (!widget.length) {
            $$("body").mousedown(function() { doHide(); }).blur(function() { doHide(); });
            widget = $$('<div id="message-popup">')
	        .addClass("ui-tooltip ui-widget ui-corner-all ui-widget-content")
                .hide();
	    $$("<div>")
	        .addClass("ui-tooltip-content")
	        .appendTo(widget);
        }
        widget.appendTo("body");
    }
    return widget;
};

var posOptFor = function(fld) {
    var el = fld, $$=get$();
    if (fld.substr) {
        var prefix = ".qx-on-" + querix.childId;
        if (fld[0] !== "." && fld[0] !== "#" && fld[0] !== " ")
          el = prefix + ".qx-identifier-" + fld;
        else
          el = prefix + fld;
    }
    return {
        my: "center bottom-10",
        at: "center top",
        of: $$(el),
        using: function(position, feedback) {
            $$(this).css(position);
            $$("<div>")
                .addClass("arrow")
                .addClass(feedback.vertical)
                .addClass(feedback.horizontal)
                .appendTo(this);
        }
    };
};

var globalpos = {
    my: "right-20 top+20",
    at: "right top",
    of: "#qx-container-body"
};

var doHide = null;
var baseDoHide = doHide = function() {
    if (curTimeout) {
        clearTimeout(curTimeout);
        curTimeout = null;
    }
    var widget = get$()('#message-popup');
    if (widget)
        widget.fadeOut("slow");
};

var curTimeout = null;

var msgs = querix.plugins.frontCallModuleList.messages = {
    // shows a pop up with field related information
    // if timeout is specified will be displayed for the
    // amount in seconds, if it is 0
    // only manual hidding is available (via hide method)
    // it will hide all other open tooltips automatically
    showForId: function(fieldid, content, timeout) {
        getPopup().hide().html(content).fadeIn().position(posOptFor(fieldid));
        if (timeout > 0)
            curTimeout = setTimeout(doHide,timeout*1000);
    },
    // same as showForField but will be not bound to any field
    // it just will be shown in right-top corner
    showGlobal: function(content,timeout) {
        getPopup().hide().html(content).fadeIn().position(globalpos);
        if (timeout > 0)
            curTimeout = setTimeout(doHide,timeout*1000);
    },
    // hides all pop ups
    hide: doHide
};

var popup = querix.plugins.wrappers.popup = {
    wrap: function(childId,e, param) {
        var $$ = get$();
        var attached;
        var timeout = 0;
        var el = e;
		var location = {x:undefined,y:undefined};
        if (param) {
            if ($.isNumeric(param))
                timeout = param;
            else if (param.substr) {
                if (param[0] !== "." && param[0] !== "#" && param[0] !== " ")
                    param = ".qx-identifier-" + param;
                attached = ".qx-on-" + querix.childId + param;
            }
        }
        var txt = null;
        var visible = true;
        el.detach();
        var instance = {
            _show: function() {
                var w = getPopup();
                w.fadeIn();
                doHide = instance._hide;
                if (timeout > 0)
                    curTimeout = setTimeout(doHide,timeout*1000);
                var ael = get$()(attached);
				if (!(location.x === undefined || location.y === undefined) && ael.length) {
					/* As vlne explained, location is counted from left/top of rootcontainer*/
					var rc = ael.closest('.qx-identifier-rootcontainer');
					var offset = rc.offset();
					var pos = {
						my: 'left top',
						at: location.x + ' ' + location.y,
						of: rc,
						using: function() {
							var css = {
								left: (offset.left + parseInt(location.x)) + 'px',
								top: (offset.top + parseInt(location.y)) + 'px'
							};
							$(this).css(css);
						}
					};
					w.position(pos);
				}
                else if (ael.length)
                    w.position(posOptFor(ael));
                else
                    w.position(globalpos);
            },
            _hide: function() {
                doHide = baseDoHide;
                // signals the text of the element is empty, so
                // server will send next update even if the text's
                // value is the same
                api.setData(el,"");
                getPopup().fadeOut();
            },
            propLinkedTo: function(x) {
                attached = x;
            },
            propVisible: function(v) {
                visible = v;
                if (v)
                  instance._show();
                else
                  instance._hide();
                return false;
            },
            propText: function(v) {
                var w = getPopup();
                w.html(v);
                if (visible)
                    instance._show();
                return false;
            },
            propX: function(v) {
				location.x = v;
			},
            propY: function(v) {
				location.y = v;
			},
            prop: function(path,v) {
                var fun = instance["prop"+path];
                if (fun)
                    fun.call(this,v);
                return false;
            },
            attach: function() { return false; },
            remove: function(sel,to) {
            }
        };
        return instance;
    }
};

querix.plugins.wrappers.popuperror = {
    wrap: function(childId, el, param) {
        var inner = popup.wrap(childId,el,param),
            prevShow = inner._show,
            prevHide = inner._hide;
        inner._show = function() {
            getPopup().addClass("error");
            prevShow.call(this);
        };
        inner._hide = function() {
            getPopup().removeClass("error");
            prevHide.call(this);
        };
        return inner;
    }
};

querix.plugins.wrappers.displayatredir = {
    wrap: function(childId,el,param) {
        var x=null,y=null,wrapped,paramArr,
            buf = [], bLocation = false,
            update = function() {
                var i, cur, inner, j;
                if (wrapped)
                    return true;
                if (x === null || y === null)
                    return false;
                for (i = 0; i < paramArr.length; i++) {
                    cur = paramArr[i];
                    if (!bLocation) {
	                    if (cur.rows && $.inArray(y,cur.rows) === -1)
	                        continue;
	                    if (cur.cols && $.inArray(y,cur.cols) === -1)
	                        continue;
	                }
                    if (!wrapped) {
                        inner = querix.plugins.wrappers[cur.to.toLowerCase()];
                        if (!inner)
                            continue;
                        wrapped = inner.wrap(childId,el,cur.parameter);
                        if (!wrapped)
                            continue;
                        ux = querix.rjqui.toUnitsW(x);
                        uy = querix.rjqui.toUnitsH(y);
                        if (buf.length) {
                            for(j = 0; j < buf.length; j++) {
                                cur = buf[j];
                                wrapped.prop(cur.p,cur.v,ux,uy);
                            }
                            buf.length = 0;
                        }
                        return true;
                    }
                }
                return false;
            };
        try {
            paramArr = JSON.parse(param);
            if (!paramArr || !paramArr.length)
                return null;
        } catch(e) {
            console.error('no parse for:',param);
            return null;
        }
        return {
            prop: function(path,v) {
                var i, cur, inner;
                if (path === "GridItemLocation$GridX") {
                    x = v;
                    update();
                    return false;
                }
                if (path === "GridItemLocation$GridY") {
                    y = v;
                    update();
                    return false;
                }
                if (path === "Location$XCoord") {
                    x = v;
					ux = querix.rjqui.toUnitsW(x);
                    buf.push({p:'X',v:ux});
                    bLocation = true;
                    update();
                    return false;
                }
                if (path === "Location$YCoord") {
                    y = v;
					uy = querix.rjqui.toUnitsH(y);
                    buf.push({p:'Y',v:uy});
                    bLocation = true;
                    update();
                    return false;
                }

                if (update())
                    wrapped.prop(path,v,x,y);
                else
                    buf.push({p:path,v:v});
                return false;
            },
            attach: function(to) {
                return false;
            },
            remove: function(el,to) {
            }

        };
    }
};

querix.plugins.wrappers.console = {
    wrap: function(childId,el,param) {
        return {
            propText: function(v) {
            },
            prop: function(n,v,x,y) {
                if (n === "Text")
                    querix.rjqui.textConsole.append("AT " + x + ", " + y + ":" + v,function(){});
            },
            attach: function() { return false; }
        };

    }
};

/* attaches the element to some different DOM node */
querix.plugins.wrappers.attachto = {
    wrap: function(childId,el,sel) {
        return {
            attach: function(to) {
                get$()(sel).children().detach().end().html(el.qx$outer());
                return false;
            },
            propContent: function(v) {
                el.children().detach().end().html(v);
            },
            prop: function(path,v) {
                var fun = instance["prop"+path];
                if (fun)
                    fun.call(this,v);
                return false;
            }
        };
    }
};

/* moves text from an element to DOM element specified in Parameter */
querix.plugins.wrappers.textto = {
    wrap: function(childId,el,sel) {
        var instance = {
            propText: function(v) {
                get$()(sel).children().detach().end().text(v);
            },
            propVisible: function(v) {
                if (!v)
                  get$()(sel).text("");
            },
            propCollapsed: function(v) {
                if (!v)
                    get$()(sel).text("");
            },
            prop: function(path,v) {
                var fun = instance["prop"+path];
                if (fun)
                    fun.call(this,v);
                return false;
            }
        };
		return instance;
    }
};

})(querix);
