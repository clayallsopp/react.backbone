react.backbone
==============

Plugin for React to make Backbone migration easier. Initialize your view with a Backbone.Model; when this model changes, `#render` will be called.

```javascript
UserView = React.createBackboneClass({
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
```
