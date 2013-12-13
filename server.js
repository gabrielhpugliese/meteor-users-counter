function addTimestamp (doc) {
    doc.when = Date.now();
}

Viewers.before.insert(function (userId, doc) {
    doc = addTimestamp(doc);
});

Viewers.before.update(function (userId, doc) {
    doc = addTimestamp(doc);
});

Meteor.publish('Viewers', function (path) {
    if (_.isEmpty(path)) {
        return [];
    }

    check(path, String);
    return Viewers.find({path: path}, {fields: {when: 0, path: 0}});
});

Meteor.methods({
    'heartbeat': function (uuid, path) {
        check(uuid, String);
        check(path, String);
        this.unblock();

        var viewer = Viewers.findOne({uuid: uuid});
        if (viewer) {
            Viewers.update({uuid: uuid}, {$set: {path: path}}); 
        } else {
            Viewers.insert({uuid: uuid, path: path});
        }
    }
})

var CLEAN_INTERVAL = 20000;
Meteor.setInterval(function () {
    var when = Date.now() - CLEAN_INTERVAL;
    Viewers.remove({when: {$lt: when}});
}, CLEAN_INTERVAL);

Meteor.startup(function () {
    Viewers._ensureIndex({uuid: true}, {unique: true});
});
