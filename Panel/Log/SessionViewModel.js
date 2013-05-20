// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2012 Google Inc. johnjbarton@google.com

// One-line overview of loads and turns

(function() {

  'use strict';

  var debug = DebugLogger.register('SessionViewModel', function(flag){
    return debug = (typeof flag === 'boolean') ? flag : debug;
  });

  QuerypointPanel.SessionViewModel = {
    
    initialize: function(project, tracequeries) {
      this.loadListViewModel = QuerypointPanel.LoadListViewModel.initialize(this);
      this.turnScrubberViewModel = QuerypointPanel.TurnScrubberViewModel.initialize(project, tracequeries, this);
      this._log = QuerypointPanel.Log.initialize(project, this.loadListViewModel, this.turnScrubberViewModel);
      this.messageViewModel = QuerypointPanel.MessageViewModel.initialize(this._log, this.loadListViewModel, this.turnScrubberViewModel);

      var sessionView = document.querySelector('.sessionView');
      var loadListView = document.querySelector('.loadListView');
       
      sessionView.onmouseout = function(event) {
          var e = event.toElement || event.relatedTarget;
          if (this.isOurRelatedTarget(e, loadListView)) return false;
          loadListView.style.display = 'none';
      }.bind(this);

      return this;
    },
    
    // Event mouseout triggers when mouse goes into child nodes
    // If we are looking to hide target, we must assure element isn't a descendant
    isOurRelatedTarget: function(element, target) {
      while (element && element.parentNode) {
        if (element.parentNode === target ||  element === target) {
            if (element.preventDefault) element.preventDefault();
            return true;
        }
        element = element.parentNode;
      }
      return false;
    },

    pageWasReloaded: function(runtimeInitialized,  runtimeInstalling) {
      this.loadListViewModel.pageWasReloaded(runtimeInitialized, runtimeInstalling);
      this.turnScrubberViewModel.pageWasReloaded(runtimeInitialized, runtimeInstalling);
      this._log.pageWasReloaded(runtimeInitialized, runtimeInstalling);
    },

    turnEnded: function() {
      return this.turnScrubberViewModel.turnEnded();
    },

    tooltip: function(turn){
      return this._log.currentTurn.event;
    },
  };
}());
