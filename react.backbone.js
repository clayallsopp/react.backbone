(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'react'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.Backbone, root.React);
    }
}(this, function (Backbone, React) {
    "use strict";

    var getChangeOptions = function(component, model) {
        if (component.changeOptions) {
            return component.changeOptions;
        } else if (model instanceof Backbone.Collection) {
            return 'add remove reset sort';
        } else {
            return 'change';
        }
    };

    var subscribe = function(component, model) {
        if (!model) {
            return;
        }

        var throttledForceUpdate = _.debounce(function(){
            if (! component.isMounted()) {
                return;
            }
            (component.onModelChange || component.forceUpdate).call(component);
        }, 10);

        var changeOptions = getChangeOptions(component, model);

        model.on(changeOptions, throttledForceUpdate, component);
    };

    var unsubscribe = function(component, model) {
        if (!model) {
            return;
        }
        model.off(null, null, component);
    };

    React.BackboneMixin = {
        componentDidMount: function() {
            // Whenever there may be a change in the Backbone data, trigger a reconcile.
            subscribe(this, this.props.model);
        },
        componentWillReceiveProps: function(nextProps) {
            if (this.props.model === nextProps.model) {
                return;
            }

            unsubscribe(this, this.props.model);
            subscribe(this, nextProps.model);

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
            unsubscribe(this, this.props.model);
        }
    };

    React.BackboneViewMixin = {
        getModel: function() {
            return this.props.model;
        },
        model: function() {
            return this.getModel();
        },
        el: function() {
            return this.isMounted() && this.getDOMNode();
        }
    };

    React.createBackboneClass = function(spec) {
        var currentMixins = spec.mixins || [];

        spec.mixins = currentMixins.concat([React.BackboneMixin, React.BackboneViewMixin]);
        return React.createClass(spec);
    };

    return React;

}));
