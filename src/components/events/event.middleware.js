const keystone				= require( 'keystone' ),
	  eventService			= require( './event.controllers' ),
	  eventExcelService		= require( './event.excel-export.controllers' ),
	  eventEmailMiddleware	= require( './event.email.controllers' ),
	  socialWorkerService	= require( '../social workers/social-worker.controllers' ),
	  flashMessageMiddleware	= require( '../../utils/notification.middleware' );

exports.register = async ( req, res ) => {
	'use strict';

	let isRegisteredSuccessfully = false;

	// extract the event information from the req object
	const eventDetails = req.body;
	// extract request object parameters into local constants
	eventDetails.eventId = req.params.eventId;

	// if there are unregistered child attendees
	if ( eventDetails.numberOfChildren > 0 ) {

		eventDetails.unregisteredChildren = [];

		// compile unregistered children attendee data into a single array
		for ( let i = 0; i < eventDetails.numberOfChildren; i++ ) {

			let unregisteredChildAttendee = {
				name: {
					first: eventDetails.childFirstName[ i ],
					last: eventDetails.childLastName[ i ]
				},
				age: eventDetails.childAge[ i ],
				registrantID: req.user._id,
				registrantType: req.user.userType
			};

			eventDetails.unregisteredChildren.push( unregisteredChildAttendee );
		}
	}

	// if there are unregistered adult attendees
	if ( eventDetails.numberOfAdults > 0 ) {

		eventDetails.unregisteredAdults = [];

		// compile unregistered adult attendee data into a single array
		for ( let i = 0; i < eventDetails.numberOfAdults; i++ ) {

			let unregisteredAdultAttendee = {
				name: {
					first: eventDetails.adultFirstName[ i ],
					last: eventDetails.adultLastName[ i ]
				},
				registrantID: req.user._id
			};

			eventDetails.unregisteredAdults.push( unregisteredAdultAttendee );
		}
	}

	try {
		// register the user for the event
		await eventService.register( eventDetails, req.user );
		// notify the user that they were successful ( the code to notify MARE executes after this message is sent )
		req.flash( 'success', { title: 'MARE has been notified of your registration',
			detail: 'You can expect to receive a confirmation email with additional details prior to the event' });
		// note that the registration was a success
		isRegisteredSuccessfully = true;
	}
	// if there was an error registering the user for the event
	catch ( err ) {
		// log the error for debugging purposes
		console.error( `error registering ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		// notify the user of the error
		req.flash( 'error', { title: 'There was an issue registering you for this event',
			detail: 'If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
	}
	// send out emails only if they successfully registered for the event
	if( isRegisteredSuccessfully ) {
		// fetch the correct staff contact email address
		try {
			// fetch the correct email contact based on the user type and what information is available on the event
			const eventContactEmail = await eventService.getEventContactEmail({
				eventId: eventDetails.eventId,
				userType: req.user.userType
			});
			// send an email to the staff contact with the registration info
			await eventEmailMiddleware.sendEventRegistrationEmailToMARE( eventDetails, req.user, res.host, eventContactEmail );
		}
		catch( err ) {
			// log the error for debugging purposes
			console.error( `error sending event registration email about ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		}
	}
	// update the stage for families only if they successfully registered for the event
	if( isRegisteredSuccessfully && req.user.userType === 'family' ) {

		let family = req.user,
			isSaveNeeded = false,
			adjustedCurrentDate = new Date().setHours( new Date().getHours() - 5 ); // done because new Date() was saving 5 hours ahead
		// if changes were made to the stage, we need to resave the family with the updated stage and date information
		switch( eventDetails.whereInTheProcess ) {
			// if the family set their stage to 'gathering information'
			case 'gathering information':
				// check to see if 'gathering information' is already selected in the family model
				if( !family.stages.gatheringInformation.started ) {
					// if not, check 'gathering information' and set the date to today
					family.set( 'stages.gatheringInformation.started', true );
					family.set( 'stages.gatheringInformation.date', adjustedCurrentDate );
				}
				// note that we need to save the family model
				isSaveNeeded = true;

				break;
			// if the family set their stage to 'looking for agency'
			case 'looking for agency':
				// check to see if 'looking for agency' is already selected in the family model
				if( !family.stages.lookingForAgency.started ) {
					// if not, check 'looking for agency' and set the date to today
					family.set( 'stages.lookingForAgency.started', true );
					family.set( 'stages.lookingForAgency.date', adjustedCurrentDate );
				}
				// note that we need to save the family model
				isSaveNeeded = true;

				break;
			// if the family set their stage to 'working with agency'
			case 'working with agency':
				// check to see if 'working with agency' is already selected in the family model
				if( !family.stages.workingWithAgency.started ) {
					// if not, check 'working with agency' and set the date to today
					family.set( 'stages.workingWithAgency.started', true );
					family.set( 'stages.workingWithAgency.date', adjustedCurrentDate );
				}
				// note that we need to save the family model
				isSaveNeeded = true;

				break;
			// if the family set their stage to 'MAPP training completed'
			case 'MAPP training completed':
				// check to see if 'MAPP training completed' is already selected in the family model
				if( !family.stages.MAPPTrainingCompleted.completed ) {
					// if not, check 'MAPP training completed' and set the date to today
					family.set( 'stages.MAPPTrainingCompleted.completed', true );
					family.set( 'stages.MAPPTrainingCompleted.date', adjustedCurrentDate );
				}
				// note that we need to save the family model
				isSaveNeeded = true;

				break;
			// if the family set their stage to 'homestudy completed'
			case 'homestudy completed':
				// check to see if 'homestudy completed' is already selected in the family model
				if( !family.homestudy.completed ) {
					// if not, check 'homestudy completed', set the initial date to today, and clear out the most recent date
					family.set( 'homestudy.completed', true );
					family.set( 'homestudy.initialDate', adjustedCurrentDate );
					family.set( 'homestudy.mostRecentDate', undefined );
				}
				// note that we need to save the family model
				isSaveNeeded = true;

				break;
		}

		// if changes were made, attempt to resave the family
		if( isSaveNeeded ) {
			family.save( () => {}, err => {
				// log the error for debugging purposes
				console.error( `there was an error updating the stage for family ${ family.displayName } with id ${ family._id } while they were registering for event ${ eventDetails.eventName }`, err );
			});
		}
	}

	// once all actions have been completed, redirect the user to the path specified in the request. Needed because otherwise it would be impossible to determine which page they registered from
	res.redirect( 303, eventDetails.redirectPath );
};

