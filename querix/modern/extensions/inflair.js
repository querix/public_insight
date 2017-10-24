querix.plugins.frontCallModuleList.inflair = {
	fixLoginTab: function() {
		var t = $("#qx-t-c");
		$(".qx-page-0-header").remove();
		cnt = $("#qx-page-0-content");
		cnt.children().detach();
		cnt.remove();
		t.tabs("refresh");
	}
}; 