var footerHtml = 
'<table id="FooterTable" data-demo-samples-footer="true" cellspacing="0" cellpadding="0">' +
'<thead><tr>' +
'<td class="qx-text" id="lbLableUserName">UserName:</td>' +
'<td class="qx-text" id="lbValueUserName">Claus Shoulz</td>' +
'<td class="qx-text" id="lbLableUserDepartment">Department</td>' +
'<td class="qx-text" id="lbValueUserDepartment">Strategic Management</td>' +
'</tr></thead>' +
'<tbody><tr>' +
'<td class="qx-text" id="lbLableUserLoginTime">Logged in since:</td>' +
'<td class="qx-text" id="lbValueUserLoginTime">12:15</td>' +
'<td class="qx-text" id="lbLableUserBirthDate">User BirthDate:</td>' +
'<td class="qx-text" id="lbValueUserBirthDate">26.12.1982:</td>' +
'</tr></tbody>' +
'</table>';

var footerStyles = '#FooterTable {display:table;width:100%;font-size:.8em;}\n \
#FooterTable thead *{font-weight:bold;}\n \
#FooterTable td{white-space: nowrap;padding:0 .3em;text-align:left}\n \
#FooterTable td:first-child, #FooterTable td:last-child{width:5%}\n \
#FooterTable td:first-child {padding-left:50px;}\n \
#FooterTable td:nth-child(2) {width:100%;}\n';

var mdSpecificStyles = '#qx-main-layout > input.qx-drawer-toggle:checked ~ [data-demo-samples-footer] { \
  margin-left: 300px; \
  margin-left: var(--qx-drawer-width);  \
  width: auto; \
  background-color: #ccc; \
}';

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