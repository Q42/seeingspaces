Router.route("/", function() { this.render("controlSurface") }, { fastRender: true });
Router.route("/screen:num", function() { this.render("screen" + this.params.num) }, { fastRender: true });
Router.route("/remote:num", function() { this.render("remote" + this.params.num) }, { fastRender: true });

InMemory = new Mongo.Collection("inMemory");
Runs = new Mongo.Collection("runs");

if (Meteor.isClient) {

  Meteor.subscribe('runs_ready', function(){
    var active = Session.get("active");
    var newest = getNewest();

    if (active == null && newest) {
      Session.set("active", newest._id);
    }
  });

  Template.remote1.events({
    "submit .new-run": function (event) {
      var text = event.target.text.value;
      if (text == "") return false;
      Runs.insert({ text: text, createdAt: new Date() });
      event.target.text.value = "";
      return false;
    }
  });

  Template.remote2.helpers({

    currentTimestamp: function() {
      return Session.get("timestamp")
    },
    runs: function () {
      return Runs.find({}, {sort: {createdAt: -1}});
    },
    startTime: function() {
      var currentRun = Runs.findOne(Session.get("active"));
      return currentRun.createdAt.getTime();
    },
    endTime: function() {
      var currentRun = Runs.findOne(Session.get("active"));
      var startTime = currentRun.createdAt.getTime();
      var nextRun = Runs.findOne({createdAt: {$gt: new Date(startTime)}}, {sort: {createdAt: 1}});
      return nextRun.createdAt.getTime();
    },
    prettyTime: function() {
      return moment(currentTime).format('H:mm:ss');
    },
    percentage: function() {
      return 0;
    }
  });

  function getNewest() {
    return Runs.findOne({}, {sort: {createdAt: -1}});
  }

  Template.remote2.events({
    "click tr": function() {
      if (getNewest()._id == this._id) console.log('laatste');
      Session.set("active", this._id);
      //Session.set("timestamp", getStartTimestamp(this._id));
    },
    "change .currentTime": function() {
      //console.log(currentTime);
    }
  });

  Template.run.helpers({
    createdAt: function() {
      moment.locale('nl-NL');
      return moment(this.createdAt).format('dd H:mm:ss');
    },
    timestamp: function() {
      return this.createdAt.getTime();
    },
    maybeActive: function() {

      return Session.get("active") == this._id;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish('runs_ready', function(){
    return Runs.find({});
  });
}
