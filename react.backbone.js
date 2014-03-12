(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'react'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.Backbone, root.React);
    }
}(this, function (Backbone, React) {
    var _safeForceUpdate = function(){
        if (! this.isMounted()) {
            return;
        }
        (this.onModelChange || this.forceUpdate).call(this);
    };

    getChangeOptions = function(model) {
        if (this.changeOptions) {
            return this.changeOptions;
        } else if (model instanceof Backbone.Collection) {
            return 'add remove reset sort';
        } else {
            return 'change';
        }
    };

    subscribe = function(model) {
        if (!model) {
            return;
        }

        var changeOptions = getChangeOptions.call(this, model);
        var _throttledForceUpdate = _.debounce(_safeForceUpdate.bind(this, null),  10);

        model.on(changeOptions, _throttledForceUpdate, this);
    };
    unsubscribe = function(model) {
        if (!model) {
            return;
        }
        model.off(null, null, this);
    };
    React.BackboneMixin = {
        componentDidMount: function() {
            // Whenever there may be a change in the Backbone data, trigger a reconcile.
            subscribe.call(this, this.props.model);
        },
        componentWillReceiveProps: function(nextProps) {
            if (this.props.model === nextProps.model) {
                return;
            }

            unsubscribe.call(this, this.props.model);
            subscribe.call(this, nextProps.model);

            if (typeof this.componentWillChangeModel === 'function') {
                this.componentWillChangeModel();
            }
        },
        componentDidUpdate: function(prevProps, prevState) {
            if (this.props.model === prevProps.model) {
                return;
            }

            if (typeof this.componentDidChangeModel === 'function') {
                this.componentDidChangeModel();
            }
        },
        componentWillUnmount: function() {
            // Ensure that we clean up any dangling references when the component is destroyed.
            unsubscribe.call(this, this.props.model);
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
