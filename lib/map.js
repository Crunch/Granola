/**
 *  This Less.js plugin allows you to create value "maps" with custom at-rules.
 *  Unlike variables, the maps are global.
 * 
 *  This library allows for more dynamic data assignment/retrieval than variables.
 * 
 *  Example:
 * 
    @set {
        options {
            ui: default;
            elements: default;
            theme: default;
        }
        colors {
        	dark {
        	    color: black;
        	}
        	light {
        	    color: white;
        	}
        }
    }
    .block when (get('options.theme') = default) {
        @col: ~"colors.light";
        color: get('@{col}.color');
    }
 */


var valueMap = Object.create(null), 
    awaitEval = Object.create(null);

function mapRuleset(root, rules, prefix) {
    var key, name, obj = Object.create(null);
    prefix = prefix || '';
    if(prefix.slice(-1) !== '.')
        prefix += '.';
    if(prefix === ".")
        prefix = '';
    rules.forEach(function(line) {
        
        if(line.name && line.value) {
            name = line.name[0].value;
            if(line.value.name === 'val') {
                obj[name] = line.value.args[0];
                root[prefix + name] = obj[name];
            }
            else {
                obj[name] = line.value;
                root[prefix + name] = obj[name];
            }
        }
        if(line.rules) {
            key = line.selectors[0].elements[0].value;
            if(key === '&') {
                prefix = prefix.slice(0,-1);
                root[prefix] = mapRuleset(root, line.rules, prefix);
            }
            else {
                obj[key] = mapRuleset(root, line.rules, prefix + key);
                root[prefix + key] = obj[key];
            }
        }
    });
    return obj;
}
function MergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if ( obj2[p].constructor == Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
    
    return obj1;
}
var MapFunctions = {
    // AtRule functions
    "@define": function(prelude, rules) {
        if(prelude.value) {
            valueMap[prelude.value] = Object.create(null);
        }
        else {
            valueMap = Object.create(null);
        }
        mapRuleset(valueMap, rules, prelude.value);
        return true;
    }
    , "@set": function(prelude, rules) {
        var tmpMap = Object.create(null);
        mapRuleset(tmpMap, rules, prelude ? prelude.value : '');
        MergeRecursive(valueMap, tmpMap);
        return true;
    }
    , get: function(ref) {
        // In imports, which are parsed before the root, the value may not be available yet
        if(valueMap[ref.value]) {
            return valueMap[ref.value].eval(this.context);
        }
        
        var container = new tree.Value([new tree.Anonymous('""')]);
        var oldEval = container.eval;
        var oldgenCSS = container.genCSS;
        awaitEval[ref.value] = true;
        
        function resolveValue(node, context) {
            var val;
            if(awaitEval[ref.value]) {
                val = valueMap[ref.value];
                if (val) {
                    node.value = val.eval(context);
                    awaitEval[ref.value] = null;
                }
            }
        }

        container.eval = function (context) {
            resolveValue(this, context);
            var result = oldEval.call(this, context);
            if(awaitEval[ref.value]) {
                // try again to evaluate the node if it's not fully resolved 
                result = oldEval.call(this, context);
            }
            return result;
        };
        return container;
    }
};

var thisRoot;
var MapVisitor = function(less) {
    this._visitor = new less.visitors.Visitor(this);
};
MapVisitor.prototype = {
    isReplacing: true
    , isPreEvalVisitor: true
    , run: function(root) {
        thisRoot = root;
        return this._visitor.visit(root);
    }
    , visitDirective: function(node, visitArgs) {
        if(MapFunctions[node.name]) {
            return (MapFunctions[node.name]).call(this, node.value, node.rules);
        }
        else return node;
    }
};

module.exports = {
    install: function(less, pluginManager) {
        functions.addMultiple(MapFunctions);
        pluginManager.addVisitor(new MapVisitor(less));
    }
};