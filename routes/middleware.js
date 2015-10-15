/**
 * This file contains the common middleware used by your routes.
 * 
 * Extend or replace these functions as your application requires.
 * 
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require('underscore');

// Load in Keystone for model references
var keystone = require('keystone'),
	User = keystone.list('User');

/**
	Initialises the standard view locals
	
	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {
	'use strict';

	var locals = res.locals;

	locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' }
	];

	locals.user = req.user;

	// Create the main menu navigation.
	locals.mainNav = [
		{ title: 'Considering Adoption?', subMenu: [
			{ title: 'Types of Adoption', href: '/page/types-of-adoption' },
			{ title: 'Can I adopt a Child from Foster Care?', href: '/page/can-i-adopt-a-child-from-foster-care' },
			{ title: 'Steps in the Process', href: '/page/steps-in-the-process' },
			{ title: 'How Can MARE Help?', href: '/page/how-can-mare-help' }
		]},
		{ title: 'Meet the Children', subMenu: [
			{ title: 'Who are the Children?', href: '/page/who-are-the-children' },
			{ title: 'Waiting Child Profiles', href: '/page/waiting-child-profiles' },
			{ title: 'Other Ways to Meet Waiting Children', href: '/page/ways-to-meet-waiting-children' },
			{ title: 'For Homestudied Families', href: '/page/for-homestudied-families' }
		]},
		{ title: 'Family Support Services', subMenu: [
			{ title: 'How Does MARE Support Families', href: '/page/how-does-mare-support-families' },
			{ title: 'Friend of the Family Mentor Program', href: '/page/friend-of-the-family-mentor-program' },
			{ title: 'Other Family Support Services', href: '/page/other-family-support-services' }
		]},
		{ title: 'For Social Workers', subMenu: [
			{ title: 'Register a Child', href: '/page/register-a-child' },
			{ title: 'How MARE can Help You', href: '/page/how-mare-can-help-you'},
			{ title: 'Attend Events', href: '/page/attend-events' },
			{ title: 'Register a Family', href: '/page/register-a-family' },
			{ title: 'Use Online Matching', href: '/page/use-online-matching' }
		]},
		{ title: 'Ways to Help', subMenu: [
			{ title: 'Why give?', href: '/page/why-give' },
			{ title: 'How you can help', href: '/page/how-you-can-help' },
			{ title: 'How businesses and organizations can help', href: '/page/how-businesses-and-organizations-can-help' },
			{ title: 'Experienced families', href: '/page/experienced-families' }
		]},
		{ title: 'About Us', subMenu: [
			{ title: 'Mission & Vision', href: '/page/mission-and-vision'},
			{ title: 'History', href: '/page/history'},
			{ title: 'Meet the Staff', href: '/page/meet-the-staff'},
			{ title: 'Board of Directors', href: '/page/board-of-directors'},
			{ title: 'MARE in the News', href: '/page/mare-in-the-news'},
			{ title: 'Annual Report', href: '/page/annual-report'}
		]}];

	next();
};

/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {
	'use strict';
	
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
	
	next();
	
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
	'use strict';

	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
	
};

exports.registerUser = function(req, res, next) {
	var userData = req.body,
		registrationType = userData['registrationType'];

	/* TODO: this could be cleaned up significantly by pulling the user creation out of the if blocks and specifying shared fields once */
	if(registrationType === 'siteVisitor') {
		var newUser = new User.model({
			userType	: 'Site User',
			name: {
				first	: userData.firstName,
				last	: userData.lastName
			},
			email		: userData.email,
			password	: userData.password,
			mobilePhone	: userData.mobilePhone,
			otherPhone	: userData.otherPhone,
			address1	: userData.address1,
			address2	: userData.address2,
			city		: userData.city,
			state		: userData.state,
			zipCode		: userData.zipCode
		});

		console.log('making a new site user');

	} else if(registrationType === 'socialWorker') {
		var newUser = new User.model({
			userType	: 'Social Worker',
			name: {
				first	: userData.firstName,
				last	: userData.lastName
			},
			email		: userData.email,
			password	: userData.password,
			phone		: userData.phone,
			mobilePhone	: userData.mobilePhone,
			agency		: userData.agency,
			title		: userData.title,
			address1	: userData.address1,
			address2	: userData.address2,
			city		: userData.city,
			state		: userData.state,
			zipCode		: userData.zipCode
		});

		console.log('making a new social worker');

	} else if(registrationType === 'prospectiveParent') {
		// consider a different function for partial data saves
		console.log('making a new prospective parent');
		return;
	}

	/* TODO: Check to see if email address is already registered */

	/* TODO: Check for password encryption, encrypt if needed.  Think of using an environment key variable for the task */

	/* TODO: Perform validation checks */
	// if (userData.password !== userData.confirmPassword) {
	//     // post an error flash message
	// }

	/* TODO: Check for all required fields */

	newUser.save(function(err) {
		console.log('user has been saved');
		/* TODO: Post a success or error flash message */
	});

	/* TODO: Place next() in the appropriate place */
};

exports.login = function(req, res, next) {

	if (!req.body.email || !req.body.password) {
		req.flash('error', 'Please enter your username and password.');
		return next();
	}

	var onSuccess = function() {
		if (req.body.target && !/join|signin/.test(req.body.target)) {
			console.log('[signin] - Set target as [' + req.body.target + '].');
			res.redirect(req.body.target);
		} else {
			res.redirect('/preferences');
		}
	}
	
	var onFail = function() {
		req.flash('error', 'Your username or password were incorrect, please try again.');
		return next();
	}

	keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
}

exports.logout = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	keystone.session.signout(req, res, function() {
		res.redirect('/');
	});
	
};