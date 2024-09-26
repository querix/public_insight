var footerStyles = ' \
  :root { \
    --qx-statusbar-height: 0; \
  } \
 \
  #qx-main-layout > input.qx-drawer-toggle ~ [data-insight-footer] { \
    margin-left: var(--qx-sidebar-width); \
    background-color: #ccc; \
    width: auto; \
  } \
  #qx-main-layout > input.qx-drawer-toggle:checked ~ [data-insight-footer] { \
    margin-left: 300px; \
    margin-left: calc(var(--qx-sidebar-width) + var(--qx-drawer-width)); \
  } \
 \
  #FooterTable[data-insight-footer] { \
    display: grid; \
    grid-template-columns: auto auto; \
    grid-template-rows: auto; \
    font: var(--qx-hint-font); \
    height: 16px; \
    align-items: center; \
    box-shadow: var(--md-elevation-3dp); \
  } \
  #FooterTable[data-insight-footer] > .left-side, \
  #FooterTable[data-insight-footer] > .right-side { \
    display: flex; \
    gap: .3rem; \
  } \
  #FooterTable[data-insight-footer] > .right-side { \
    flex-direction: row-reverse; \
  } \
  #FooterTable[data-insight-footer] .name { \
    font-weight: bold; \
    padding-left: .5rem; \
  } \
  #FooterTable[data-insight-footer] .value { \
    font-weight: 300; \
    padding-right: .5rem; \
  } \
';

var footerHtml = '<div id="FooterTable" data-insight-footer="true"> \
  <div class="left-side"> \
    <div class="name" id="lbLableUserName">UserName:</div> \
    <div class="value" id="lbValueUserName"></div> \
    <div class="name" id="lbLableUserLoginTime">Logged in:</div> \
    <div class="value" id="lbValueUserLoginTime"></div> \
  </div> \
  <div class="right-side"> \
    <div class="value" id="lbValueRecordNum"></div> \
    <div class="name" id="lbLabelRecordNum">Record#</div> \
  </div> \
</div> \
';
querix.plugins.frontCallModuleList.insightfooter = {
  changeFrameTemplate: function () {
    var doc = querix.ownerWindow.document;
    var css = doc.createElement('style');
    css.innerText = footerStyles;
    doc.head.appendChild(css);
    var ft = querix.ownerWindow.$(footerHtml);
    $('#qx-main-layout').append(ft);
  }
};
