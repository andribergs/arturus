class Database {
	constructor(config, onDataUpdate) {
		this.config = config;
		firebase.initializeApp(config);
		this.rootRef = firebase.database().ref();
		this.initialized = false;
		this.getDataFromServer().then(data => {
			this.data = data;
			this.initialized = true;
			this.onDataUpdate();
		});
		this.onDataUpdate = onDataUpdate;
		this.initEventListeners();
	}

	getAllObjects() {
		return this.initialized ? Object.keys(this.data).map(key => this.data[key]) : [];
	}

	getDataFromServer() {
		return this.rootRef.once('value').then(function(snapshot) {
			return snapshot.val();
		});
	}

	addObject(object) {
		const key = Date.now();
		const update = {};
		update[key] = object;
		this.rootRef.update(update);
	}

	initEventListeners() {
		const update = data => {
			if(!this.initialized) return;
			const key = data.key;
			const value = data.val();
			console.log("something happnd: ", key, value);
			this.data[key] = value;
			this.onDataUpdate();
		}
		this.rootRef.on('child_changed', function(data) {
			update(data);
		});

		this.rootRef.on('child_added', function(data) {
			update(data);
		});

		this.rootRef.on('child_removed', data => {
			const key = data.key;
			const value = data.val();
			console.log("deleted ", key, value);
			delete this.data[key];
			this.onDataUpdate();
		});
	}
}



