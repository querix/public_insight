(function(querix){

var $ = querix.$;

$.treeview.classes.hover = "ui-state-hover";
$.treeview.classes.defaultState = "ui-state-default";

var doWrap = function(el,p) {
    var i, cur, focus;
    for (i = 0; i < p.length; ++i) {
        focus  = el;
        cur = p[i];
        if($.isPlainObject(cur)) {
            if (cur.closest)
                focus = focus.closest(cur.closest);
            if (cur.find)
                focus = focus.find(cur.find);
            if (cur.add)
                focus.addClass(cur.add);
            if (cur.remove)
                focus.removeClass(cur.remove);
        } else if (cur.substr) {
            el.toggleClass(cur);
        }
    }
};

querix.plugins.wrappers.applyclass = {
    wrap: function(childId,el,param)  {
        var p;
        try {
            p = JSON.parse(param);
            if(!$.isArray(p)) {
                console.error("apply class expects JSON array parameter or string");
                return;
            }
        } catch(e) {
            el.addClass(param);
            return;
        }
        doWrap(el,p);
    },
    unwrap: function(el,param) {
        var p, i, cur, remove, add;
        try {
            p = JSON.parse(param);
        } catch(e) {
            el.removeClass(param);
        }
        for(i = 0; i < p.length; ++i) {
            cur = p[i];
            remove = cur.remove;
            add = cur.add;
            cur.add = remove;
            cur.remove = add;
        }
        doWrap(el,p);
    }
};

})(querix);
