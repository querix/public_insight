/**
 * Inspired by https://github.com/itaoyuta/postcss-selector-replace
 */
var postcss = require('postcss');
module.exports = postcss.plugin('postcss-cssvalue-replace', replaceCssValue);

function replaceCssValue(opts) {
  if(!opts){ 
    throw new Error("Always requires argument"); 
  }
  if(!opts["before"] || !opts["after"] ){ 
    throw new Error('Be sure to have "before" and "after" object names'); 
  }
  if(!Array.isArray(opts["before"]) || !Array.isArray(opts["after"]) ){ 
    throw new Error('Objects "before" and "after" must be of type Array'); 
  }
  if(opts["before"].length != opts["after"].length || opts["before"].length == 0){
    throw new Error("Array length is 1 or more"); 
  }

  return function(css, result) {
    css.walkRules(function transformRules(rule) {
      for(var i = 0; i < opts["before"].length; i += 1){
        for(var j = 0; j < rule.nodes.length; j++) {
          var node = rule.nodes[j];
          if (node.prop && node.prop.indexOf(opts["before"][i]) > -1) {
            node.prop = node.prop.replace(opts["before"][i], opts["after"][i]);
          }
          if (node.value && node.value.indexOf(opts["before"][i]) > -1) {
            node.value = node.value.replace(opts["before"][i], opts["after"][i]);
          }
        }
      }
    });
  }
}
