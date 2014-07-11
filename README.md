react.backbone
==============

[![Build Status](https://travis-ci.org/usepropeller/react.backbone.svg)](https://travis-ci.org/usepropeller/react.backbone)

Plugin for React to make Backbone integration easier. Initialize your component
with a Backbone.Model or Backbone.Collection; when the model or collection
changes, `#render` will be called.

```javascript
var UserView = React.createBackboneClass({
    changeOptions: "change:name", // DEFAULT is "change",
    render: function() {
        return (
          <div>
              <h1>{this.getModel().get("name")}</h1>
          </div>
        );
    }
});

var user = new Backbone.Model();
var userView = UserView({model: user});

// Mount your component directly
React.renderComponent(userView, document.getElementById('element'));

// Render as a subview
var ProfileView = React.createClass({
  render: function() {
      return (
        <div>
          <UserView model={this.props.user} />
        </div>
      );
  }
});
```

React.Backbone also plays nicely with `Backbone.Collection`. Anytime the `add`,
`remove`, `reset` or `sort` events are triggered the component will re-render.

```javascript
var UserView = React.createBackboneClass({
  render: function() {
    return <li>{ this.getModel().get('name') }</li>;
  }
});

var UsersListView = React.createBackboneClass({
    render: function() {
        var usersList = this.getCollection().map(function(user) {
            return <UserView model={user} />;
        });

        return (
          <div>
            <ul>
              { usersList }
            </ul>
          </div>
        );
    }
});

var usersList = new Backbone.Collection();
var usersListView = UsersListView({collection: usersList});

React.renderComponent(usersListView, document.getElementById('users'));
```

If you need to use multiple models, you can do so by including the mixin
multiple times:

```javascript
var CommentView = React.createBackboneClass({
    mixins: [

        // when the view is instantiated,
        // 'user' and 'comment' can be passed as props
        React.BackboneMixin("user", "change:name"),
        React.BackboneMixin("comment")
    ],
    render: function() {
        return (
          <div>
              <p>{this.props.comment.get("text")}</p>
              <p>{'posted by' + this.props.user.get("name")}</h1>
          </div>
        );
    }
});

var user = new Backbone.Model();
var comment = new Backbone.Model();
var commentView = CommentView({user: user, comment: comment});

React.renderComponent(usersListView, document.getElementById('users'));
```

You can also pass an object with options to the included mixin:

```javascript
React.BackboneMixin({
    propName: "user",
    renderOn: "change:name"
});
```

Or supply a custom callback to the option `modelOrCollection` to retrieve the
property from the component's props:

```javascript
React.BackboneMixin({
    modelOrCollection: function(props) {
        return props.comment.user;
    },
    renderOn: "change:name"
});
```

### Installation

Either download `react.backbone.js` or install the `react.backbone` package on
Bower:

```
bower install --save react.backbone
```

You can either include react.backbone in a `<script>` tag (after you've
included Backbone and React) or through RequireJS/AMD:

```javascript
define(['backbone', 'react', 'react.backbone'], function(Backbone, React) {
    var UserView = React.createBackboneClass({
        // ...
    });
});
```
