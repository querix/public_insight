querix.plugins.frontCallModuleList.sample = {
    changeFrameTemplate: function() {


//1. Attach custom header
$(
'<div id="header-container" style="display:block"> \
<div style="display:table;width:100%"><div style="display:table-row"> \
<div style="display:table-cell;width:173px"><img src="" alt=""></div> \
<div style="display:table-cell;background:url(/public/custom/images/babkopf.png) no-repeat;background-size:100% 100%"></div> \
</div></div></div>'
).insertBefore($("#qx-main-layout").children().first());


//2. Create styles for the FooterTable (Actually we can put styles into custom.css as well)
var ftstyles = '<style> \
.footer-table-wrapper {width: 100%; overflow: hidden; padding: 2px; border: 1px solid #ccc; border-left: none; border-right: none;}\
 \
#FooterTable {display:table;width:100%;font-size:.8em; font-family: Verdana;} \
#FooterTable thead *{font-weight:bold;} \
#FooterTable td{white-space: nowrap;padding:0 .3em;text-align:left} \
#FooterTable td:xfirst-child, #FooterTable td:last-child{width:5%} \
#FooterTable td:xfirst-child {padding-left:50px;} \
#FooterTable td:nth-child(even) {border-right:1px solid #ccc;} \
#FooterTable td.spacer{width:100%;} \
#FooterTable td.lbl{font-family:monospace;font-weight:bold;} \
#FooterTable td.txt{color: #666;} \
#FooterTable #lbValueUserPicture > img {max-height: 50px;} \
</style>';
$('head').append(ftstyles);

//3. Create FooterTable and insert it into status bar
var ft = $(
'<div class="footer-table-wrapper"><table id="FooterTable" cellspacing="0" cellpadding="0"><tbody> \
<tr> \
<td class="qx-text lbl" id="lbLabelUserName">UserName:</td> \
<td class="qx-text txt" id="lbValueUserName"></td> \
<td class="qx-text lbl" id="lbLabelUserFirstName">F-Name:</td> \
<td class="qx-text txt" id="lbValueUserFirstName"></td> \
<td class="qx-text lbl" id="lbLabelUserLoginTime">Logged in since:</td> \
<td class="qx-text txt" id="lbValueUserLoginTime"></td> \
<td class="spacer">&nbsp;</td> \
<td>&nbsp;</td> \
<td class="qx-text lbl" id="lbLabelUserDepartment">Department:</td> \
<td class="qx-text txt" id="lbValueUserDepartment"></td> \
<td class="qx-text txt" id="lbValueUserPicture" rowspan="2"><img/></td> \
</tr> \
 \
<tr> \
<td class="qx-text lbl" id="lbLabelUserType">Role:</td> \
<td class="qx-text txt" id="lbValueUserType"></td> \
<td class="qx-text lbl" id="lbLabelUserLastName">L-Name:</td> \
<td class="qx-text txt" id="lbValueUserLastName"></td> \
<td class="qx-text lbl" id="lbLabelUserPosition">Position:</td> \
<td class="qx-text txt" id="lbValueUserPosition"></td> \
<td class="spacer">&nbsp;</td> \
<td>&nbsp;</td> \
<td>&nbsp;</td> \
</tr> \
 \
</tbody></table></div>'
);

$('#qx-container-status-bar-inner').prepend(ft);

    }

};
