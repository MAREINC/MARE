var keystone				= require( 'keystone' ),
	_						= require( 'underscore' ),
	Region 					= keystone.list( 'Region' ),
	Position				= keystone.list( 'Social Worker Position' ),
	Race					= keystone.list( 'Race' ),
	State					= keystone.list( 'State' ),
	Gender					= keystone.list( 'Gender' ),
	LegalStatus				= keystone.list( 'Legal Status' ),
	Language				= keystone.list( 'Language' ),
	FamilyConstellation		= keystone.list( 'Family Constellation' ),
	Disability				= keystone.list( 'Disability' ),
	OtherConsideration		= keystone.list( 'Other Consideration' ),
	ChildStatus				= keystone.list( 'Child Status' ),
	ChildType				= keystone.list( 'Child Type' ),
	EventType				= keystone.list( 'Event Type' ),
	WayToHearAboutMARE		= keystone.list( 'Way To Hear About MARE' );

exports.getAllRegions = ( req, res, done ) => {

	req.locals = res.locals || {}; /* TODO: This line (which appears in lots of services) might not be needed, check it during refactor */
	
	let locals = res.locals;

	Region.model.find()
				.exec()
				.then( regions => {

					locals.regions = regions;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllSocialWorkerPositions = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	Position.model.find()
				.exec()
				.then( positions => {

					locals.positions = positions;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllRaces = ( req, res, done, options ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	Race.model.find()
				.exec()
				.then( races => {
					// If there is a value of 'other' in the list, which should appear at the bottom of any
					// dropdown lists on the site, add an appropriate attribute
					if( options && options.other ) {

						for( let race of races ) {
							if( race.race === 'other' ) {
								race.other = true;
							}
						};

					}

					locals.races = races;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllStates = ( req, res, done, options ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	State.model.find()
				.exec()
				.then( states => {
					// If there is a default value which should appear selected when a dropdown menu is first rendered add an appropriate attribute
					if( options && options.default ) {

						for( let state of states ) {
							if(state.state === options.default) {
								state.defaultSelection = true;
							}
						};

					}

					locals.states = states;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllGenders = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	Gender.model.find()
				.exec()
				.then( genders => {

					locals.genders = genders;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllLegalStatuses = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	LegalStatus.model.find()
				.exec()
				.then( legalStatuses => {

					locals.legalStatuses = legalStatuses;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllLanguages = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	Language.model.find()
				.exec()
				.then( languages => {

					locals.languages = languages;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllFamilyConstellations = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	FamilyConstellation.model.find()
				.exec()
				.then( familyConstellations => {

					locals.familyConstellations = familyConstellations;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getAllDisabilities = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	Disability.model.find()
				.exec()
				.then( disabilities => {

					locals.disabilities = disabilities;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getOtherConsiderations = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	OtherConsideration.model.find()
				.exec()
				.then( otherConsiderations => {

					locals.otherConsiderations = otherConsiderations;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getChildTypesForWebsite = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	ChildType.model.find()
				.where('availableOnWebsite', true)
				.exec()
				.then( childTypes => {

					locals.childTypes = childTypes;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};

exports.getEventTypesForWebsite = ( req, res, done ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	EventType.model.find()
				.where( 'availableOnWebsite', true )
				.exec()
				.then( eventTypes => {

					locals.eventTypes = eventTypes;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
}

exports.getAllWaysToHearAboutMARE = ( req, res, done, options ) => {

	req.locals = res.locals || {};
	
	let locals = res.locals;

	WayToHearAboutMARE.model.find()
				.exec()
				.then( waysToHearAboutMARE => {
					// If there is a value of 'other' in the list, which should appear at the bottom of any
					// dropdown lists on the site, add an appropriate attribute
					if( options && options.other ) {

						for( let wayToHearAboutMARE of waysToHearAboutMARE ) {
							if( wayToHearAboutMARE.wayToHearAboutMARE === 'other' ) {
								wayToHearAboutMARE.other = true;
							}
						};

					}

					locals.waysToHearAboutMARE = waysToHearAboutMARE;
					// execute done function if async is used to continue the flow of execution
					done()

				}, err => {

					console.log( err );
					done();

				});
};
