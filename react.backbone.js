(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'react'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.Backbone, root.React);
    }
}(this, function (Backbone, React) {

    React.BackboneMixin = {
        _subscribe: function(model) {
            if (!model) {
                return;
            }
            // Detect if it's a collection
            if (model instanceof Backbone.Collection) {
                var changeOptions = this.changeOptions || 'add remove reset sort';
                var _throttledForceUpdate = _.debounce(this.forceUpdate.bind(this, null),  10);
                model.on(changeOptions, _throttledForceUpdate, this);
            }
            else if (model) {
                var changeOptions = this.changeOptions || 'change';
                model.on(changeOptions, (this.onModelChange || function () { this.forceUpdate(); }), this);
            }
        },
        _unsubscribe: function(model) {
            if (!model) {
                return;
            }
            model.off(null, null, this);
        },
        componentDidMount: function() {
            // Whenever there may be a change in the Backbone data, trigger a reconcile.
            this._subscribe(this.props.model);
        },
        componentWillReceiveProps: function(nextProps) {
            if (this.props.model !== nextProps.model) {
                this._unsubscribe(this.props.model);
                this._subscribe(nextProps.model);
            }
        },
        componentWillUnmount: function() {
            // Ensure that we clean up any dangling references when the component is destroyed.
            this._unsubscribe(this.props.model);
        }
    };

    React.createBackboneClass = function(spec) {
        var currentMixins = spec.mixins || [];

        spec.mixins = currentMixins.concat([React.BackboneMixin]);
        spec.getModel = function() {
            return this.props.model;
        };
        spec.model = function() {
            return this.getModel();
        };
        spec.el = function() {
            return this.isMounted() && this.getDOMNode();
        };
        return React.createClass(spec);
    };

    return React;

}));
