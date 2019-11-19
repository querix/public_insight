/**
 * containermenu_transformer - modifies left-side menu and adds topbar
 */
if (window.top.document.querySelector('html.qx-jquery-ui')) {
  (function (querix) {
    var setDeviceDependentClasses = function () {
      var $ = window.top.$;
      var root = $('html');
  
      if (root.hasClass('qx-target-web') && root.hasClass('qx-target-tablet')) {//tablet mode forced on web
        root.addClass('qx-devicemode-tablet');
        return;
      } else if (root.hasClass('qx-target-web') && root.hasClass('qx-target-mobile')) {//phone mode forced on web
        root.addClass('qx-devicemode-phone');
        return;
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
  
    var topbar = (function () {
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
  
      function setCss(el, name, value) {
        if (value === 'do not change') {
          return;
        } else {
          if (typeof value == 'function') {
            el.css(name, value());
          } else {
            el.css(name, value);
          }
        }
      }
  
      function addStylesheet($, id, styles) {
        var stylesheet = $('<style id="' + id + '" type="text/css"/>').append(styles);
        var head = $('head');
        head.remove('#' + id);
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
            menuWidth: function () {
              if (window.top.innerWidth > 300) {
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
            setCss(cm, 'width', sp['menuWidth']);
            setCss(cm, 'min-width', sp['menuWidth']);
            setCss(tb, 'padding-left', sp['topbarPadding']);
            topmost.addClass('cms-mainmenu-visible');
          } else {
            cm.css('width', '1px');
            cm.css('min-width', '1px');
            tb.css('padding-left', 0);
            topmost.removeClass('cms-mainmenu-visible');
          }
          var topqx = window.top.querix;
          for (var i in topqx.children) {
            childqx = topqx.children[i].root;
            childqx.rjqui.signalWindowResize();
          }
          topqx.rjqui.signalWindowResize();
        }
        topbar.find('#cms-button-mainmenu').on('click', toggleMainmenu);
        topbar.find('#lbValueUserName').on('click', function () {
        });
        $('body').remove('#cms-topbar').append(topbar);
      }
  
      return {
        remove: function () {
          if (topbarInstalled) {
            window.top.$('#cms-topbar').remove();
          }
        },
        attach: function (to) {
          var $ = window.top.$;
          if ($('#cms-topbar').length == 0) {
            addTopbar($);
            topbarInstalled = true;
          }
          return true;
        },
        prop: function (propertyName, propertyValue) {
          return true;
        },
      };
    })();
  
    querix.plugins.wrappers.containermenu_transformer = {
      wrap: function (childId, el, sel) {
        var $$ = el[0].ownerDocument.defaultView.$;
        !$$('html').hasClass('cmsfb') && $$('html').addClass('cmsfb');
        var cuscId = 'custom-scrollbar';
        var $topbar = $$('#cms-topbar');
        if ($topbar.length == 0) {
          topbar.attach();
        }
  
        return {
          remove: function () {
            var $$ = this.getWindow().$;
            topbar.remove();
            this.parent().find('.cms-mainmenu-close').remove();
            this.removeClass('MENU-ITEM-TRANSFORMED');
          },
          attach: function (to) {
            this.find('a').on('click', function () {
              $$('#qx-container-menu li').removeClass('menu-item-selected');
              $$(this).parent().addClass('menu-item-selected');
            });
            this.addClass('MENU-ITEM-TRANSFORMED');
            var closeButton = this.parent().find('.cms-mainmenu-close');
            if (closeButton.length == 0) {
              var closeButton = $$('<a class="cms-mainmenu-close"><i class="fa fa-close"/></a>');
              closeButton.on('click', function (e) { $$('#cms-button-mainmenu').trigger('click'); })
              this.parent().append(closeButton);
            }
            return true;
          },
          prop: function () { return true; }
        };
      }
    };
  
  })(querix);
} else {
  DBG('>>>transformers.js Not applicable');
}
