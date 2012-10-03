// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2012 Google Inc. johnjbarton@google.com

// Backing data for Querypoint Panel, save/restore object

window.Querypoint = window.Querypoint || {};

( function() {
  var Storage = Querypoint.Storage = function Storage() {
    this.key = "Querypoint.PanelModel";
  }

  /**
    @param Querypoint.PanelModel model
    @param function onSuccess
    @param function onError
  */
  Storage.store = function(model, onSuccess, onError) {
    localStorage.setItem(this.key, model);
    onSuccess(model);
  }

  Storage.recall = function(onSuccess, onError) {
    var model = localStorage.getItem(this.key);
    model ? onSuccess(model) : onError();
  } 

}());