// ==========================================================================
// Docs.DocsController
// ==========================================================================

require('core');

Docs.docsController = SC.Object.create({
  
  // This is used in the client warning dialog.
  windowLocation: window.location.href,
  
  // This is the current client name.
  clientName: '',
  
  clientRoot: '',
  
  isRebuilding: false,
  
  nowShowingContainer: function() {
    return (this.get('isRebuilding')) ? 'rebuilding' : 'runner';
  }.property('isRebuilding'),
  
  // This is displayed as the main UI label.
  displayClientName: function() {
    return "%@ Docs".fmt((this.get('clientName') || '').humanize().capitalize()) ;
  }.property('clientName'),
  
  arrangedObjects: [],
  selection: [],
  
  selectedDoc: function() {
    var sel = this.get('selection') ;
    return (sel && sel.length > 0) ? sel[0] : null ;
  }.property('selection'),
  
  reloadDocs: function() {
    
    // Use Ajax to ask the server for the latest set of tests for the 
    // current client.
    var clientName = this.get('clientName') ;
    var clientRoot = this.get('clientRoot') ;
    clientRoot = clientRoot.replace(new RegExp("^%@/?".fmt(window.indexPrefix)), window.urlPrefix + '/');
    console.log('clientName: '+ clientRoot) ; 
    Docs.server.request(clientRoot, ['data','classes.js'].join('/'), null, {
      onSuccess: this._reloadSuccess.bind(this),
      onFailure: this._reloadFailure.bind(this)
    }) ;
  },
  
  _reloadSuccess: function(status, transport) {
    var json = transport.responseText ;
    var records = eval(json) ;
    if ($type(records) != T_ARRAY) {
      return this._reloadFailure(status, transport) ;
    }

    // update the list of tests from the server.  The return value will be
    // the records included in the list.  This is what will become our new
    // list.
    var recs = SC.Store.updateRecords(records, this, Docs.Doc, true);
    console.log('recs: %@'.fmt(recs)) ;
    
    // show warning panel if the records are empty.  Also reload tests
    // periodically so that when the user resolves the problem, we can start
    // working away immediately.
    if (recs.length == 0) {
      SC.page.get('noDocsPanel').set('isVisible',true) ;
      setTimeout(this.reloadDocs.bind(this),2000) ; 
    } else {
      SC.page.get('noDocsPanel').set('isVisible',false) ;
    }
    
    // sort the records by name and set as the new arrangedObjects.
    recs = recs.sort(function(a,b) {
      
      var g_a = a.get('group') || '';
      var g_b = b.get('group') || '';
      var groupCompare = g_a.localeCompare(g_b) ;
      
      if (groupCompare == 0) {
        a = a.get('guid') || '' ;
        b = b.get('guid') || '' ;
        return a.localeCompare(b) ;
      } else return groupCompare ;
    }) ;
    
    var hadArrangedObjects = this.get('arrangedObjects').length > 0 ;
    this.set('arrangedObjects', recs) ;
    
    // if the current selection is not in the list, clear the selection.
    var doc = this.get('selectedDoc') ;
    if (doc && !(recs.include(test))) this.set('selection', []) ;
    
  },
  
  _reloadFailure: function(status, transport) {
    console.log('TEST RELOAD FAILED!') ;
  },
  
  rebuildDocs: function() {
    var clientName = this.get('clientName') ;
    var clientRoot = this.get('clientRoot') ;
    Docs.server.request(clientRoot, null, null, {
      onSuccess: this._rebuildSuccess.bind(this),
      onFailure: this._rebuildFailure.bind(this)
    }, 'post') ;
    this.set('isRebuilding', true) ;
  },
  
  _rebuildSuccess: function() {
    this.reloadDocs() ;
    this.set('isRebuilding', false) ;
  },

  _rebuildFailure: function() {
    this.set('isRebuilding', false) ;
  }
  
}) ;
