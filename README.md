react.backbone
==============

Plugin for React to make Backbone migration easier. Initialize your view with a Backbone.Model; when this model changes, `#render` will be called.

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

### Installation

Either download `react.backbone.js` or install the `react.backbone` package on Bower:

```
bower install --save react.backbone
```

You can either include react.backbone in a `<script>` tag (after you've included Backbone and React) or through RequireJS/AMD:

```javascript
define(['backbone', 'react', 'react.backbone'], function(Backbone, React) {
    var UserView = React.createBackboneClass({
        // ...
    });
});
```
