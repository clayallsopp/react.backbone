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
      var userViewRef = UserView({model: user});
      var userView = TestUtils.renderIntoDocument(userViewRef);

      var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
      expect(header.getDOMNode().textContent).toEqual('Clay');
    });

    it('renders model after changes to property', function() {
      var user = new Backbone.Model({name: "Clay"});
      var userViewRef = UserView({model: user});
      var userView = TestUtils.renderIntoDocument(userViewRef);
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
        var userViewRef = UserView({model: user});
        var userView = TestUtils.renderIntoDocument(userViewRef);
        user.set("age", "60");

        var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
        expect(header.getDOMNode().textContent).toEqual('Clay 80');
      });

      it('does render if valid property is changed', function() {
        var user = new Backbone.Model({name: "Clay", age: "80"});
        var userViewRef = UserView({model: user});
        var userView = TestUtils.renderIntoDocument(userViewRef);
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
      var usersListViewRef = UsersListView({collection: usersList});
      var usersListView = TestUtils.renderIntoDocument(usersListViewRef);

      jest.runOnlyPendingTimers();

      var list = TestUtils.findRenderedDOMComponentWithTag(usersListView, 'ul');
      expect(list.getDOMNode().childNodes.length).toEqual(2);
      expect(list.getDOMNode().childNodes[0].textContent).toEqual("Clay");
    });

    it('renders collection on adding', function() {

      var usersList = new Backbone.Collection([{name: "Clay"}, {name: "David"}]);
      var usersListViewRef = UsersListView({collection: usersList});
      var usersListView = TestUtils.renderIntoDocument(usersListViewRef);
      usersList.add({name: "Jack"});

      jest.runOnlyPendingTimers();

      var list = TestUtils.findRenderedDOMComponentWithTag(usersListView, 'ul');
      expect(list.getDOMNode().childNodes.length).toEqual(3);
      expect(list.getDOMNode().childNodes[2].textContent).toEqual("Jack");
    });
  });

  describe("with mixins", function() {
    var ProfileView = React.createBackboneClass({
      mixins: [
        React.BackboneMixin("user"),
        React.BackboneMixin("wall")
      ],
      render: function() {
        return (
          <div>
            <h1>{this.props.user.get("name")}</h1>
            <h2>{this.props.wall.get("post_count")} Posts</h2>
          </div>
        );
      }
    });

    it("should render mixins as-is", function() {
      var user = new Backbone.Model({name: "Clay"});
      var wall = new Backbone.Model({post_count: 5});
      var profileViewRef = ProfileView({user: user, wall: wall});
      var profileView = TestUtils.renderIntoDocument(profileViewRef);

      var header = TestUtils.findRenderedDOMComponentWithTag(profileView, 'h1');
      expect(header.getDOMNode().textContent).toEqual('Clay');

      var header2 = TestUtils.findRenderedDOMComponentWithTag(profileView, 'h2');
      expect(header2.getDOMNode().textContent).toEqual('5 Posts');

    });

    it("should re-render if either mixin model is changed", function() {
      var user = new Backbone.Model({name: "Clay"});
      var wall = new Backbone.Model({post_count: 5});
      var profileViewRef = ProfileView({user: user, wall: wall});
      var profileView = TestUtils.renderIntoDocument(profileViewRef);

      user.set("name", "David");
      var header = TestUtils.findRenderedDOMComponentWithTag(profileView, 'h1');
      expect(header.getDOMNode().textContent).toEqual('David');

      wall.set("post_count", 6);
      var header2 = TestUtils.findRenderedDOMComponentWithTag(profileView, 'h2');
      expect(header2.getDOMNode().textContent).toEqual('6 Posts');
    });

    describe("with options", function() {
      describe("with propName", function() {
        var UserView = React.createBackboneClass({
          mixins: [
            React.BackboneMixin({
              propName: "user_model"
            })
          ],
          render: function() {
            return (
              <div>
                <h1>{this.props.user_model.get("name")}</h1>
              </div>
            );
          }
        });
        it("should use that prop", function() {
          var user = new Backbone.Model({name: "Clay"});
          var userViewRef = UserView({user_model: user});
          var userView = TestUtils.renderIntoDocument(userViewRef);

          var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
          expect(header.getDOMNode().textContent).toEqual('Clay');
        });
      });

      describe("with renderOn", function() {
        var UserView = React.createBackboneClass({
          mixins: [
            React.BackboneMixin({
              propName: "user_model",
              renderOn: "change:name"
            })
          ],
          render: function() {
            return (
              <div>
                <h1>{this.props.user_model.get("name")} {this.props.user_model.get("age")}</h1>
              </div>
            );
          }
        });
        it("should use that event", function() {
          var user = new Backbone.Model({name: "Clay", age: 25});
          var userViewRef = UserView({user_model: user});
          var userView = TestUtils.renderIntoDocument(userViewRef);
          var header;

          user.set("age", 26);
          header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
          expect(header.getDOMNode().textContent).toEqual('Clay 25');

          user.set("name", "David");
          expect(header.getDOMNode().textContent).toEqual('David 26');
        });
      });

      describe("with modelOrCollection", function() {
        var UserView = React.createBackboneClass({
          mixins: [
            React.BackboneMixin({
              modelOrCollection: function(props) {
                return props.user_model;
              }
            })
          ],
          render: function() {
            return (
              <div>
                <h1>{this.props.user_model.get("name")}</h1>
              </div>
            );
          }
        });
        it("should use that return value", function() {
          var user = new Backbone.Model({name: "Clay"});
          var userViewRef = UserView({user_model: user});
          var userView = TestUtils.renderIntoDocument(userViewRef);

          var header = TestUtils.findRenderedDOMComponentWithTag(userView, 'h1');
          expect(header.getDOMNode().textContent).toEqual('Clay');

          user.set("name", "David");
          expect(header.getDOMNode().textContent).toEqual('David');
        });
      });

    });
  });

});