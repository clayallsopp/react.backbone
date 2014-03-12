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

            var changeOptions;
            var _safeForceUpdate = function(){
                if (! this.isMounted()) {
                    return;
                }
                (this.onModelChange || this.forceUpdate).call(this);
            };
            var _throttledForceUpdate = _.debounce(_safeForceUpdate.bind(this, null),  10);


            if (this.changeOptions) {
                changeOptions = this.changeOptions;
            } else if (model instanceof Backbone.Collection) {
                changeOptions = 'add remove reset sort';
            } else {
                changeOptions = 'change';
            }
            model.on(changeOptions, _throttledForceUpdate, this);

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
            if (this.props.model === nextProps.model) {
                return;
            }

            this._unsubscribe(this.props.model);
            this._subscribe(nextProps.model);

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
