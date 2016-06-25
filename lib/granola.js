
var valueMap = {};

function mapRuleset(root, rule, prefix) {
    var key, obj = {};
    prefix = prefix || '';
    rule.rules.forEach(function(line) {
        
        if(line.name && line.value) {
            if(line.value.name === 'val') {
                obj[line.name] = line.value.args[0];
                root[prefix + line.name] = obj[line.name];
            }
            else {
                obj[line.name] = line.value;
                root[prefix + line.name] = obj[line.name];
            }
        }
        if(line.rules) {
            key = line.selectors[0].elements[0].value;
            obj[key] = mapRuleset(root, line, prefix + key + '.');
            root[prefix + key] = obj[key];
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
        // if(prelude.value === 'start') {
        //     var imp = new tree.Import(fileInfo.currentDirectory + 'granola.less', null, { less: true }, this.index, this.currentFileInfo);
        //     imp.root = { rules: [] };
        //     imp.doEval(imp);
        //     return imp;
        // }
        if(prelude.value === 'make') {
            //return new Ruleset();
            return true;
            //return true;
        }
    }
    , "@define": function(prelude, rule) {
        valueMap = {};
        if(!rule) {
            rule = prelude;
            prelude = null;
        }
        mapRuleset(valueMap, rule, prelude.value + '.');
        return true;
    }
    , "@set": function(prelude, rule) {
        var tmpMap = {};
        if(!rule) {
            rule = prelude;
            prelude = null;
        }
        mapRuleset(tmpMap, rule, prelude ? prelude.value + '.' : '');
        MergeRecursive(valueMap, tmpMap);
        return true;
    }
    , get: function(ref) {
        var val = valueMap[ref.value];
        if(val) {
            console.log(val);
            return val;
        }
        else return false;
    }
};


var GranolaVisitor = function() {
    this._visitor = new less.visitors.Visitor(this);
};
GranolaVisitor.prototype = {
    isReplacing: true
    , isPreEvalVisitor: true
    , run: function(root) {
        return this._visitor.visit(root);
    }
    , visitDirective: function(node, visitArgs) {
        var funcArgs = [node.value, node.rules];
        if(GranolaFunctions[node.name]) {
            return new less.tree.Call(node.name, funcArgs, node.index || 0, node.currentFileInfo);
        }
        else return node;
    }
};

var pluginManager = new less.PluginManager(less);
pluginManager.addVisitor(new GranolaVisitor());
functions.addMultiple(GranolaFunctions);

