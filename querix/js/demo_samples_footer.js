var footerHtml = 
'<table id="FooterTable" data-demo-samples-footer="true" cellspacing="0" cellpadding="0">' +
'<thead><tr>' +
'<td class="qx-text" id="lbLableUserName">UserName:</td>' +
'<td class="qx-text" id="lbValueUserName"></td>' +
'<td class="qx-text" id="lbLableUserAgent">Agent:</td>' +
'<td class="qx-text" id="lbValueUserAgent"></td>' +
'</tr></thead>' +
'<tbody><tr>' +
'<td class="qx-text" id="lbLableUserLoginTime">Logged in:</td>' +
'<td class="qx-text" id="lbValueUserLoginTime"></td>' +
'<td class="qx-text" id="lbLableUserCountry">Country:</td>' +
'<td class="qx-text" id="lbValueUserCountry"></td>' +
'</tr></tbody>' +
'</table>';

var footerStyles = '.qx-status-bar {display:none;}\n \
#FooterTable {display:table;width:100%;font-size:.8em;}\n \
#FooterTable thead *{font-weight:bold;}\n \
#FooterTable td{white-space: nowrap;padding:0 .3em;text-align:left}\n \
#FooterTable td:first-child, #FooterTable td:last-child{width:5%}\n \
#FooterTable td:first-child {padding-left:50px;}\n \
#FooterTable td:nth-child(2) {width:100%;}\n';

var mdSpecificStyles = ' \
  #qx-main-layout > input.qx-drawer-toggle ~ [data-demo-samples-footer] { \
    margin-left: var(--qx-sidebar-width); \
    background-color: #ccc; \
    width: auto; \
  } \
  #qx-main-layout > input.qx-drawer-toggle:checked ~ [data-demo-samples-footer] { \
    margin-left: 300px; \
    margin-left: calc(var(--qx-sidebar-width) + var(--qx-drawer-width)); \
  } \
';

querix.plugins.frontCallModuleList.sample = {
  changeFrameTemplate: function () {
    var doc = window.top.document;
    var css = doc.createElement('style');
    doc.head.appendChild(css);
    var ft = window.top.$(footerHtml);
    if (window.top.document.querySelector('html.qx-jquery-ui')) {
      css.innerText = footerStyles;
      $('#qx-container-status-bar-inner').prepend(ft);
    } else if (window.top.document.querySelector('html.qx-material-design')) {
      css.innerText = footerStyles + mdSpecificStyles;
      /**
       * @TODO turn to more Reactish way
       */
      $('#qx-main-layout').append(ft);
    }
  }
};
