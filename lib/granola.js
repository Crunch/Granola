var less;
var GranolaVisitor = function(less) {
    this._visitor = new less.visitors.Visitor(this);
};
GranolaVisitor.prototype = {
    isReplacing: true
    , isPreEvalVisitor: true
    , run: function(root) {
        return this._visitor.visit(root);
    }
    , visitDirective: function(node, visitArgs) {
        return node;
    }
    , visitImport: function(node) {
        console.log(node);
        return node;
    }
};

module.exports = {
    install: function(lessRef, pluginManager) {
        less = lessRef;
        pluginManager.addVisitor(new GranolaVisitor(less));
    },
    use: function(plugin) {  
        // var self = this;
        // less.importManager.push(fileInfo.currentDirectory + 'granola.less', false, fileInfo, {}, function() {
        //     var imp = new tree.Import(fileInfo.currentDirectory + 'granola.less', null, { less: true });
        //     self.thisRoot.prependRule(imp);
        //     var visitor = new less.visitors.ImportVisitor(less.importManager, function() {
        //         //console.log('complete');    
        //     });
        //     visitor.run(this.root);
        // });
        
        

        
        //console.log("plugin obj", plugin);
    }
};


