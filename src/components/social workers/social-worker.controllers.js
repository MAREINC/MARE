const keystone = require( 'keystone' );

exports.getSocialWorkerById = id => {

	return new Promise( ( resolve, reject ) => {
		// if no id was passed in
		if( !id ) {
			// reject the promise with details of the error
			return reject( new Error( `no id value provided` ) );
		}
		// fetch the social worker record
		keystone.list( 'Social Worker' ).model
			.findById( id )
			.exec()
			.then( socialWorker => {
				// if no social worker was found with a matching id
				if( !socialWorker ) {
					// reject the promise with the reason why
					reject( new Error( `no social worker could be found matching id ${ id }` ) );
				}
				// resolve the promise with the returned social worker
				resolve( socialWorker );
			// if an error occurred fetching from the database
			}, err => {
				// reject the promise with details of the error
				reject( new Error( `error fetching social worker matching id ${ id }` ) );
			});
	});
};


exports.getSocialWorkersByIds = ids => {

	return new Promise( ( resolve, reject ) => {
		// if no ids was passed in
		if( !Array.isArray(ids) ) {
			// reject the promise with details of the error
			return reject( new Error( `no ids value provided` ) );
		}
		// fetch the social worker record
		keystone.list( 'Social Worker' ).model
			.find( {
				'_id': { $in: ids }
			})
			.exec()
			.then( socialWorkers => {
				// if no social worker was found
				if( !socialWorkers ) {
					// reject the promise with the reason why
					reject( new Error( `no social worker could be found matching the ids` ) );
				}
				// resolve the promise with the returned social workers
				resolve( socialWorkers );
			// if an error occurred fetching from the database
			}, err => {
				// reject the promise with details of the error
				reject( new Error( `error fetching social worker matching the ids` ) );
			});
	});
};

exports.fetchSocialWorkersChildren = id => {

	return new Promise( ( resolve, reject ) => {
		// if the id isn't set
		if( !id ) {
			// resolve the promise with an empty array to prevent downstream array checks from failing
			return resolve( [] );
		}

		keystone.list( 'Child' ).model
			.find( { $or: [
						{ adoptionWorker: id },
						{ recruitmentWorker: id } ] } )
			.populate( 'status' )
			.lean()
			.exec()
			.then( children => {
				// TODO: this can be moved into where statements on the query itself
				// filter out any children that are not active or on hold
				let displayChildren = children.filter( child => child.status.childStatus === 'active' || child.status.childStatus === 'on hold' );
				
				resolve( displayChildren );

			}, err => {
				// log the error for debugging purposes
				console.error( `an error occurred fetching the children registered by social worker with id ${ id }`, err );
				// allow further processing beyond this middleware
				reject();
			});
	});
};

exports.getActiveSocialWorkerIds = () => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Social Worker' ).model
			.find()
			.where( 'isActive' ).equals( true )
			.select( '_id' )
			.lean()
			.exec()
			.then( socialWorkers => {

				if( !socialWorkers ) {
					return reject( new Error( `no active social workers could be found` ) );
				}

				const socialWorkerIds = socialWorkers.map( socialWorker => socialWorker._id.toString() );
				
				resolve( socialWorkerIds );
				
			}, err => {
				reject( 'error fetching active social workers' );
			});
	});
};

/* get all social workers that match the query in the name field and sort them by name */
exports.getSocialWorkersByName = ( nameQuery, maxResults ) => {

	return new Promise( ( resolve, reject ) => {
		// if no maxResults was passed in
		if( !maxResults ) {
			// return control to the calling context
			return reject( new Error( `error fetching social workers by name - no maxResults passed in` ) );
		}
		
		// fetch the social worker records
		keystone.list( 'Social Worker' ).model
			.find( {
				'name.full' : new RegExp( nameQuery, 'i' )
			})
			.sort( {
				'name.full' : 'asc'
			})
			.limit( maxResults )
			.exec()
			.then( socialWorkers => {
				// resolve the promise with the returned social workers
				resolve( socialWorkers );
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching social workers by name ${ nameQuery } and max results ${ maxResults }`, err );
				// reject the promise with details about the error
				reject( new Error( `error fetching social workers by name ${ nameQuery } and max results ${ maxResults } - ${ err }` ) );
			});
	});
};

/* Cron job function used to batch save all social worker models */
exports.saveAllSocialWorkers = () => {

	return new Promise( async ( resolve, reject ) => {

		try {
			// start with the first page of social workers
			let page = 1,
				socialWorkersPerPage = 25;

			// create an array of errors to display once all models have been saved
			let errors = [];

			// pages will increment until there are no more pages, at which point it will be set to false
			while( page ) {
				// log the progress to make tracking of each run easier to monitor
				if( ( page * socialWorkersPerPage ) % 100 === 0 ) {
					console.log( `saving social worker ${ page * socialWorkersPerPage }` );
				}
				// fetch the current page of social workers
				try {
					// destructure the results of the fetch into two local variables
					const { socialWorkers, nextPage } = await exports.fetchSocialWorkersByPage( { page, socialWorkersPerPage } );
					// loop through the fetched page of social workers
					for( let socialWorker of socialWorkers ) {
						// attempt to save the child and log an error if one occurred
						try {
							await socialWorker.save();
						}
						catch( err ) {
							errors.push( `error saving social worker ${ socialWorker.name.full } - ${ err }` );
						}
					}
					// increment the page to allow fetching of the next batch of social workers
					page = nextPage;
				}
				// if there was an error, log it and don't increment the page to allow another attempt at fetching it
				catch( err ) {
					console.error( `error fetching page ${ page } of social workers`, err );
				}
			}

			// log each of the errors to the console
			for( let error of errors ) {
				console.error( error );
			}

			// if there were errors, resolve the promise with an error state and return the errors
			if( errors.length > 0 ) {
				return resolve( {
					status: 'errors',
					errors
				});
			}
			// if there were no errors, resolve the pormise with a success state
			return resolve({
				status: 'success'
			});
		}
		catch( err ) {
			console.error( `error saving all social workers`, err );
		}
	});
};

exports.fetchSocialWorkersByPage = ( { page = 1, socialWorkersPerPage = 25, filters = {} } ) => {

	return new Promise( ( resolve, reject ) => {
		// fetch the requested page of social worker records, 
		keystone.list( 'Social Worker' )
			.paginate ({
				page: page,
				perPage: socialWorkersPerPage,
				filters: filters
			})
			.exec ( ( err, socialWorkers ) => {
				// if there was an error fetching the social workers
				if( err ) {
					// reject the promise with the error
					return reject( new Error( `page ${ page } could not be fetched` ) );
				}

				// resolve the promise with the social workers and the next page to fetch ( false if this is the last page )
				resolve({
					socialWorkers: socialWorkers.results,
					nextPage: socialWorkers.next
				});
			});
	});
};