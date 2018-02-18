const keystone		= require( 'keystone' ),
	  middleware	= require( './middleware' );

// instantiate the generator used to save families at a controlled rate
const familiesGenerator = fixFamiliesGenerator();

exports.fixFamilies = function( req, res, next ) {
	// if the user is trying to run this script against the production database
	if( /^.*\/mare$/.test( process.env.MONGO_URI ) ) {
		// alert them of what they're doing and how to get around this message
		return res.send(`
		
			WARNING:
		
			You are running this script against the production database.
		
			To allow execution, open fix_family.js and comment out the if block in fixFamilies()` );
	}
	// kick off the first run of our generator
	familiesGenerator.next();
};

/* loops through every family record, resaving them */
function* fixFamiliesGenerator() {
	// set the page of families to fetch
	let page = 1,
		errors = [];

	while( page ) {
		console.info( `saving families ${ ( page - 1 ) * 100 } - ${ page * 100 }` );
		// fetch the page of families, waiting to execute further code until we have a result
		const fetchedFamilies = yield fetchFamiliesByPage( page );
		// if there was an error fetching the page of families
		if( fetchedFamilies.responseType === 'error' ) {
			// log the error for debugging purposes
			console.error( `error fetching page ${ page } of children - ${ fetchedFamilies.error }` );
		// if the page of families was fetched successfully
		} else {
			// loop through each of the returned family models
			for( let family of fetchedFamilies.families ) {
				// save the family using the saveFamily generator
				const savedFamily = yield saveFamily( family );
				// if there was an error
				if( savedFamily.responseType === 'error' ) {
					// push it to the errors array for display after all families have saved
					errors.push( savedFamily.message );
				}
			}
		}
		// increment the page to fetch for the next run, or set it to false if there are no more pages to fetch
		page = fetchedFamilies.nextPage;
	}
	// loop through each saved error
	for( let error of errors ) {
		// log the error for debugging purposes
		console.error( error );
	}
};

function fetchFamiliesByPage( page ) {

	return new Promise( ( resolve, reject ) => {
		// fetch the request page of family records
		keystone.list( 'Family' )
			.paginate ({
				page: page || 1,
				perPage: 100,
				filters: {} // add any needed filters as { key: value }
			})
			.exec ( ( err, families ) => {

				// if there was an error
				if( err ) {
					// reject the promise with the error and the next page to fetch ( false if this is the last page )
					familiesGenerator.next({
						responseType: 'error',
						error: err,
						nextPage: families.next });
				// if the families were fetched successfully
				} else {
					// resolve the promise with the families and the next page to fetch ( false if this is the last page )
					familiesGenerator.next({
						responseType: 'success',
						families: families.results,
						nextPage: families.next });
				}
			});
	});
}

function saveFamily( family ) {

	return new Promise( ( resolve, reject ) => {
		const numberOfChildrenToAdopt = family.get( 'matchingPreferences.numberOfChildrenToAdopt' );
		// if a value is set for number of children to adopt
		if( numberOfChildrenToAdopt ) {
			// set min and max number of children to adopt fields
			family.set( 'matchingPreferences.minNumberOfChildrenToAdopt', numberOfChildrenToAdopt );
			family.set( 'matchingPreferences.maxNumberOfChildrenToAdopt', numberOfChildrenToAdopt );
			// delete the number of children to adopt field.  Strict needs to be set to false since the field is no longer part of the schema
			family.set( 'matchingPreferences.numberOfChildrenToAdopt', undefined, { strict: false } );
		}
		// attempt the save the family
		family.save( ( err, savedModel ) => {
			// if we run into an error
			if( err ) {
				// return control back to the generator with details about the error
				familiesGenerator.next({
					responseType: 'error',
					message: `${ family.get( 'name.full' ) } - ${ family.get( 'id' ) } - ${ err }` } );
			// if the model saved successfully
			} else {
				// return control back to the generator
				familiesGenerator.next( { responseType: 'success' } );
			}
		});
	});
};
