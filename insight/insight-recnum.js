/**
 *  Copyright 2024 Querix Ltd
 *  Released under the MIT license.
 *
 *  Plugin for Insight to display record number
 *  4GL code to load:
 *  CALL ui.interface.frontcall("html5","scriptImport",["qx://application/scripts/insight-recnum.js","nowait"],[])
 */
/**
 * Application may exit during script load,
 * so we checking if it exists
 */
(window.querix && !window.querix.exitInProgress) && (function (querix) {
  var ownerWindow = querix.ownerWindow;
  var d = ownerWindow.document;
  var ID_PLUGIN = 'insight-recnum';
  var ATTR_PLUGIN = 'data-' + ID_PLUGIN;
  var applyWrapperOnce = function(lifecycleMethodName) {
    var base = this.wrappedProperties[lifecycleMethodName];
    if (base) {
      base.call(this);
    }
    var labelWithRecnum = this.getRef();
    if (labelWithRecnum) {
      var recnumCell = d.querySelector('[data-insight-footer] #lbValueRecordNum');
      var pluginInstalled = labelWithRecnum.hasAttribute(ATTR_PLUGIN);
      if (pluginInstalled && lifecycleMethodName.indexOf('Unmount') > 0) {
        if (recnumCell) {
          recnumCell.textContent = '';
        }
        labelWithRecnum.removeAttribute(ATTR_PLUGIN);
      } else {
        if (!pluginInstalled && lifecycleMethodName.indexOf('Unmount') < 0) {
          labelWithRecnum.setAttribute(ATTR_PLUGIN, 'true');
        }
        if (recnumCell) {
          recnumCell.textContent = this.ctx().bareValue('Text') || 'N/A';
        }
      } 
    }
  }

  querix.plugins.wrappers.insight_recnum = {
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
})(querix);
