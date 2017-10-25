(function(querix){
    querix.plugins.wrappers.screen_array_sorter = {
		/**
		 *	@param childId - identifier of the Lycia application.
		 *	@param el - widget to be wrapped, jQuery object containing actual DOM element.
		 *	@param parameter - custom parameter, defined for this wrapper in Lycia theme.
		 */
        wrap: function(childId, el, param) {
            var $ = window.top.$;
            var elementCache = querix.ELEMENT_CACHE;
            if (elementCache == null) {
                elementCache = querix.ELEMENT_CACHE = {};
            }
            try {
            	param = JSON.parse(param);
            } catch(err) {
            	console.error('Problem parsing wrapper parameter: ',param);
            }
            var selector = param.selector;
            var excludes = param.excludes;
            return {

                remove: function() {
                    this.removeClass(selector);
                    var classes = this.attr('class').split(' ');
                    var identifier = null;
                    for (var i = 0; i < classes.length; i++) {
                        var c = classes[i];
                        if (c.substring(0,'qx-identifier-'.length) === 'qx-identifier-') {
                            identifier = c.substring('qx-identifier-'.length);
                            break;
                        }
                    }
                    if (identifier && elementCache[identifier] != null) {
                        var ids = elementCache[identifier];
                        var ptr = ids.indexOf(this.id());
                        if (ptr > -1) {
                            ids.splice(ptr, 1);
                        }
                    }
					return true;
                },
                attach: function(to) {
					return true;
                },
                prop: function(propertyName, propertyValue){
                    if (propertyName === 'Identifier') {
                        propertyValue = propertyValue.toLowerCase();
                        if (excludes && excludes.indexOf(propertyValue) > -1) {
                            return true;
                        }
                   		var idSelector = '.qx-identifier-'+propertyValue;
                   		//console.error(idSelector);
                        var ids = elementCache[propertyValue];
                        if (ids == null) {
                            ids = [];
                            elementCache[propertyValue] = ids;
                        }
                        ids.push(this.id());
                        if (ids.length === 2) {
                        	$.each(ids,function(i,el){
                        		try {
                        			querix.rcomms.nodeById(el).addClass(selector);
                        		} catch(err) {
                            		console.error('Error: ',err);
                        		}
                        	});
                        } else if (ids.length > 2) {
                    		try {
                    			this.addClass(selector);
                    		} catch(err) {
                        		console.error('Error: ',err);
                    		}
                        }
                    }
					return true;
                },
            };
        }
    };
})(querix);
