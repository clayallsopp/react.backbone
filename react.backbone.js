(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('backbone'), require('react'), require('underscore'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'react', 'underscore'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.Backbone, root.React, root._);
    }
}(this, function (Backbone, React, _) {
    "use strict";

    var collection_behavior = {
        changeOptions: 'add remove reset sort',
        update_scheduler: function(func) { return _.debounce(func, 0); }
    };
    var model_behavior = {
        changeOptions: 'change',
        update_scheduler: _.identity
        //note: if we debounce models too we can no longer use model attributes
        //as properties to react controlled components due to https://github.com/facebook/react/issues/955
    };

    var subscribe = function(component, model, customChangeOptions) {
        if (!model) {
            return;
        }

        var behavior = model instanceof Backbone.Collection ? collection_behavior : model_behavior;

        var triggerUpdate = behavior.update_scheduler(function() {
            if (component.isMounted())
                (component.onModelChange || component.forceUpdate).call(component);
        });
        var changeOptions = customChangeOptions || component.changeOptions || behavior.changeOptions;
        model.on(changeOptions, triggerUpdate, component);
    };

    var unsubscribe = function(component, model) {
        if (!model) {
            return;
        }
        model.off(null, null, component);
    };
    React.BackboneMixin = function(prop_name, customChangeOptions) { return {
        componentDidMount: function() {
            // Whenever there may be a change in the Backbone data, trigger a reconcile.
            subscribe(this, this.props[prop_name], customChangeOptions);
        },
        componentWillReceiveProps: function(nextProps) {
            if (this.props[prop_name] === nextProps[prop_name]) {
                return;
            }

            unsubscribe(this, this.props[prop_name]);
            subscribe(this, nextProps[prop_name], customChangeOptions);

            if (typeof this.componentWillChangeModel === 'function') {
                this.componentWillChangeModel();
            }
        },
        componentDidUpdate: function(prevProps, prevState) {
            if (this.props[prop_name] === prevProps[prop_name]) {
                return;
            }

            if (typeof this.componentDidChangeModel === 'function') {
                this.componentDidChangeModel();
            }
        },
        componentWillUnmount: function() {
            // Ensure that we clean up any dangling references when the component is destroyed.
            unsubscribe(this, this.props[prop_name]);
        }
    };};
    _.extend(React.BackboneMixin, React.BackboneMixin('model'));

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

        spec.mixins = currentMixins.concat([
            React.BackboneMixin('model'),
            React.BackboneViewMixin
        ]);
        return React.createClass(spec);
    };

    return React;

}));
