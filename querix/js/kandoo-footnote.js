var footnoteHtml = 'KandooERP is a community-supported Modular, Multi-Company, Multi-Language, '+
'Multi-Currency, Fully Analytical ERP. Courtesy of <a href="http://www.kandooerp.org" target="_blank">Maia Associates</a>. '+
'To access the source code, please contact <a href="mailto:ericv@kandooerp.org">Eric Vercelletto</a>';

var mdSpecificStyles = ' \
#qx-main-layout #qx-maia-footnote { \
  margin-left: 300px; \
  margin-left: var(--qx-sidebar-width); \
  width: auto; \
} \
#qx-main-layout > input.qx-drawer-toggle:checked ~ #qx-maia-footnote { \
  margin-left: 300px; \
  margin-left: var(--qx-drawer-width);  \
  margin-left: calc(var(--qx-sidebar-width) + var(--qx-drawer-width)); \
  width: auto; \
} \
#qx-main-layout > #qx-maia-footnote { \
  position: absolute; \
  bottom: 0; \
  height: 32px; \
  z-index: 100001; \
  display: flex; \
  align-items: center; \
  justify-content: center; \
} \
#qx-main-layout { \
  padding-bottom: 64px; \
} \
#qx-main-layout > footer { \
  padding-bottom: 32px; \
  height: 64px; \
} \
';

var topdoc = window.top.document;
if (topdoc.querySelector('html.qx-jquery-ui')) {
  var addFootnote = function addFootnote() {
    if (!topdoc.querySelector('#qx-maia-footnote')) {
      var footnote = topdoc.createElement('div');
      footnote.setAttribute('id', 'qx-maia-footnote');
      footnote.innerHTML = footnoteHtml;
      topdoc.body.appendChild(footnote);
      window.top.requestAnimationFrame(function(){
        var up = window.top.querix.updatePager;
        if (up) {
          up();
        }
      })
    }
  }
} else if (topdoc.querySelector('html.qx-material-design')) {
  var addFootnote = function addFootnote() {
    if (!topdoc.querySelector('#qx-maia-footnote')) {
      var footnote = topdoc.createElement('div');
      footnote.setAttribute('id', 'qx-maia-footnote');
      footnote.innerHTML = footnoteHtml;
      var styles = topdoc.createElement('style');
      styles.innerHTML = mdSpecificStyles;
      topdoc.head.appendChild(styles)
      topdoc.querySelector('#qx-main-layout').appendChild(footnote);
    }
  }
  
}

addFootnote();
