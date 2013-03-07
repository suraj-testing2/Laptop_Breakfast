// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2012 Google Inc. johnjbarton@google.com

(function(){

'use strict';

  function protect(expr) {
      return "eval(" + expr + ")"; // unwrapped by Querypoints
  }

  function unprotect(str) {
      return str.replace(/:\"eval\(([^\)]*)\)\"/,":$1");
  }

  var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;

  function getValueReferenceIdentifier(tree) {
    switch(tree.type) {
      case "MEMBER_EXPRESSION": return tree.memberName;
    }
  }

  Querypoint.ValueChangeQuery = function(identifierTree, tree, project) {
    Querypoint.Query.call(this);
    this.identifier = identifierTree.value;
    console.assert(typeof this.identifier === 'string'); 
    this._tree = tree;
  }
    
  Querypoint.ValueChangeQuery.ifAvailableFor = function(tree, project) {
    var identifierTree = getValueReferenceIdentifier(tree);
    if (identifierTree) {
      var query = Querypoint.ValueChangeQuery.prototype.getQueryOnTree(tree, Querypoint.ValueChangeQuery);
      return query || new Querypoint.ValueChangeQuery(identifierTree, tree, project);
    }
  },


  Querypoint.ValueChangeQuery.prototype = {
    __proto__: Querypoint.Query.prototype,

    title: function() { 
      return 'lastChange';
    },
    
    buttonName: function() {
      return 'lastChange';
    },
    
    iconText: function() {
      return '&#x1D6AB;';
    },
    
    toolTip: function() {
      return "Trace the changes to the current expression and report the last one";
    },
        
    targetTree: function() {
      return this._tree;
    },
    
    activate: function(queryIndex) {
      this._transformer = new Querypoint.ValueChangeQueryTransformer();
      this._queryIndex = queryIndex;
      var location = this._tree.location;
      var transformData = {
        propertyKey: this.identifier,
        queryIndex: queryIndex,
        filename: location.start.source.name,
        startOffset: location.start.offset, 
        endOffset: location.end.offset, 
      };
      this._setTracedPropertyObjectTransformer = new Querypoint.SetTracedPropertyObjectTransformer(transformData);
      this._tree.location.query = this;
      this._isActive = true;
    },
    
    transformDescriptions: function() {
      var location = this._tree.location;
      return [
        {
          ctor: 'ValueChangeQueryTransformer'
        },
        {
          ctor: 'SetTracedPropertyObjectTransformer',
          queryData: {
            propertyKey: this.identifier,
            queryIndex: this._queryIndex,
            filename: location.start.source.name,
            startOffset: location.start.offset, 
            endOffset: location.end.offset, 
          }
        }
      ];
    },

    transformers: function() {
      return [this._transformer, this._setTracedPropertyObjectTransformer];
    },

    tracePromptText: function() {
      return "(no changes)";
    }, 
    
    // Add tracing code to the parse tree. Record the traces onto __qp.propertyChanges.<identifier>
    // 
    transformParseTree: function(tree) {
      tree = this._transformer.transformTree(tree);
      tree = this._setTracedPropertyObjectTransformer.transformTree(tree);
      return tree;
    },

    runtimeSource: function() {
      var src = '';
      this._setTracedPropertyObjectTransformer.runtimeInitializationStatements().forEach(function(tree){
        src += traceur.outputgeneration.TreeWriter.write(tree) + '\n';
      });
      return src;
    },

    // Pull trace results out of the page for this querypoint
    extractTracepoints: function(fileViewModel, onTracepoint) {
      function onEval(result, isException) {
         if (!isException && result && result instanceof Array) {
          var changes = result;
          changes.forEach(function(change) {
            var trace = change;
            if (trace.valueType === 'undefined')
              trace.value = 'undefined';
            trace.query = this;
            trace.load = fileViewModel.project.numberOfReloads;
            trace.activation = change.activationCount;
            onTracepoint(trace);  
          }.bind(this));      
        } else {
          console.error("ValueChangeQuery extractTracepoints eval failed", isException, result); 
        }
      }
      var tracedObjectIndex = this._queryIndex;
      var position = this._tree.location.start.offset;

      var expr = 'window.__qp.reducePropertyChangesToTracedObject(\"' + this.identifier + '\",' + tracedObjectIndex + ',' + position + ')';
      chrome.devtools.inspectedWindow.eval(expr, onEval.bind(this));
    },
  };



}());
