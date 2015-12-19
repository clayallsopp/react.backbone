react.backbone
==============

[![Build Status](https://travis-ci.org/clayallsopp/react.backbone.svg)](https://travis-ci.org/clayallsopp/react.backbone)

Plugin for React to make Backbone integration easier. Initialize your component
with a Backbone.Model or Backbone.Collection; when the model or collection
changes, `#render` will be called.

```javascript
var UserViewComponent = React.createBackboneClass({
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
var UserView = React.createFactory(UserViewComponent);
var userView = UserView({model: user});

// Mount your component directly
React.render(userView, document.getElementById('element'));

// Render as a subview
var ProfileViewComponent = React.createClass({
  render: function() {
      return (
        <div>
          <UserViewComponent model={this.props.user} />
        </div>
      );
  }
});

var ProfileView = React.createFactory(ProfileViewComponent);
var profileView = ProfileView({user: user});
React.render(profileView, document.getElementById('element'));
```

React.Backbone also plays nicely with `Backbone.Collection`. Anytime the `add`,
`remove`, `reset` or `sort` events are triggered the component will re-render.

```javascript
var UserViewComponent = React.createBackboneClass({
  render: function() {
    return <li>{ this.getModel().get('name') }</li>;
  }
});

var UsersListViewComponent = React.createBackboneClass({
    render: function() {
        var usersList = this.getCollection().map(function(user) {
            return <UserViewComponent model={user} />;
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
var UsersListView = React.createFactory(UsersListViewComponent);
var usersListView = UsersListView({collection: usersList});

React.render(usersListView, document.getElementById('users'));
```

If you need to use multiple models, you can do so by including the mixin
multiple times:

```javascript
var CommentViewComponent = React.createBackboneClass({
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
var CommentView = React.createFactory(CommentViewComponent);
var commentView = CommentView({user: user, comment: comment});

React.render(usersListView, document.getElementById('users'));
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

If your Collection or Model class does not inherit directly from Backbone.Model 
or Backbone.Collection, you may customize the behavior on a library level by
overriding the React.BackboneMixin.ConsiderAsCollection function.

Return `true` if the object passed should behave as a collection.

```javascript
React.BackboneMixin.ConsiderAsCollection = function (modelOrCollection) {
  return modelOrCollection instanceof Backbone.Collection || modelOrCollection instanceof MyCustomCollection;
}
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
    var UserViewComponent = React.createBackboneClass({
        // ...
    });
});
```

Version 0.7.0 supports React >0.14 and Backbone >1.0; for React <0.14, check out versions 0.6.0 and prior