exports.unregister = async ( req, res ) => {
	'use strict';

	let isUnregisteredSuccessfully = false;

	// extract the event information from the req object
	const eventDetails = req.body;
	// extract request object parameters into local constants
	eventDetails.eventId = req.params.eventId;

	try {
		// unregister the user from the event
		const unregistrationData = await eventService.unregister( eventDetails, req.user );

		// add any registered children that were removed
		eventDetails.registeredChildrenRemoved = ( unregistrationData.registeredChildrenRemoved && unregistrationData.registeredChildrenRemoved.length > 0 )
			? unregistrationData.registeredChildrenRemoved
			: undefined;
		// add any unregistered children that were removed
		eventDetails.unregisteredChildrenRemoved = ( unregistrationData.unregisteredChildrenRemoved && unregistrationData.unregisteredChildrenRemoved.length > 0 )
			? unregistrationData.unregisteredChildrenRemoved
			: undefined;
		// add any unregistered adults that were removed
		eventDetails.unregisteredAdultsRemoved = ( unregistrationData.unregisteredAdultsRemoved && unregistrationData.unregisteredAdultsRemoved.length > 0 )
			? unregistrationData.unregisteredAdultsRemoved
			: undefined;

		// note that the registration was a success
		isUnregisteredSuccessfully = true;
		
		// notify the user that they were successful
		req.flash( 'success', { title: 'MARE has been notified of your change in registration',
			detail: 'For additional questions contact <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
	}
	// if there was an issue registering the attendee
	catch( err ) {
		// log the error for debugging purposes
		console.error( `error unregistering ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		// notify the user of the error
		req.flash( 'error', { title: 'There was an issue changing your registration for this event',
			detail: 'If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
	}

	// send out emails only if they successfully registered for the event
	if( isUnregisteredSuccessfully ) {
		// fetch the correct staff contact email address
		try {
			// fetch the correct email contact based on the user type and what information is available on the event
			const eventContactEmail = await eventService.getEventContactEmail({
				eventId: eventDetails.eventId,
				userType: req.user.userType
			});
			// send an email to the staff contact with the registration info
			await eventEmailMiddleware.sendEventUnregistrationEmailToMARE( eventDetails, req.user, res.host, eventContactEmail );
		}
		catch( err ) {
			// log the error for debugging purposes
			console.error( `error sending event unregistration email about ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		}
	}
	// once all actions have been completed, redirect the user to the path specified in the request. Needed because otherwise it would be impossible to determine which page they registered from
	res.redirect( 303, eventDetails.redirectPath );
};

exports.editRegistration = async ( req, res, next ) => {
	'use strict';

	let isRegisteredSuccessfully = false;
	let doVersionsMatch = false;

	let unregisteredAdults,
		unregisteredChildren,
		registeredChildren;

	// extract the event information from the req object
	const eventDetails = req.body;
	// extract request object parameters into local constants
	eventDetails.eventId = req.params.eventId;
	eventDetails.unregisteredAdults = [];
	eventDetails.unregisteredChildren = [];

	// if there are unregistered child attendees
	if ( eventDetails.numberOfChildren > 0 ) {
		// compile unregistered children attendee data into a single array
		for ( let i = 0; i < eventDetails.numberOfChildren; i++ ) {

			let unregisteredChildAttendee = {
				name: {
					first: eventDetails.childFirstName[ i ],
					last: eventDetails.childLastName[ i ]
				},
				age: eventDetails.childAge[ i ],
				registrantID: req.user._id,
				registrantType: req.user.userType
			};

			eventDetails.unregisteredChildren.push( unregisteredChildAttendee );
		}
	}

	// if there are unregistered adult attendees
	if ( eventDetails.numberOfAdults > 0 ) {
		// compile unregistered adult attendee data into a single array
		for ( let i = 0; i < eventDetails.numberOfAdults; i++ ) {

			let unregisteredAdultAttendee = {
				name: {
					first: eventDetails.adultFirstName[ i ],
					last: eventDetails.adultLastName[ i ]
				},
				registrantID: req.user._id
			};

			eventDetails.unregisteredAdults.push( unregisteredAdultAttendee );
		}
	}

	// test to ensure the version of the event being edited on the front end matches the current version in the database
	try {
		// get the event that's being edited
		let eventToEdit = await eventService.getEventById( { eventId: eventDetails.eventId } );
		
		// check the event versions
		if ( eventToEdit.currentVersion == eventDetails.eventVersion ) {
			// if they match, update the flag and continue with registration edit logic
			doVersionsMatch = true;
		} else {
			// if they do no match, log the error and report the issue to the user
			console.error( `error editing registration for ${ req.user.displayName } for ${ eventDetails.eventName }: event versions do not match.  Rejecting updates to prevent losing attendee data.` );
			// notify the user of the error
			req.flash( 'error', { title: 'There was an issue editing your registration for this event',
				detail: 'The event details were being updated while you were making your changes, please make your changes and submit them again.' } );
		}
	}
	// if there was an error fetching the event
	catch ( err ) {
		// log the error for debugging purposes
		console.error( `error editing registration for ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		// notify the user of the error
		req.flash( 'error', { title: 'There was an issue editing your registration for this event',
			detail: 'If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
	}

	if ( doVersionsMatch ) {
		try {
			// fetch all unregistered adult and child objects associated with the event
			unregisteredAdults = await eventService.getUnregisteredAdults( eventDetails.eventId );
			unregisteredChildren = await eventService.getUnregisteredChildren( eventDetails.eventId );
			registeredChildren = await eventService.getRegisteredChildren( eventDetails.eventId );
			// edit the users event registration
			await eventService.editRegistration( eventDetails, req.user );
			// notify the user that they were successful ( the code to notify MARE executes after this message is sent )
			req.flash( 'success', { title: 'MARE has been notified of your changes',
				detail: 'You can expect to receive a confirmation email with additional details prior to the event' });
			// note that the registration was a success
			isRegisteredSuccessfully = true;
		}
		// if there was an error registering the user for the event
		catch ( err ) {
			// log the error for debugging purposes
			console.error( `error editing registration for ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
			// notify the user of the error
			req.flash( 'error', { title: 'There was an issue editing your registration for this event',
				detail: 'If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
		}
	}

	// send out emails only if they successfully registered for the event
	if( isRegisteredSuccessfully ) {
		// fetch the correct staff contact email address
		try {
			// filter out all unregistered adults who were not registered by the user
			const usersUnregisteredAdults = unregisteredAdults.filter( adult => adult.registrantID === req.user.get( '_id' ).toString() );
			// filter out all unregistered children who were not registered by the user
			const usersUnregisteredChildren = unregisteredChildren.filter( child => child.registrantID === req.user.get( '_id' ).toString() );
			// filter out all registered children who don't have the user as an adoption or recruitment worker
			const usersRegisteredChildren = registeredChildren.filter( child => {
				return ( child.adoptionWorker && child.adoptionWorker.toString() === req.user.get( '_id' ).toString() )
					|| ( child.recruitmentWorker && child.recruitmentWorker.toString() === req.user.get( '_id' ).toString() );
			});
		
			// extract a string of the name of the adults, and name and age of the children, and store them in arrays
			// NOTE: without ids on the submitted children and adults, there's no clean way to compare them
			const unregisteredAdultStrings = usersUnregisteredAdults.map( adult => `${ adult.name.first } ${ adult.name.last }` );
			const unregisteredChildStrings = usersUnregisteredChildren.map( child => `${ child.name.first } ${ child.name.last } (age ${ child.age })` );
			// extract the ids of the registered children and store them in an array
			const registeredChildIds = usersRegisteredChildren.map( child => child.get( '_id' ).toString() );

			// extract a string of the name of the adults, and name and age of the children, and store them in arrays
			const submittedUnregisteredAdultStrings = eventDetails.unregisteredAdults.map( adult => `${ adult.name.first } ${ adult.name.last }` );
			const submittedUnregisteredChildStrings = eventDetails.unregisteredChildren.map( child => `${ child.name.first } ${ child.name.last } (age ${ child.age })` );
			
			// convert unregistered children and adults to sets to easily determine who was added and removed
			const unregisteredAdultSet = new Set( unregisteredAdultStrings );
			const unregisteredChildSet = new Set( unregisteredChildStrings );
			const submittedUnregisteredAdultSet = new Set( submittedUnregisteredAdultStrings );
			const submittedUnregisteredChildSet = new Set( submittedUnregisteredChildStrings );
			// convert registered children to sets to easily determine who was added and removed
			const registeredChildSet = new Set( registeredChildIds );
			const submittedRegisteredChildSet = new Set( eventDetails.registeredChildren );

			const addedUnregisteredAdults = submittedUnregisteredAdultSet.leftOuterJoin( unregisteredAdultSet );
			const addedUnregisteredChildren = submittedUnregisteredChildSet.leftOuterJoin( unregisteredChildSet );
			const removedUnregisteredAdults = submittedUnregisteredAdultSet.rightOuterJoin( unregisteredAdultSet );
			const removedUnregisteredChildren = submittedUnregisteredChildSet.rightOuterJoin( unregisteredChildSet );
			const addedRegisteredChildren = submittedRegisteredChildSet.leftOuterJoin( registeredChildSet );
			const removedRegisteredChildren = submittedRegisteredChildSet.rightOuterJoin( registeredChildSet );

			// fetch the correct email contact based on the user type and what information is available on the event
			const eventContactEmail = await eventService.getEventContactEmail({
				eventId: eventDetails.eventId,
				userType: req.user.userType
			});

			// send an email to the staff contact with the registration info if changes exist
			if( addedUnregisteredAdults.size > 0
				|| addedUnregisteredChildren.size > 0
				|| removedUnregisteredAdults.size > 0
				|| removedUnregisteredChildren.size > 0
				|| addedRegisteredChildren.size > 0
				|| removedRegisteredChildren.size > 0
			) {
				await eventEmailMiddleware.sendEventRegistrationEditedEmailToMARE({
					eventDetails,
					addedRegisteredChildren: Array.from( addedRegisteredChildren ),
					addedUnregisteredChildren: Array.from( addedUnregisteredChildren ),
					addedUnregisteredAdults: Array.from( addedUnregisteredAdults ),
					removedRegisteredChildren: Array.from( removedRegisteredChildren ),
					removedUnregisteredChildren: Array.from( removedUnregisteredChildren ),
					removedUnregisteredAdults: Array.from( removedUnregisteredAdults ),
					userDetails: req.user,
					host: res.host,
					staffContactEmail: eventContactEmail
				});
			}
		}
		catch( err ) {
			// log the error for debugging purposes
			console.error( `error sending event registration edited email about ${ req.user.displayName } for ${ eventDetails.eventName }`, err );
		}
	}

	// once all actions have been completed, redirect the user to the path specified in the request. Needed because otherwise it would be impossible to determine which page they registered from
	res.redirect( 303, eventDetails.redirectPath );
};

exports.exportToExcel = async ( req, res, next ) => {
	// extract request object parameters into local constants
	const eventId = req.params.eventId;

	try {
		// create an array of fields that need to be populated
		const fieldsToPopulate = [
			'staffAttendees',
			'siteVisitorAttendees',
			'socialWorkerAttendees',
			'familyAttendees',
			'childAttendees',
			'outsideContactAttendees'
		];
		// fetch the event
		const event = await eventService.getEventById( { eventId, fieldsToPopulate } );

		// extract the attendees into variables
		const staffAttendees = event.get( 'staffAttendees' );
		const siteVisitorAttendees = event.get( 'siteVisitorAttendees' );
		const socialWorkerAttendees = event.get( 'socialWorkerAttendees' );
		const familyAttendees = event.get( 'familyAttendees' );
		const childAttendees = event.get( 'childAttendees' );
		const outsideContactAttendees = event.get( 'outsideContactAttendees' );

		let unregisteredChildAttendeesBroughtBySocialWorkers = [];

		// unregistered child attendees should only be added to the children tab if they're registered by a social worker
		try {
			const activeSocialWorkerIds = await socialWorkerService.getActiveSocialWorkerIds();

			unregisteredChildAttendeesBroughtBySocialWorkers = event.unregisteredChildAttendees.filter( child => {
				return activeSocialWorkerIds.includes( child.get( 'registrantID' ) );
			});
			
		}
		catch( err ) {
			console.error( `error fetching active social workers for event export`, err );
		}
		
		// extract hidden unregistered attendees from the event
		const unregisteredAdultAttendees = event.unregisteredAdultAttendees;
		const unregisteredChildAttendees = event.unregisteredChildAttendees;

		// if no one is attending the event
		if( staffAttendees.length === 0
			&& siteVisitorAttendees.length === 0
			&& socialWorkerAttendees.length === 0
			&& familyAttendees.length === 0
			&& childAttendees.length === 0
			&& outsideContactAttendees.length === 0
			&& unregisteredChildAttendeesBroughtBySocialWorkers.length === 0 ) {
			
			// send a flash message to the user notifying them that an export couldn't be generated
			req.flash( 'info', { title: 'The export could not be generated',
				detail: 'There are no attendees registered for that event' });
			// redirect the user back to the page they came from
			return res.redirect( 303, req.headers.referer );
		}

		// create a new excel workbook
		const workbook = eventExcelService.createWorkbook();

		if( childAttendees.length > 0 || unregisteredChildAttendeesBroughtBySocialWorkers.length > 0 ) {
			await eventExcelService.createChildrenWorksheet({
				event,
				workbook,
				attendees: childAttendees,
				unregisteredAttendees: unregisteredChildAttendeesBroughtBySocialWorkers
			});
		}

		if( familyAttendees.length > 0 ) {
			await eventExcelService.createFamiliesWorksheet({
				event,
				workbook,
				attendees: familyAttendees,
				unregisteredChildAttendees,
				unregisteredAdultAttendees
			});
		}

		if( socialWorkerAttendees.length > 0 ) {
			await eventExcelService.createSocialWorkersWorksheet({
				event,
				workbook,
				attendees: socialWorkerAttendees,
				unregisteredChildAttendees,
				childAttendees
			});
		}

		if( staffAttendees.length > 0 ) {
			eventExcelService.createStaffWorksheet({
				event,
				workbook,
				attendees: staffAttendees
			});
		}

		if( siteVisitorAttendees.length > 0 ) {
			await eventExcelService.createSiteVisitorsWorksheet({
				event,
				workbook,
				attendees: siteVisitorAttendees
			});
		}

		if( outsideContactAttendees.length > 0 ) {
			await eventExcelService.createOutsideContactsWorksheet({
				event,
				workbook,
				attendees: outsideContactAttendees
			});
		}

		workbook.write( `${ event.get( 'key' ) }.xlsx`, res );
	}
	catch( err ) {
		console.error( `error exporting event with id ${ eventId } to excel`, err );

		// notify the user of the error
		req.flash( 'error', { title: 'There was an issue exporting this event' } );
	}
}

exports.getActiveSocialWorkers = ( req, res, next ) => {

	return new Promise( async ( resolve, reject ) => {

		keystone.list( 'Social Worker' ).model
			.find()
			.where( 'isActive' ).equals( true )
			.select( '_id name.full' )
			.lean()
			.exec()
			.then( socialWorkers => {

				if( !socialWorkers ) {
					console.error( `no active social workers could be found` );
				}

				// rename the fields before returning to protect the database
				const cleanSocialWorkers = socialWorkers.map( socialWorker => {
					return { uid: socialWorker._id, name: socialWorker.name.full };
				});
				
				res.send( cleanSocialWorkers );
				
			}, err => {
				console.error( 'error fetching active social workers' );

				res.send();
			});
	});
};

exports.updateEventAttendees = async ( req, res ) => {
	
	try {
		const event = await eventService.getEventById( { eventId: req.params.id } );

		// extract all available edits from the passed in data
		const { addedChildren, deletedChildren, editedChildren, addedAdults, deletedAdults, editedAdults } = req.body;

		// loop through the children added and create records
		if( addedChildren ) {
			
			for( let addedChild of addedChildren ) {
				const newChild = {
					name: {
						first: addedChild.firstName,
						last: addedChild.lastName
					},
					age: addedChild.age,
					registrantID: addedChild.registrantId,
					registrantType: req.user.userType
				}

				event.unregisteredChildAttendees = [ newChild, ...event.unregisteredChildAttendees ];
			}
		}
		// loop through the adults added and create records
		if( addedAdults ) {
			
			for( let addedAdult of addedAdults ) {
				const newAdult = {
					name: {
						first: addedAdult.firstName,
						last: addedAdult.lastName
					},
					registrantID: addedAdult.registrantId
				}

				event.unregisteredAdultAttendees = [ newAdult, ...event.unregisteredAdultAttendees ];
			}
		}

		// loop through the children deleted and delete the records
		if( deletedChildren ) {
			
			for( let deletedChildId of deletedChildren ) {
				let deletedChildIndex = event.unregisteredChildAttendees.findIndex( child => child.get( '_id' ).toString() === deletedChildId );
				if ( deletedChildIndex === -1 ) {
					console.log( `Attempting to delete a child that is not registered for an event: ${event.name} - ignoring delete and continuing execution...`);
				} else {
					event.unregisteredChildAttendees.splice( deletedChildIndex, 1 );
				}
			}
		}
		// loop through the adults deleted and delete the records
		if( deletedAdults ) {
			
			for( let deletedAdultId of deletedAdults ) {
				let deletedAdultIndex = event.unregisteredAdultAttendees.findIndex( adult => adult.get( '_id' ).toString() === deletedAdultId );
				if ( deletedAdultIndex === -1 ) {
					console.log( `Attempting to delete an adult that is not registered for an event: ${event.name} - ignoring delete and continuing execution...`);
				} else {
					event.unregisteredAdultAttendees.splice( deletedAdultIndex, 1 );
				}
			}
		}

		// loop through the children edited and edit the records
		if( editedChildren ) {
			
			for( let editedChild of editedChildren ) {
				let targetChild = event.unregisteredChildAttendees.find( child => child.get( '_id' ).toString() === editedChild.id );

				if ( targetChild ) {
					targetChild.set( 'name.first', editedChild.firstName );
					targetChild.set( 'name.last', editedChild.lastName );
					targetChild.set( 'age', editedChild.age );
					targetChild.set( 'registrantID', editedChild.registrantId );
					targetChild.set( 'registrantType', req.user.userType );
				} else {
					console.log( `Attempting to edit a child that is not registered for an event: ${event.name} - ignoring edits and continuing execution...`);
				}
			}
		}
		// loop through the adults edited and edit the records
		if( editedAdults ) {
			
			for( let editedAdult of editedAdults ) {
				let targetAdult = event.unregisteredAdultAttendees.find( adult => adult.get( '_id' ).toString() === editedAdult.id );

				if ( targetAdult ) {
					targetAdult.set( 'name.first', editedAdult.firstName );
					targetAdult.set( 'name.last', editedAdult.lastName );
				} else {
					console.log( `Attempting to edit an adult that is not registered for an event: ${event.name} - ignoring edits and continuing execution...`);
				}
			}
		}

		// attempt to save the updated event model
		await new Promise( ( resolve, reject ) => {

			event.save( ( err, savedModel ) => {

				if( err ) {
					// log the error for debugging purposes
					return reject( new Error( `error saving changes to the unregistered attendees for ${ event.name }` ) );
				}

				resolve();
			});
		});

		// notify the user that they were successful ( the code to notify MARE executes after this message is sent )
		req.flash( 'success', { title: 'Success',
			detail: 'your changes to unregistered attendees have been saved' });
	}
	catch( err ) {
		// notify the user of the error
		req.flash( 'error', { title: 'There was an issue editing the event',
			detail: 'If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );
	}

	res.send();
};
