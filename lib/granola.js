
var valueMap = {}, awaitEval = {}, pluginContext;

function mapRuleset(root, rules, prefix) {
    var key, name, obj = {};
    prefix = prefix || '';
    if(prefix.slice(-1) !== '.')
        prefix += '.';
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
      if ( obj2[p].constructor==Object ) {
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
var GranolaFunctions = {
    // AtRule functions
    "@granola": function(prelude) {
        if(prelude.value === 'start') {
            // var imp = new tree.Import(fileInfo.currentDirectory + 'granola.less', null, { less: true }, this.index, this.currentFileInfo);
            // //imp.root = thisRoot;
            // importManager.push(fileInfo.currentDirectory + 'granola.less', false, this.currentFileInfo, null, function(e, root) {
            //     imp.root = root;
            // });
            
            // return imp;
            return true;
        }
        if(prelude.value === 'make') {
            //return new Ruleset();
            return true;
            //return true;
        }
    }
    , "@define": function(prelude, rules) {
        if(prelude.value) {
            valueMap[prelude.value] = {};
        }
        else {
            valueMap = {};
        }
        mapRuleset(valueMap, rules, prelude.value);
        return true;
    }
    , "@set": function(prelude, rules) {
        var tmpMap = {};
        mapRuleset(tmpMap, rules, prelude ? prelude.value : '');
        MergeRecursive(valueMap, tmpMap);
        return true;
    }
    , get: function(ref) {
        // In imports, which are parsed before the root, the value may not be available yet
        console.log('Getting value...' + ref);
        if(valueMap[ref.value]) {
            return valueMap[ref.value].eval(pluginContext);
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
                    node.value = val.eval(pluginContext);
                    awaitEval[ref.value] = null;
                }
            }
            node.eval(context);
        }
        container.genCSS = function(context, output) {
            resolveValue(this, context);
            return oldgenCSS.call(this, context, output);
        }

        container.eval = function (context) {
            resolveValue(this, context);
            return oldEval.call(this, context);
        };
        return container;
    }
};

var thisRoot;
var GranolaVisitor = function() {
    this._visitor = new less.visitors.Visitor(this);
};
GranolaVisitor.prototype = {
    isReplacing: true
    , isPreEvalVisitor: true
    , run: function(root) {
        thisRoot = root;
        return this._visitor.visit(root);
    }
    , visitDirective: function(node, visitArgs) {
        //var funcArgs = [node.value || undefined, node.rules || undefined];
        if(GranolaFunctions[node.name]) {
            return (GranolaFunctions[node.name]).call(this, node.value, node.rules);
            //return new less.tree.Call(node.name, funcArgs, node.index || 0, node.currentFileInfo);
        }
        else return node;
    }
    , visitImport: function(node) {
        return node;
    }
};

module.exports = {
    install: function(less, pluginManager) {
        functions.addMultiple(GranolaFunctions);
        pluginManager.addVisitor(new GranolaVisitor());
    },
    use: function(less) {
    },
    setContext: function(context) {
        pluginContext = context;
    }
};

// var pluginManager = new less.PluginManager(less);
// pluginManager.addVisitor(new GranolaVisitor());


