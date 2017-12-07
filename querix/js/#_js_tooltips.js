(function(querix){

	var $ = querix.$;
	var api = querix.plugins.api;
	var get$ = function() {
    	return api.getWindow(api.topWindow()).$;
	};

	querix.plugins.frontCallModuleList.tooltipster = {
	    tooltip: function(selector, content, type, position, timeout) {
	    	timeout = parseInt(timeout);
	    	if (isNaN(timeout)) {
	    		timeout = 3;
	    	}
	    	
	    	position = position || "top-right";
	    	
	    	typeIndex = ["error","warning","info","message","usage","other"].indexOf(type);
	    	if (typeIndex < 0) {
	    		type = "message";
	    	}
	    	
	    	opts = {
	    		content: content,
	    		position: position,
	    		theme: "tooltipster-default tooltipster-"+type
	    	}
	    	
	    	tipDestroyer = function(){
	    		setTimeout(function(){$(selector).tooltipster("destroy");},timeout*1000);
	    	}
	    	
	    	$(selector).tooltipster(opts);
	    	$(selector).tooltipster("show",tipDestroyer);
	    }
	}
	
})(querix);