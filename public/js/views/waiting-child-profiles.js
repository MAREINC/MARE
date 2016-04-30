(function () {
	'use strict';

	mare.views.WaitingChildProfiles = Backbone.View.extend({
		// This view controls everything inside the body element, with the exception of areas controlled by sub-views
		el: 'body',

		events: {
			'click .search'							: 'showGallery',
			'click .modify-search__button--modify'	: 'handleSearchClick',
			'click .modify-search__button--clear'	: 'handleResetClick'
		},

		initialize: function initialize() {
			// DOM cache any commonly used elements to improve performance
			this.$gallery		= this.$( '.gallery' );
			this.$searchForm	= this.$( '.gallery-search-form' );

			// Create a promise to resolve once we have data for all children the user is allowed to see
			mare.promises.childrenDataLoaded = $.Deferred();
			// Fetch children the current user is allowed to view
			this.getChildren();

			// Create a Backbone collection for filtered children data based on the users search criteria
			mare.collections.FilteredChildren = mare.collections.FilteredChildren || new mare.collections.Children();

			// Initialize views for the gallery and serach form
			mare.views.gallery = mare.views.gallery || new mare.views.Gallery();
			mare.views.gallerySearchForm = mare.views.gallerySearchForm || new mare.views.GallerySearchForm();

		},

		/* Hide the gallery search form and show the gallery */
		showGallery: function showGallery() {
			// Store a reference to this for insde callbacks where context is lost
			var view = this;
			// Fade the search form out and fade the gallery in
			this.$searchForm.fadeOut(function() {
				view.$gallery.fadeIn();
				// Render the gallery
				mare.views.gallery.render();
			});
		},

		/* Hide the gallery and show the gallery search form */
		showSearchForm: function showSearchForm() {
			// Store a reference to this for insde callbacks where context is lost
			var view = this;
			// Fade the gallery out and fade the search form in
			this.$gallery.fadeOut(function() {
				view.$searchForm.fadeIn();
			});
		},

		/* get all children information the user is allowed to view.  This only includes data to show in the gallery cards, no detailed information
		   which is fetched as needed to save bandwidth */
		getChildren: function getChildren() {
			$.ajax({
				dataType: 'json',
				url: '/services/get-children-data',
				type: 'POST'
			}).done(function(data) {
				// TODO: maybe pull the collection creation into the initialize funciton for better readability
				// Store the child data in a Backbone collection available from the mare namespace
				mare.collections.children = mare.collections.children || new mare.collections.Children(data);
				// Resolve the promise tracking child data loading
				mare.promises.childrenDataLoaded.resolve();

			}).fail(function(err) {
				// TODO: Show an error message instead of the gallery if we failed to fetch the child data
				console.log(err);
			});
		},
		/* Route to the search form to preserve browser history state */
		handleSearchClick: function handleSearchClick() {
			mare.routers.waitingChildProfiles.navigate( 'search', { trigger: true } );
		},

		resetGallery: function resetGallery() {

		}

	});
})();