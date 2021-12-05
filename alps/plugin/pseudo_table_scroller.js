/**
 *  Copyright 2021 Querix Ltd
 *  Released under the MIT license.
 *
 *	Plugin for HCL pseudo tables
 *  4GL code to load:
 *  CALL ui.interface.frontcall("html5","scriptImport",["/public/alps/plugin/pseudo_table_scroller.js","nowait"],[])
 */
/**
 * Application may exit during script load,
 * so we checking if it exists
 */
(window.querix && !window.querix.exitInProgress) && (function (querix) {
  var ownerWindow = querix.ownerWindow;
  var d = ownerWindow.document;
  if (d.querySelector('.qx-vdom')) {
    var ID_PLUGIN = 'pseudo-table-scroller';
    var ATTR_PLUGIN = 'data-' + ID_PLUGIN;
    var keyCodes = {
      ArrowDown: 0x28,
      ArrowUp: 0x26,
      F3: 0x72,
      F4: 0x73
    }
    var xWindow;
    /** LOAD css */
    var src;
    if (d.currentScript) {
      src = d.currentScript.src;
      src = src.substring(0, src.length-3) + '.css';
    } else {
      src = querix.comms.fromQUrl('pseudo_table_scroller.css');
    }
    var selector = 'link#' + ID_PLUGIN;
    if (d.querySelector(selector) === null) {
      var l = d.createElement('link');
      l.setAttribute('id', ID_PLUGIN);
      l.setAttribute('rel', 'stylesheet');
      l.setAttribute('href', src);
      d.head.appendChild(l);
    }

    var onMouseDown = function onMouseDown(e) {
      console.error('>>>plugin.onMouseDown', e.target);
      var b = e.target.closest('button');
      if (b) {
        e.stopPropagation();
        e.preventDefault();
        var action = b.getAttribute('data-action');
        var which = keyCodes[action];
        var keyInfo = {
          bubbles: true,
          key: action,
          code: action,
          keyCode: which,
          which: which
          // "code", optional and defaulting to "", of type DOMString, that sets the value of KeyboardEvent.code.
          // "charCode", optional and defaulting to 0, of type unsigned long, that sets the value of the deprecated KeyboardEvent.charCode.
          // "keyCode", optional and defaulting to 0, of type unsigned long, that sets the value of the deprecated KeyboardEvent.keyCode.
          // "which", optional and defaulting to 0, of type unsigned long, that sets the value of the deprecated KeyboardEvent.which.          
        }
        var ke = new KeyboardEvent('keydown', keyInfo);
        e.target.closest('.qx-aum-abstract-container').dispatchEvent(ke);
        
      }
    }

    var convertIntoButtonPanel = function convertIntoButtonPanel(x) {
      var d = x.ownerDocument;
      x.querySelector('.thumb').style.display = 'none';
      var buttonPanel = d.createElement('div');
      buttonPanel.classList.add('pseudo-table-scroller');
      buttonPanel.innerHTML = '' +
      '<button data-action="ArrowUp"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrow-ios-upward"><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><path d="M18 15a1 1 0 0 1-.64-.23L12 10.29l-5.37 4.32a1 1 0 0 1-1.41-.15 1 1 0 0 1 .15-1.41l6-4.83a1 1 0 0 1 1.27 0l6 5a1 1 0 0 1 .13 1.41A1 1 0 0 1 18 15z"/></g></g></svg></button>' + 
      '<button data-action="F4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrowhead-up"><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><path d="M6.63 11.61L12 7.29l5.37 4.48A1 1 0 0 0 18 12a1 1 0 0 0 .77-.36 1 1 0 0 0-.13-1.41l-6-5a1 1 0 0 0-1.27 0l-6 4.83a1 1 0 0 0-.15 1.41 1 1 0 0 0 1.41.14z"/><path d="M12.64 12.23a1 1 0 0 0-1.27 0l-6 4.83a1 1 0 0 0-.15 1.41 1 1 0 0 0 1.41.15L12 14.29l5.37 4.48A1 1 0 0 0 18 19a1 1 0 0 0 .77-.36 1 1 0 0 0-.13-1.41z"/></g></g></svg></button>' + 
      '<button data-action="F3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrowhead-down"><rect width="24" height="24" opacity="0"/><path d="M17.37 12.39L12 16.71l-5.36-4.48a1 1 0 1 0-1.28 1.54l6 5a1 1 0 0 0 1.27 0l6-4.83a1 1 0 0 0 .15-1.41 1 1 0 0 0-1.41-.14z"/><path d="M11.36 11.77a1 1 0 0 0 1.27 0l6-4.83a1 1 0 0 0 .15-1.41 1 1 0 0 0-1.41-.15L12 9.71 6.64 5.23a1 1 0 0 0-1.28 1.54z"/></g></g></svg></button>' + 
      '<button data-action="ArrowDown"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrow-ios-downward"><rect width="24" height="24" opacity="0"/><path d="M12 16a1 1 0 0 1-.64-.23l-6-5a1 1 0 1 1 1.28-1.54L12 13.71l5.36-4.32a1 1 0 0 1 1.41.15 1 1 0 0 1-.14 1.46l-6 4.83A1 1 0 0 1 12 16z"/></g></g></svg></button>' + 
      '';
      x.appendChild(buttonPanel);
    }

    var applyWrapperOnce = function(lifecycleMethodName) {
      var base = this.wrappedProperties[lifecycleMethodName];
      if (base) {
        base.call(this);
      }
      var scrollbarOfPseudoTable = this.getRef();
      if (scrollbarOfPseudoTable) {
        var pluginInstalled = scrollbarOfPseudoTable.hasAttribute(ATTR_PLUGIN);
        if (pluginInstalled && lifecycleMethodName.indexOf('Unmount') > 0) {
          restoreOriginal(scrollbarOfPseudoTable);
          scrollbarOfPseudoTable.removeEventListener('mousedown', onMouseDown);
          scrollbarOfPseudoTable.removeAttribute(ATTR_PLUGIN);
        } else if (!pluginInstalled && lifecycleMethodName.indexOf('Unmount') < 0) {
          scrollbarOfPseudoTable.addEventListener('mousedown', onMouseDown, true);
          scrollbarOfPseudoTable.setAttribute(ATTR_PLUGIN, 'true');
          convertIntoButtonPanel(scrollbarOfPseudoTable);
        }
      }
    }

    querix.plugins.wrappers.pseudo_table_scroller = {
      componentDidMount_Implementation: function() {
        applyWrapperOnce.call(this, 'componentDidMount_Implementation');
      },
      componentDidUpdate_Implementation: function() {
        applyWrapperOnce.call(this, 'componentDidUpdate_Implementation');
      },
      componentWillUnmount_Implementation: function() {
        applyWrapperOnce.call(this, 'componentWillUnmount_Implementation');
      }
    }
  }
})(querix);
