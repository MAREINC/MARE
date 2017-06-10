$(function() {
	'use strict';
	// Extract useful url information and store it on the mare namespace
	mare.utils.storeUrlInfo();
	// Ensure touch events are handled appropriately
	mare.utils.bindTouch();
	// Every route needs to initialize views for scaffolded areas like the header and the navigation
	mare.views.globalHeader = mare.views.globalHeader || new mare.views.GlobalHeader();
	mare.views.mobileMenu = mare.views.mobileMenu || new mare.views.MobileMenu();
	// Handle basic routing, initializing based on the result
	// No default exists due to main routing being handled by the server
	// TODO: ensure mangled urls route to the home page
	switch( mare.url.siteArea ) {
		case ''										: mare.routers.home = new mare.routers.Home();												break;
		case 'donate'                   			: mare.routers.donations = new mare.routers.Donations();									break;
		case 'events'                   			: mare.routers.events = new mare.routers.Events();											break;
		case 'forms' :
			switch( mare.url.page ) {
				case 'agency-event-submission-form'	: mare.routers.form_agencyEventSubmission = new mare.routers.Form_AgencyEventSubmission();	break;
				case 'child-registration-form'		: mare.routers.childRegistration = new mare.routers.ChildRegistration();			break;
				case 'have-a-question-form'			: mare.routers.form_haveAQuestion = new mare.routers.Form_HaveAQuestion();					break;
				case 'information-request-form'		: mare.routers.form_informationRequest = new mare.routers.Form_InformationRequest();
			}
			break;
		case 'page'                     			: mare.routers.pages = new mare.routers.Pages();											break;
		case 'account'              				: mare.routers.account = new mare.routers.Account();										break;
		case 'register'                 			: mare.routers.registration = new mare.routers.Registration();								break;
		case 'success-stories'          			: mare.routers.successStories = new mare.routers.SuccessStories();							break;
		case 'waiting-child-profiles'				: mare.routers.waitingChildProfiles = new mare.routers.WaitingChildProfiles();
	}
	// start the backbone history state for browser navigation through backbone routes
	// NOTE: This needs to be below the subrouter initialization to allow for subrouters to reroute properly
	Backbone.history.start();
	// private function used to handle malformed routes to send a user back to the home page
	// TODO: See if this is used anywhere
	function goHome() {
		window.location.href = "/";
	}
});
