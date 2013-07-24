React.BackboneMixin = {
    componentDidMount: function(domNode) {
      // Whenever there may be a change in the Backbone data, trigger a reconcile.
      var model = this.getModel();
      // Detect if it's a collection
      if (model instanceof Backbone.Collection) {
          model.on('add remove reset sort', function () { this.forceUpdate(); }, this);
      }
      else if (model) {
          var changeOptions = this.changeOptions || "change";
          model.on(changeOptions, (this.onModelChange || function () { this.forceUpdate(); }), this);
      }
  },
  componentWillUnmount: function() {
      // Ensure that we clean up any dangling references when the component is destroyed.
      this.getModel() && this.getModel().off(null, null, this);
  }
};

React.createBackboneClass = function(spec) {
    var currentMixins = spec.mixins || [];
    _.extend(spec, {
        mixins: currentMixins.concat([React.BackboneMixin]),
        getModel: function() {
            return this.props.model;
        },
        model: function() {
            return this.getModel();
        },
        el: function() {
            return this._rootNode && this.getDOMNode();
        }
    });
    return React.createClass(spec);
};
