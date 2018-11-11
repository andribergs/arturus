class Database {
	constructor(config) {
		this.config = config;
		firebase.initializeApp(config);
		this.rootRef = firebase.database().ref();
	}

	getAllData() {
		return this.rootRef.once('value').then(function(snapshot) {
			return snapshot.val();
		});
	}

	addObject(object) {
		const key = Date.now();
		update = {};
		update[key] = object;
		rootRef.update(update);
	}

	initEventListeners() {
		rootRef.on('child_changed', function(data) {
			console.log("child_changed", data.val());
		});

		rootRef.on('child_added', function(data) {
			console.log("child_added", data.val());
		});

		rootRef.on('child_removed', function(data) {
			console.log("child_removed", data.val());
		});
	}
}



