Router.route("/", function() { this.render("controlSurface") }, { fastRender: true });
Router.route("/screen:num", function() { this.render("screen" + this.params.num) }, { fastRender: true });
Router.route("/remote:num", function() { this.render("remote" + this.params.num) }, { fastRender: true });

InMemory = new Mongo.Collection("inMemory");
Runs = new Mongo.Collection("runs");

if (Meteor.isClient) {

  moment.locale('nl-NL');

  Meteor.subscribe('runs_ready', function() {
    var newest = getNewest();
    Session.set("active", newest);
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
    runs: function() {
      return Runs.find({}, {sort: {createdAt: -1}});
    },
    maybeNewest: function() {
      return isNewest();
    },
    start: function() {
      return getStart();
    },
    end: function() {
      return getEnd();
    },
    current: function() {
      return Session.get("timestamp");
    },
    prettyCurrent: function() {
      return isNewest()
        ? "LIVE"
        : moment(parseInt(Session.get("timestamp")) * 1000).format('dd H:mm:ss');
    }
  });

  Template.remote2.events({
    "click tr": function() {
      Session.set("active", this);
      Session.set("timestamp", toSeconds(this.createdAt));

      clearTimeout(timeout);
      if (!isNewest()) play();
    }
  });

  function toSeconds(datetime) {
    return Math.floor(datetime.getTime() / 1000);
  }

  function isNewest() {
    var active = Session.get("active");
    var newest = getNewest();
    if (active == null || newest == null) return;

    return active._id == newest._id;
  }

  function getNewest() {
    return Runs.findOne({}, {sort: {createdAt: -1}});
  }

  function getNext() {
    var current = Runs.findOne(Session.get("active"));
    if (current == null) return;

    var next = Runs.findOne({createdAt: {$gt: current.createdAt}}, {sort: {createdAt: 1}});
    return next;
  }

  function getStart() {
    var current = Session.get("active");
    if (current == null) return;

    return toSeconds(current.createdAt);
  }

  function getEnd() {
    var next = getNext();
    if (next == null) return;

    return toSeconds(next.createdAt);
  }

  var timeout;
  function play() {
    timeout = setTimeout(function() {
      Session.set("timestamp", 1 + Session.get("timestamp"));
      if (Session.get("timestamp") >= getEnd()) {
        Session.set("active", getNext());
      }
      play();
    }, 1000);
  }

  Template.run.helpers({
    createdAt: function() {
      return moment(this.createdAt).format('dd H:mm:ss');
    },
    timestamp: function() {
      return toSeconds(this.createdAt);
    },
    maybeActive: function() {
      var active = Session.get("active");
      if (active == null) return;

      return active._id == this._id;
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
