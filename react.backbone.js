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

    var collection_behavior = {
      change_options: 'add remove reset sort',
      update_scheduler: function(func){ return _.debounce(func,0); }
    };
    var model_behavior = {
      change_options: 'change',
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

        model.on(customChangeOptions || behavior.change_options, triggerUpdate, component);
    };

    var unsubscribe = function(component, model) {
        if (!model) {
            return;
        }
        model.off(null, null, component);
    };
    React.BackboneMixin = function(prop_name, customChangeOptions){ return {
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
            React.BackboneMixin('model', spec.changeOptions),
            React.BackboneViewMixin
        ]);
        return React.createClass(spec);
    };

    return React;

}));
