var footnoteHtml = 'KandooERP is a community-supported Modular, Multi-Company, Multi-Language, '+
'Multi-Currency, Fully Analytical ERP. Curtsey of <a href="http://www.maiaerp.org" target="_blank">Maia Associates</a>. '+
'To access the source code, please contact <a href="mailto:ericv@kandooerp.org">Eric Vercelletto</a>';

var addFootnote = function addFootnote() {
  var topdoc = window.top.document;
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

addFootnote();
