Router.route("/", function() { this.render("controlSurface") }, { fastRender: true });
Router.route("/screen:num", function() { this.render("screen" + this.params.num) }, { fastRender: true });
Router.route("/remote:num", function() { this.render("remote" + this.params.num) }, { fastRender: true });

InMemory = new Mongo.Collection("inMemory");
Runs = new Mongo.Collection("runs");

if (Meteor.isClient) {

  Template.controlSurface.helpers({
    screen: [1,2,3,4]
  });

  Template.remote1.events({
    "submit .new-run": function (event) {
      // This function is called when the new run form is submitted
      var text = event.target.text.value;
      if (text == "") return false;

      Runs.insert({
        text: text,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });

  Template.remote2.helpers({
    runs: function () {
      return Runs.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.remote2.events({
    "click tr": function () {
      var active = InMemory.findOne({ key: "active" });
      if (active)
        InMemory.update(active._id, {$set: {value: this._id}});
      else
        InMemory.insert({ key: "active", value: this._id });
    }
  });

  Template.run.helpers({
    createdAt: function() {
      return moment(this.createdAt).fromNow();
    },
    maybeActive: function() {
      return InMemory.findOne({ key: "active", value: this._id });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
