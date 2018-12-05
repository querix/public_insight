querix.plugins.frontCallModuleList.sample = {
    changeFrameTemplate: function() {

//1. Create styles for the Header
//var hdstyles = '<style> \
//#sample-header {font-size: 40px;text-align: center;} \
//</style>';
//$('head').append(hdstyles);

//2. Attach custom Header
//$('<div><div id="sample-header">This is header</div></div>').insertBefore($("#qx-main-layout").children().first());


//3. Create styles for the FooterTable (Actually we can put styles into custom.css as well)
var ftstyles = '<style> \
#FooterTable {display:table;width:100%;font-size:.8em;} \
#FooterTable thead *{font-weight:bold;} \
#FooterTable td{white-space: nowrap;padding:0 .3em;text-align:left} \
#FooterTable td:first-child, #FooterTable td:last-child{width:5%} \
#FooterTable td:first-child {padding-left:50px;} \
#FooterTable td:nth-child(2) {width:100%;} \
</style>';
$('head').append(ftstyles);

//4. Create FooterTable and insert it into status bar
var ft = $(
'<table id="FooterTable" cellspacing="0" cellpadding="0">'+
'<thead><tr>'+
'<td class="qx-text" id="lbLableUserName">UserName:</td>'+
'<td class="qx-text" id="lbValueUserName">Claus Shoulz</td>'+
'<td class="qx-text" id="lbLableUserDepartment">Department</td>'+
'<td class="qx-text" id="lbValueUserDepartment">Strategic Management</td>'+
'</tr></thead>'+
'<tbody><tr>'+
'<td class="qx-text" id="lbLableUserLoginTime">Logged in since:</td>'+
'<td class="qx-text" id="lbValueUserLoginTime">12:15</td>'+
'<td class="qx-text" id="lbLableUserBirthDate">User BirthDate:</td>'+
'<td class="qx-text" id="lbValueUserBirthDate">26.12.1982:</td>'+
'</tr></tbody>'+
'</table>'
);

$('#qx-container-status-bar-inner').prepend(ft);

    }
};