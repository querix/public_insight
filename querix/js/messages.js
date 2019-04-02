(function (querix) {
  /** LOAD messages.css */
  var d = window.top.document;
  var src = d.currentScript ? d.currentScript.src : null;
  if (src) {
    src = src.substring(0, src.length-3) + '.css';
    var selector = 'link#qx-messages-js';
    if (d.querySelector(selector) === null) {
      var l = d.createElement('link');
      l.setAttribute('id', 'qx-messages-js');
      l.setAttribute('rel', 'stylesheet');
      l.setAttribute('href', src);
      d.head.appendChild(l);
    }
  }
  /**BEGIN VDOM PLUGINS */
  if (window.top.document.querySelector('.qx-vdom')) {
    var CONST_IGNORE_WIDGET_INVISIBILITY = true;

    var findByIdentifier = function (qx, identifier) {
      return qx.r2v.registry().filter(function filterByIdentifier(x) {
        return x.bareValue && x.bareValue('Identifier') === identifier;
      });
    }
    var findByClassName = function (qx, className) {
      var allWidgets = qx.r2v.registry();
      return allWidgets.filter(function filterByIdentifier(x) {
        var result;
        if (x.hasClass !== undefined) {
          result = x.hasClass(className);
        } else {
          result = false;
        }
        return result;
      });
    }
    var parseTarget = function (t) {
      var result = {};
      var parts = (t || '').split('.');
      result.window = parts.length > 1 ? parts[0] : null;
      var at = parts.length > 1 ? parts[1] : parts[0];
      if (at) {
        var arrat = at.split('_');
        arrat.shift();
        result.row = parseInt(arrat[0]) || undefined;
        result.col = parseInt(arrat[1]) || undefined;
      }
      return result;
    }
    var parseRedirList = function (str) {
      var result;
      try {
        result = JSON.parse(str);
      } catch (err) {
        console.error('Cannot parse parameter for displayAtRedir wrapper', err, str);
        result = {};
      }
      return result;
    }
    /**
     * @param {Array of redirect info definitions} redirList 
     * @param {window id, row, col to find the match with} target 
     * @returns {First matching redirect info definition}
     */
    var findRedirInfo = function (redirList, target) {
      var result = redirList.reduce(function (acc, info) {
        if (!acc) {
          var rowMatch = !info.rows || info.rows.indexOf(target.row) > -1;
          var colMatch = !info.cols || info.cols.indexOf(target.col) > -1;
          if (rowMatch && colMatch) {
            acc = info;
          }
        }
        return acc;
      }, null);
      return result;
    }
    var getWrapperInfo = function(x, overrides, flag) {
      var result;
      if (x) {
        var bProceed = (flag == CONST_IGNORE_WIDGET_INVISIBILITY) || x.isVisible();
        if (bProceed) {
          if (overrides && overrides.Wrapper) {
            result = overrides.Wrapper;
          } else {
            result = x.bareValue('Wrapper');
          }
        }
      }
      return result;
    }

    var getPopupTargetBounds = function(param) {
      var element, selector, timeout, result = null;
      if (param) {
        timeout = parseInt(param);
        if (isNaN(timeout)) {
          try{
            selector = (param[0] == '.' || param[0] == '#' || param[0] == '[') ? param : '.qx-identifier-' + param;
            element = window.top.document.querySelector(selector);
            if (element) {
              result = element.getBoundingClientRect();
            }
          } catch(err) {
            console.error('getPopupPosition parameter:',param,'error:',err);
          }
        }
      }
      if (!result) {
        var left = (window.top.document.body.offsetWidth - 110),
        result = {
          left: left,
          right: left,
          width: 0,
          height: 0,
          top: 50,
          bottom: 50
        }
      }
      return result;
    }

    var getPopupPosition = function(param) {
      var result;
      var boundingRect = getPopupTargetBounds(param);
      if (boundingRect) {
        /**
         * On bottom of the element (Material Design style)
         */
        result = {
          top: (boundingRect.bottom + 10) + 'px',
          right: 'auto',
          bottom: 'auto',
          left: (boundingRect.left + 10) + 'px'
        }
      }
      if (!result) {
        result = {
          top: '50px',
          right: '50px',
          bottom: 'auto',
          left: 'auto'
        }
      }
      return result;
    }

    var getPopupTimeout = function(param) {
      var result;
      var timeout = parseInt(param);
      if (!isNaN(timeout)) {
        result = timeout * 1000;
      }
      return result;
    }

    var applyPopupListeners = function(bAdd, handler) {
      var method = bAdd ? 'addEventListener' : 'removeEventListener';
      window.top[method]('mousedown', handler);
      window.top[method]('keydown', handler);
      window.top[method]('mousewheel', handler);
    }

    var effect = function(dom, targetBounds, time, scaleFrom, scaleTo, opacityFrom, opacityTo, finalizeFunc) {
      time = time || 150;
      scaleFrom = scaleFrom || 0;
      scaleTo = scaleTo || 1;
      opacityFrom = opacityFrom || 0;
      opacityTo = opacityTo || 1;
      var timeStep = time/5, opacityStep = (opacityTo - opacityFrom)/5, scaleStep = (scaleTo - scaleFrom)/5;
      var curTime = 0, curOpacity = opacityFrom, curScale = scaleFrom;
      dom.style.opacity = curOpacity;
      dom.style.transform = 'scale(' + curScale + ')';
      dom.style.top = (targetBounds.bottom + 10) + 'px';
      var iteration = function() {
        if (curTime >= time) {
          return finalizeFunc ? finalizeFunc() : true;
        } else {
          curTime += timeStep, curOpacity += opacityStep, curScale += scaleStep;
          return new Promise(function(resolve) {
            setTimeout(function() {
              var left = targetBounds.left + targetBounds.width/2 - dom.offsetWidth/2;
              dom.style.left = left + 'px';
              dom.style.transform = 'scale('+(curScale > scaleTo ? scaleTo : curScale)+')';
              dom.style.opacity = curOpacity > opacityTo ? opacityTo : curOpacity;
              resolve(iteration());
            }, timeStep);
          });
        }
      }
      Promise.resolve(true).then(iteration);
    }

    var justifyAndAnimatePopup = function(dom, targetBounds, popupTimeout, destroyPopup) {
      effect(dom, targetBounds);
      if (popupTimeout) {
        var fadeOut = effect.bind(null, dom, targetBounds, 75, 1, 0, 1, 0, destroyPopup);
        new Promise(function(resolve){
          setTimeout(function(){
            fadeOut(50);
            resolve(true);
          }, popupTimeout);
        })
      }
    }

    var createWidgetPlaceholder = function(reactCtx, children) {
      var x = reactCtx.ctx();
      var props = {
        key: reactCtx.qxKey(),
        ref: reactCtx.setRef,
        style: {
          display: 'none'
        },
        className: 'qx-wrapped-placeholder qx-wrapper-'+(x.bareValue('Wrapper') || {}).Name || 'unknown',
        'data-id': x.id(),
        'data-child-id': x.qx.childId
      }
      return x.qx.vspec.React.createElement('i', props, children);
    }
    /**
     * displayAtRedir plugin
     * 1. Obtains array of 'redirects' to other plugins
     * 2. 'Redirect' is an object of such format:
     *    {
     *      rows: Array of numbers,
     *      cols: Array of numbers,
     *      to: Name of the actual plugin to apply to the widget,
     *      parameter: Parameter of the actual plugin
     *    }
     * 3. displayAtRedir compares row/col of the 'Target' value (sent by the server)
     *    with rows/cols of the 'redirect' definitions
     * 4. If matching 'redirect' definition found, the plugin denoted in the 'to' field
     *    is applied
     */
    querix.plugins.wrappers.displayatredir = {
      render: function () {
        var result;
        var x = this.ctx();
        var overrides = (arguments || [])[0] || {};
        var info = getWrapperInfo(x, overrides, CONST_IGNORE_WIDGET_INVISIBILITY);
        if (info && info['Name'] && info['Parameter']) {
          var redirList = parseRedirList(info['Parameter']);
          var target = parseTarget(x.bareValue('Target'));
          var redirInfo = findRedirInfo(redirList, target);
          if (redirInfo) {
            var actualPlugin = querix.plugins.wrappers[(redirInfo.to || '').toLowerCase()];
            if (actualPlugin) {
              var actualPluginInfo = {
                Wrapper: {
                  Name: redirInfo.to,
                  Parameter: redirInfo.parameter
                }
              }
              result = actualPlugin.render.call(this, actualPluginInfo);
            }
          }
        }
        if (!result) {
          result = createWidgetPlaceholder(this);
        }
        return result;
      }
    }

    /**
     * Plugin 'popup'
     * 1. Finds first matching widget
     * 2. Shows tooltip under the widget with the 'Text' of the wrapped widget
     * 3. 'Parameter' may contain
     * a) either selector of some widget (or another place in the real DOM) to show tooltip near it
     * b) or timeout in seconds
     * Search for the matches is performed in the real DOM (not in models, as 'textTo' widget performs search)
     */
    querix.plugins.wrappers.popup = {
      render: function () {
        var result;
        var x = this.ctx();
        var overrides = (arguments || [])[0] || {};
        var bDisposed = x.getMemoizedValue('qx$WrapperPopup') == 'disposed';
        var info = getWrapperInfo(x, overrides);
        if (info && !bDisposed) {
          var text = x.bareValue('Text');
          var reactCtx = this;
          var key = this.qxKey() + '-popup-portal';
          // var position = getPopupPosition(info['Parameter']);
          var augmentClasses = overrides.className || [];
          augmentClasses = augmentClasses.unshift === undefined ? String(augmentClasses).split(' ') : augmentClasses;
          augmentClasses.unshift('qx-messages-popup');
          var props = {
            key: key,
            id: 'message-popup',
            ref: function(dom) {
              var destroyPopup = function() {
                applyPopupListeners(false, destroyPopup)
                x.setMemoizedValue('qx$WrapperPopup', 'disposed');
              }
              if (dom) {
                applyPopupListeners(true, destroyPopup);
                justifyAndAnimatePopup(dom, getPopupTargetBounds(info['Parameter']), getPopupTimeout(info['Parameter']), destroyPopup);
              } else {
                applyPopupListeners(false, destroyPopup)
              }
            },
            className: augmentClasses.join(' '),
            style: {
            }
          }
          // Object.assign(props.style, position);
          result = x.qx.vspec.ReactDOM.createPortal(
            x.qx.vspec.React.createElement('div', props, text),
            x.qx.ownerWindow.document.querySelector('#qx-portal-mount-root')
          );
        }
        return createWidgetPlaceholder(this, result);
      }
    }

    /**
     * Plugin 'popupError'
     * Reuses 'popup', just adds class 'qx-messages-popup-error'
     */
    querix.plugins.wrappers.popuperror = {
      render: function () {
        var overrides = (arguments || [])[0] || {};
        overrides.className = overrides.className ? overrides.className : [];
        overrides.className.push('qx-messages-popup-error');
        return querix.plugins.wrappers.popup.render.apply(this, [overrides]);
      }
    }

    /**
     * Plugin 'console' appends text of the widget to the text console
     */
    querix.plugins.wrappers.console = {
      render: function () {
        var result;
        var x = this.ctx();
        var overrides = (arguments || [])[0] || {};
        var bDisposed = x.getMemoizedValue('qx$WrapperConsole') == 'disposed';
        var info = getWrapperInfo(x, overrides, CONST_IGNORE_WIDGET_INVISIBILITY);
        if (!bDisposed && info) {
          var text = x.bareValue('Text');
          var target = parseTarget(x.bareValue('Target'));
          if (target.row && target.col) {
            text = 'AT '+target.row+','+target.col+': '+text;
          }
          x.qx.vspec.textConsole.append(text);
          x.setMemoizedValue('qx$WrapperConsole', 'disposed');
        }
        if (!result) {
          result = createWidgetPlaceholder(this);
        }
        return result;
      }
    }

    /**
     * Plugin 'textTo'
     * 1. Finds all matching widgets 
     * 2. Replaces 'Text' value in the widget model with 'Text' of the wrapped widget
     * Search for the matches is performed:
     * - by CSS class name - if 'Parameter' field of the plugin definition starts with dot '.'
     * - by 'Identifier' field of the widget otherwise
     * Note: since destructive approach of the textTo for V7 is not acceptable for VDOM,
     * plugin doesn't support(directly) the selectors which 'penetrate' into the structure
     * of the widget to be modified. For example, '.qx-identifier-id1 .qx-text' is not supported.
     * For the compatibility with V7 the plugin will truncate such selector to '.qx-identifier-id1'
     */
    querix.plugins.wrappers.textto = {
      render: function () {
        var result;
        var x = this.ctx();
        var overrides = (arguments || [])[0] || {};
        var bDisposed = x.getMemoizedValue('qx$WrapperTextto') == 'disposed';
        var info = getWrapperInfo(x, overrides);
        if (!bDisposed && info && info['Name'] && info['Parameter']) {
          var selector = info['Parameter'] || '';
          var childId = x.qx.childId;
          var doc = x.qx.ownerWindow.document;
          var text = x.bareValue('Text');
          var method;
          if (selector[0] === '.') {
            method = findByClassName;
            if (selector.indexOf('.qx-text') > -1) {
              selector = selector.replace('.qx-text', '').trim();
            }
            if (selector.indexOf(' ') > -1) {
              selector = selector.split(' ').shift();
            }
            selector = selector.substring(1);
          } else {
            method = findByIdentifier;
          }
          DBG('!!!MESSAGES.TEXTTO', selector, text);
          method(x.qx, selector)
          .forEach(function (x) {
            x.qx.rcomms.bare('Text').touchPropagate(text, x);
          });
          x.setMemoizedValue('qx$WrapperTextto', 'disposed')
        }
        return createWidgetPlaceholder(this);
      }
    }

    /**
     * In best case attachto is the destructive version of the textto.
     * For the compatibility with messages.js-v7 we just reuse 'textTo' plugin instead
     */
    querix.plugins.wrappers.attachto = {
      render: function () {
        return querix.plugins.wrappers.textto.render.apply(this, arguments);
      }
    }

    var msgs = querix.plugins.frontCallModuleList.messages = {
      showForId: function (fieldid, content, timeout) {
        var popupId = 'message-popup';
        var d = window.top.document;
        var prevPopupInstance = d.querySelector('#'+popupId);
        prevPopupInstance && d.body.removeChild(prevPopupInstance);
        var targetBounds = getPopupTargetBounds(fieldid);
        var dom = d.createElement('div');
        dom.setAttribute('id', popupId);
        dom.classList.add('qx-messages-popup');
        dom.innerHTML = content;
        d.body.appendChild(dom);
        var bFirstCall = true;
        var destroyPopup = function() {
          if (bFirstCall) {
            applyPopupListeners(false, destroyPopup)
            d.body.removeChild(dom);
            bFirstCall = false;
          }
        }
        applyPopupListeners(true, destroyPopup);
        justifyAndAnimatePopup(dom, targetBounds, getPopupTimeout(timeout), destroyPopup);
      },
      showGlobal: function (content, timeout) {
        msgs.showForId(null, content, timeout);
      }
    }
    return;
  }
  /**END VDOM PLUGINS */


  var $ = querix.$;
  var api = querix.plugins.api;

  var get$ = function (el) {
    try {
      if (el) {
        return el.getWindow().$;
      } else {
        return window.top.$;
        // return api.getWindow(api.topWindow()).$;
      }
    } catch (e) {
      if (console) {
        console.error('(Cannot get jQuery object of the top window', e.stack);
      }
      return null;
    }
  };

  var checkUnset = function (value, defaultValue) {
    if (typeof value === 'object' &&
      (value === querix.reactive.unset || value === querix.reactive.undef)) {
      return defaultValue;
    }
    return value;
  }

  function messagejs_onMouseDown() {
    doHide();
    var $$ = get$();
    if ($$ == null) {
      return;
    }
    $$("body").off("mousedown", messagejs_onMouseDown);
    $$("body").off("blur", messagejs_onMouseDown);
    $$("body").off("keydown", messagejs_onMouseDown);
  }

  var getPopup = function ($$) {
    var widget;
    if (!widget) {
      widget = $$('#message-popup');
      if (!widget.length) {
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

  var posOptFor = function (fld, $$) {
    var el = fld;
    /**
     *  Workaround for problem(bug?) with jQuery.setOffset():
     *  it obtains
     *  a) actual position of element
     *  b) position of element set in CSS
     *  and calculates resulting position as
     *  ( options.top - actualPosition.top ) + cssTop;
     *  If element has display:none or detached from DOM tree,
     *  but has CSS properties top/left set, result is incorrect.
     */
    var widget = $$('#message-popup');
    widget.css({ display: 'block' });
    if (fld.substring && fld === 'globalpos') {
      return globalpos;
    }
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
      collision: 'fit',
      using: function (p, feedback) {
        $$(this).css(p);
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
    of: "#qx-container-body",
    collision: 'fit'
  };

  var doHide = null;
  var baseDoHide = doHide = function () {
    if (curTimeout) {
      clearTimeout(curTimeout);
      curTimeout = null;
    }
    var $$ = get$();
    if ($$ == null) {
      return;
    }
    var widget = $$('#message-popup');
    if (widget) {
      widget.fadeOut("slow");
    }
  };

  var curTimeout = null;
  var msgs = querix.plugins.frontCallModuleList.messages = {
    // shows a pop up with field related information
    // if timeout is specified will be displayed for the
    // amount in seconds, if it is 0
    // only manual hidding is available (via hide method)
    // it will hide all other open tooltips automatically
    showForId: function (fieldid, content, timeout) {
      var $$ = get$();
      $$("body").on("mousedown", messagejs_onMouseDown);
      $$("body").on("blur", messagejs_onMouseDown);
      $$("body").on("keydown", messagejs_onMouseDown);
      getPopup($$).hide().html(content).fadeIn().position(posOptFor(fieldid, $$));
      if (timeout > 0)
        curTimeout = setTimeout(doHide, timeout * 1000);
    },
    // same as showForField but will be not bound to any field
    // it just will be shown in right-top corner
    showGlobal: function (content, timeout) {
      var $$ = get$();
      $$("body").on("mousedown", messagejs_onMouseDown);
      $$("body").on("blur", messagejs_onMouseDown);
      getPopup($$).hide().html(content).fadeIn().position(posOptFor('globalpos', $$));
      if (timeout > 0)
        curTimeout = setTimeout(doHide, timeout * 1000);
    },
    // hides all pop ups
    hide: doHide
  };

  var popup = querix.plugins.wrappers.popup = {
    wrap: function (childId, e, param) {
      var wrappedElement;
      var attached;
      var timeout = 0;
      var el = e;
      var location = { x: undefined, y: undefined };
      if (param) {
        if ($.isNumeric(param)) {
          timeout = param;
          attached = '.qx-identifier-rootcontainer';
        }
        else if (param.substr) {
          if (param[0] !== "." && param[0] !== "#" && param[0] !== " ")
            param = ".qx-identifier-" + param;
          attached = ".qx-on-" + querix.childId + param;
        }
      } else {
        attached = '.qx-identifier-rootcontainer';
      }
      var txt = null;
      var visible = true;
      el.detach();
      var instance = {
        _show: function (bError) {
          var $$ = get$(e);
          if ($$ == null) { return; }
          var w = getPopup($$);
          if (!w || !w.length || !w[0].textContent || !w[0].textContent.trim().length === 0) {
            return;
          }
          if (bError) {
            w.addClass("error");
          } else {
            w.removeClass("error");
          }
          w.fadeIn();
          doHide = instance._hide;
          if (timeout > 0)
            curTimeout = setTimeout(doHide, timeout * 1000);
          var ael = $$(attached && attached.vdom ? attached.domElement : attached);
          if (!(location.x === undefined || location.y === undefined) && ael.length == 0) {
            var rc = wrappedElement.closest('.qx-identifier-rootcontainer');
            if (rc.length == 0) {
              rc = $$('body');
            }
            var offset = rc.offset();
            var pos = {
              my: "center bottom-10",
              // my: 'left top',
              at: location.x + ' ' + location.y,
              of: rc,
              collision: 'fit',
              using: function () {
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
            w.position(posOptFor(ael, $$));
          else
            w.position(globalpos);
          $$("body").on("mousedown", messagejs_onMouseDown);
          $$("body").on("blur", messagejs_onMouseDown);
        },
        _hide: function () {
          var $$ = get$(e);
          if ($$ == null) { return; }
          doHide = baseDoHide;
          // signals the text of the element is empty, so
          // server will send next update even if the text's
          // value is the same
          api.setData(el, "");
          getPopup($$).fadeOut(50);
        },
        propLinkedTo: function (x) {
          attached = checkUnset(x);
        },
        propWrappedElement: function (x) {
          wrappedElement = x;
        },
        propVisible: function (v) {
          visible = v;
          if (v) {
            instance._show();
          }
          else {
            instance._hide();
          }
          return false;
        },
        propText: function (v) {
          var $$ = get$(e);
          if ($$ == null) { return; }
          var w = getPopup($$);
          w.html(v);
          if (visible) {
            instance._show();
          }
          return false;
        },
        propX: function (v) {
          location.x = v;
        },
        propY: function (v) {
          location.y = v;
        },
        prop: function (path, v) {
          var fun = instance["prop" + path];
          if (fun)
            fun.call(this, v);
          return false;
        },
        attach: function () { return false; },
        remove: function (sel, to) {}
      };
      return instance;
    }
  };

  querix.plugins.wrappers.popuperror = {
    wrap: function (childId, el, param) {
      var inner = popup.wrap(childId, el, param),
        prevShow = inner._show,
        prevHide = inner._hide;
      inner._show = function () {
        var $$ = get$(el);
        if ($$ == null) { return; }
        prevShow.call(this, true);
      };
      inner._hide = function () {
        var $$ = get$(el);
        if ($$ == null) { return; }
        prevHide.call(this);
      };
      return inner;
    }
  };

  querix.plugins.wrappers.displayatredir = {
    wrap: function (childId, el, param) {
      var x = null, y = null, wrapped, paramArr,
        locationX = null, locationY = null,
        buf = [{ p: 'WrappedElement', v: el }], bLocation = false,
        update = function () {
          var i, cur, inner, j;
          if (wrapped)
            return true;
          if (x === null || y === null || locationX === null || locationY === null) {
            return false;
          }
          for (i = 0; i < paramArr.length; i++) {
            cur = paramArr[i];
            if (!bLocation) {
              if (cur.rows && $.inArray(y, cur.rows) === -1)
                continue;
              if (cur.cols && $.inArray(x, cur.cols) === -1)
                continue;
            }
            if (!wrapped) {
              inner = querix.plugins.wrappers[cur.to.toLowerCase()];
              if (!inner)
                continue;
              wrapped = inner.wrap(childId, el, cur.parameter);
              if (!wrapped)
                continue;
              if (buf.length) {
                var ptext = buf.filter(function(c){
                  return c.p === 'Text';
                }).pop();
                var pother = buf.filter(function(c){
                  return c.p !== 'Text';
                });
                console.error('>>>wrap',ptext, pother);
                for (j = 0; j < buf.length; j++) {
                  cur = buf[j];
                  wrapped.prop(cur.p, cur.v);
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
      } catch (e) {
        console.error('no parse for:', param);
        return null;
      }
      return {
        prop: function (path, v) {
          var i, cur, inner;
          if (path === "Location$XCoord") {
            locationX = querix.rjqui.toUnitsW(v);
            buf.push({ p: 'X', v: locationX });
            update();
            return false;
          }
          if (path === "Location$YCoord") {
            locationY = querix.rjqui.toUnitsH(v);
            buf.push({ p: 'Y', v: locationY });
            update();
            return false;
          }
          /**
           *    As per vlne explanation(2016-10-31)
           *    1. Target contains row/col from 4gl statement 'DISPLAY 'message' AT <row>,<col>'
           *    in format <window_id>.AT_<row>_<col>
           *    2. Location, GridItemLocation are not needed
           */

          if (path === "Target") {
            var arr = /^.*\.AT_(\d+)_(\d+)/.exec(v);
            y = parseInt(arr[1]);
            x = parseInt(arr[2]);
            bLocation = false;
            buf.push({ p: 'AT', v: { X: x, Y: y } });
            update();
            return false;
          }

          if (update())
            wrapped.prop(path, v, x, y);
          else
            buf.push({ p: path, v: v });
          return false;
        },
        attach: function (to) {
          return false;
        },
        remove: function (el, to) {
        }

      };
    }
  };

  querix.plugins.wrappers.console = {
    wrap: function (childId, el, param) {
      var pText = null, pAt = null, prevText;
      return {
        prop: function (n, v, x, y) {
          if (n === "Text" && v != prevText && x != null && y != null) {
            querix.rjqui.textConsole.append('AT ' + x + ',' + y + ': ' + v, function () { });
            prevText = v;
            pText = pAt = null;
            return;
          } else {
            if (n === "Text" && v != prevText) {
              pText = v;
            } else if (n === "AT") {
              pAt = v;
            }
            if (pText && pAt) {
              querix.rjqui.textConsole.append('AT ' + pAt.X + ',' + pAt.Y + ': ' + pText, function () { });
              prevText = pText;
              pText = pAt = null;
            }
          }
        },
        attach: function () { return false; }
      };

    }
  };

  /* attaches the element to some different DOM node */
  querix.plugins.wrappers.attachto = {
    wrap: function (childId, el, sel) {
      var isAttached = false;
      var instance = {
        attach: function (to) {
          var $$ = get$(el);
          if ($$ == null) { return; }
          $$(sel).children().detach().end().html(el.qx$outer());
          isAttached = true;
          return false;
        },
        propContent: function (v) {
          if (!isAttached) {
            this.attach();
          }
          var x = el.children().detach().end();
          x.html(v);
        },
        propText: function (v) {
          instance.propContent(v);
        },
        prop: function (path, v) {
          var fun = instance["prop" + path];
          if (fun) {
            fun.call(this, v);
            return false;
          }
          return true;
        }
      };
      return instance;
    }
  };

  /* moves text from an element to DOM element specified in Parameter */
  querix.plugins.wrappers.textto = {
    wrap: function (childId, e, sel) {
      function setTextTo($collection, t) {
        $collection.each(function (i, el) {
          var $$ = get$(e);
          if ($$ == null) { return; }
          var $el = $$(el);
          var tagName = $el[0].tagName;
          if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
            $el.val(t);
          } else {
            $el.text(t);
          }
        });
      }
      var instance = {
        propText: function (v) {
          var $$ = get$(e);
          if ($$ == null) { return; }
          setTextTo($$(sel), v);
        },
        propVisible: function (v) {
          if (!v) {
            var $$ = get$(e);
            if ($$ == null) { return; }
            setTextTo($$(sel), '');
          }
        },
        propCollapsed: function (v) {
          if (!v) {
            var $$ = get$(e);
            if ($$ == null) { return; }
            setTextTo($$(sel), '');
          }
        },
        prop: function (path, v) {
          var fun = instance["prop" + path];
          if (fun)
            fun.call(this, v);
          return false;
        }
      };
      return instance;
    }
  };

})(querix);
