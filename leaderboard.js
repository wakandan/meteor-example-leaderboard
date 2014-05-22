// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  Meteor.startup(function () {
    Session.set("sort_order", {score: -1, name: 1})
  })

  Session.set("name_sort", 1);

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get('sort_order')});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }, 
    'click input.inc_random': function function_name (argument) {
      
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },
    'click input.delete_player': function function_name (argument) {
      Players.remove(this._id);
    },
  });  

  Template.sorting_toolbar.events({
    'click input.sort_name': function () {      
      var sortOrder = Session.get('sort_order');
      if(sortOrder.name===-1){
        Session.set('sort_order', {name: 1, score: -1});
      } else {
        Session.set('sort_order', {name: -1, score: 1});
      }
    }
  });

  // leaderboard.js
  Validation = {
    clear: function () { 
      return Session.set("error", undefined); 
    },
    set_error: function (message) {
      return Session.set("error", message);
    },
    valid_name: function (name) {
      this.clear();
      if (name.length == 0) {
        this.set_error("Name can't be blank");
        return false;
      } else if (this.player_exists(name)) {
        this.set_error("Player already exists");
        return false;
      } else {
        return true;
      }
    },
    player_exists: function(name) {
      return Players.findOne({name: name});
    }
  };

  // leaderboard.js
  Template.new_player.error = function () {
    return Session.get("error");
  };

  Template.new_player.events({
    'click input.add_player': function function_name (argument) {
      var new_player_name = document.getElementById('new_player_name').value;
      if(Validation.valid_name(new_player_name)){
        Players.insert({name: new_player_name, score: 0});
        //reset input box value        
        document.getElementById('new_player_name').value = '';
      }        
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
