/** @jsx React.DOM */
jest.autoMockOff();

describe('react.backbone', function() {
  var ReactWithAddons = require('react/addons');
  var TestUtils = ReactWithAddons.addons.TestUtils;

  var Backbone = require('backbone');
  var React = require('../react.backbone.js');

  var UserView = React.createBackboneClass({
      changeOptions: "change:name",
      render: function() {
          return (
            <div>
                <h1>{this.getModel().get("name")}</h1>
            </div>
          );
      }
  });

  it('renders model as-is', function() {
    var user = new Backbone.Model({name: "Clay"});
    var userView = UserView({model: user});
    var component = TestUtils.renderIntoDocument(userView);

    var header = TestUtils.findRenderedDOMComponentWithTag(component, 'h1');
    expect(header.getDOMNode().textContent).toEqual('Clay');
  });

  it('renders model after changes', function() {
    var user = new Backbone.Model({name: "Clay"});
    var userView = UserView({model: user});
    var component = TestUtils.renderIntoDocument(userView);
    user.set("name", "David");

    var header = TestUtils.findRenderedDOMComponentWithTag(component, 'h1');
    expect(header.getDOMNode().textContent).toEqual('David');
  });
});