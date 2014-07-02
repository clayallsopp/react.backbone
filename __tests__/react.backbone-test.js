/** @jsx React.DOM */
jest.autoMockOff();

describe('react.backbone', function() {
  var ReactWithAddons = require('react/addons');
  var TestUtils = ReactWithAddons.addons.TestUtils;
  var Backbone = require('backbone');
  var React = require('../react.backbone.js');

  describe("with :model key", function() {
    var UserView = React.createBackboneClass({
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
      TestUtils.renderIntoDocument(userView);

      var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
      expect(header.getDOMNode().textContent).toEqual('Clay');
    });

    it('renders model after changes to property', function() {
      var user = new Backbone.Model({name: "Clay"});
      var userView = UserView({model: user});
      TestUtils.renderIntoDocument(userView);
      user.set("name", "David");

      var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
      expect(header.getDOMNode().textContent).toEqual('David');
    });

    describe("with changeOptions", function() {
      var UserView = React.createBackboneClass({
        changeOptions: "change:name",
        render: function() {
            return (
              <div>
                  <h1>{this.getModel().get("name")} {this.getModel().get("age")}</h1>
              </div>
            );
        }
      });

      it('doesnt render if other property is changed', function() {
        var user = new Backbone.Model({name: "Clay", age: "80"});
        var userView = UserView({model: user});
        TestUtils.renderIntoDocument(userView);
        user.set("age", "60");

        var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
        expect(header.getDOMNode().textContent).toEqual('Clay 80');
      });

      it('does render if valid property is changed', function() {
        var user = new Backbone.Model({name: "Clay", age: "80"});
        var userView = UserView({model: user});
        TestUtils.renderIntoDocument(userView);
        user.set("name", "David");

        var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
        expect(header.getDOMNode().textContent).toEqual('David 80');
      });

    });
  });

  describe("with :collection key", function() {
    var UsersListView = React.createBackboneClass({
      render: function() {
        var usersList = this.getCollection().map(function(user) {
            return <li>{user.get("name")}</li>;
        });

        return (
          <ul>
            { usersList }
          </ul>
        );
      }
    });

    it('renders collection as-is', function() {
      var usersList = new Backbone.Collection([{name: "Clay"}, {name: "David"}]);
      var usersListView = UsersListView({collection: usersList});
      TestUtils.renderIntoDocument(usersListView);

      jest.runOnlyPendingTimers();

      var list = TestUtils.findRenderedDOMComponentWithTag(usersListView, 'ul');
      expect(list.getDOMNode().childNodes.length).toEqual(2);
      expect(list.getDOMNode().childNodes[0].textContent).toEqual("Clay");
    });

    it('renders collection on adding', function() {

      var usersList = new Backbone.Collection([{name: "Clay"}, {name: "David"}]);
      var usersListView = UsersListView({collection: usersList});
      TestUtils.renderIntoDocument(usersListView);
      usersList.add({name: "Jack"});

      jest.runOnlyPendingTimers();

      var list = TestUtils.findRenderedDOMComponentWithTag(usersListView, 'ul');
      expect(list.getDOMNode().childNodes.length).toEqual(3);
      expect(list.getDOMNode().childNodes[2].textContent).toEqual("Jack");
    });
  });

});