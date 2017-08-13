var keystone	= require( 'keystone' ),
	async		= require( 'async' ),
	moment		= require( 'moment' ),
	Donation	= keystone.list( 'Donation' ),
    Utils		= require( './utilities' );

exports.getDonationsGroup = userType => {

	switch( userType ) {
		case 'social worker'	: return 'socialWorker';
		case 'site visitor'		: return 'siteVisitor';
		case 'family'			: return 'family';
	}
}

exports.getAllDonations = () => {
			
	return new Promise( ( resolve, reject ) => {

        Donation.model
            .find()
			.exec()
			.then( donations => {
				// if no donations could be found
				if( donations.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no donations could be found` );
				}
				// resolve the promise with the donations
				resolve( donations );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching donations - ${ err }` );
				// and reject the promise
				reject();
			});
		})
    ;
};

exports.getUserDonations = ( donationGroup, userID ) => {
			
	return new Promise( ( resolve, reject ) => {

        Donation.model
            .find()
            .where( donationGroup, userID )
            .lean()
            .exec()
			.then( donations => {
				// if no donations could be found
				if( donations.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no donations could be found` );
                }
                
                console.log('Donations in service_donation:')
                console.log(donations);
				// resolve the promise with the donations
				resolve( donations );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching donations - ${ err }` );
				// and reject the promise
				reject();
			});
		})
	;
};