(function () {
	'use strict';

	mare.views.WaitingChildProfiles = Backbone.View.extend({
		// this view controls everything inside the body element, with the exception of areas controlled by sub-views
		el: 'body',

		events: {
			'click .filters__search-button--modify'				: 'handleSearchClick',
			'click .filters__search-button--clear'				: 'resetGallery',
			'click .filters__search-button--show-saved-children': 'showSavedChildrenAndSiblingGroups'
		},

		initialize: function initialize() {
			// DOM cache any commonly used elements to improve performance
			this.$gallery					= this.$( '.gallery' );
			this.$searchForm				= this.$( '.gallery-search-form' );
			this.$childProfilesHeaderCard 	= this.$( '.gallery section.card' );

			// create a collection to hold all available children data as a base for sorting/filtering
			mare.collections.allChildren = mare.collections.allChildren || new mare.collections.Children();
			// create a collection to hold only the children currently displayed in the gallery
			mare.collections.galleryChildren = mare.collections.galleryChildren || new mare.collections.Children();
			// create a collection to hold all available sibling group data as a base for sorting/filtering
			mare.collections.allSiblingGroups = mare.collections.allSiblingGroups || new mare.collections.SiblingGroups();
			// create a collection to hold only the sibling groups currently displayed in the gallery
			mare.collections.gallerySiblingGroups = mare.collections.gallerySiblingGroups || new mare.collections.SiblingGroups();

			// create a promise to resolve once we have data for all children the user is allowed to see
			mare.promises.childrenDataLoaded = $.Deferred();
			// fetch children the current user is allowed to view
			this.getChildren();

			// initialize views for the gallery and serach form
			mare.views.gallery = mare.views.gallery || new mare.views.Gallery();
			mare.views.gallerySearchForm = mare.views.gallerySearchForm || new mare.views.GallerySearchForm();

			// when the search form data has been processed and non-matching children and sibling groups have been filtered out
			mare.views.gallerySearchForm.on( 'searchResultsRetrieved', function() {
				// clear out existing registration number search
				mare.views.gallery.clearRegistrationSearch();
				// navigate to the gallery page
				this.navigateToGallery();
			}.bind( this ) );

			// when bookmarked children and sibling groups have been processed and the gallery is ready to render
			this.on( 'bookmarkedChildrenAndSiblingGroupsRetrieved', function() {
				// clear out existing registration number search
				mare.views.gallery.clearRegistrationSearch();
				// render the gallery
				mare.views.gallery.render();
			});
		},

		/* hide the gallery search form and show the gallery */
		showGallery: function showGallery() {
			// fade the search form out and fade the gallery in
			this.$searchForm.fadeOut( function() {
				this.$gallery.fadeIn();
				// render the gallery
				mare.views.gallery.render();
			}.bind( this ) );
		},
		
		/* hide the gallery search form and show both the gallery and given child details */
		showChildDetails: function showChildDetails( registrationNumber ) {
			// fade the search form out and fade the gallery in
			this.$searchForm.fadeOut( function() {
				this.$gallery.fadeIn();
				// render the gallery and the child details
				mare.views.gallery.renderChild( registrationNumber );
			}.bind( this ) );
		},
		
		/* hide the gallery search form and show both the gallery and given sibling group details */
		showSiblingGroupDetails: function showSiblingGroupDetails( registrationNumbers ) {
			// fade the search form out and fade the gallery in
			this.$searchForm.fadeOut( function() {
				this.$gallery.fadeIn();
				// render the gallery and the sibling group details
				mare.views.gallery.renderSiblingGroup( registrationNumbers );
			}.bind( this ) );
		},

		/* hide the gallery and show the gallery search form */
		showSearchForm: function showSearchForm() {

			// set the defaults values of the search form
			mare.views.gallerySearchForm.setDefaultValues();

			// fade the gallery out and fade the search form in
			this.$gallery.fadeOut( function() {
				// render the search form
				this.$searchForm.fadeIn();
			}.bind( this ) );
		},

		/* get all children information the user is allowed to view.  This only includes data to show in the gallery cards, no detailed information
		   which is fetched as needed to save bandwidth */
		getChildren: function getChildren() {
			$.ajax({
				dataType: 'json',
				url: '/services/get-children-data',
				type: 'POST'
			}).done( function( children ) {
				// store all children in a collection for easy access
				mare.collections.allChildren.add( children.soloChildren );
				// store all children in the collecction for the current gallery display as we always start showing the full list
				mare.collections.galleryChildren.add( children.soloChildren );
				// store all sibling groups for easy access
				mare.collections.allSiblingGroups.add( children.siblingGroups );
				// Store all sibling groups for the current gallery display
				mare.collections.gallerySiblingGroups.add( children.siblingGroups );
				// resolve the promise tracking child data loading
				mare.promises.childrenDataLoaded.resolve();

			}).fail( function( err ) {
				// TODO: show an error message instead of the gallery if we failed to fetch the child data
				console.log( err );
			});
		},
		/* route to the search form to preserve browser history state */
		handleSearchClick: function handleSearchClick() {
			mare.routers.waitingChildProfiles.navigate( 'search', { trigger: true } );
		},

		navigateToGallery: function navigateToGallery() {
			mare.routers.waitingChildProfiles.navigate( 'gallery', { trigger: true } );
		},

		resetGallery: function resetGallery() {
			// cache the collections for faster access
			var galleryChildren = mare.collections.galleryChildren,
				gallerySiblingGroups = mare.collections.gallerySiblingGroups;
			// clear out the contents of the gallery collections
			galleryChildren.reset();
			gallerySiblingGroups.reset();
			// add all children back to the gallery collection for display
			mare.collections.allChildren.each( function( child ) {
				galleryChildren.add( child );
			});
			// add all sibling groups back to the gallery collection for display
			mare.collections.allSiblingGroups.each( function( siblingGroup ) {
				gallerySiblingGroups.add( siblingGroup );
			});
			// reset all search form fields
			mare.views.gallerySearchForm.reset();
			// clear out existing registration number search
			mare.views.gallery.clearRegistrationSearch();
			// render the gallery
			mare.views.gallery.render();
		},

		showSavedChildrenAndSiblingGroups: function showSavedChildrenAndSiblingGroups() {

			this.showSavedChildren();
			this.showSavedSiblingGroups();
			// emit an event to allow the gallery to update it's display now that we have all matching models
			this.trigger( 'bookmarkedChildrenAndSiblingGroupsRetrieved' );
		},

		showSavedChildren: function showSavedChildren() {
			// clear out the contents of the gallery collection
			mare.collections.galleryChildren.reset();
			// add all bookmarked children back to the gallery collection for display
			mare.collections.allChildren.each( function( child ) {
				if( child.get( 'isBookmarked' ) ) {
					mare.collections.galleryChildren.add( child );
				}
			});
		},

		showSavedSiblingGroups: function showSavedSiblingGroups() {
			// clear out the contents of the gallery collection
			mare.collections.gallerySiblingGroups.reset();
			// add all bookmarked sibling groups back to the gallery collection for display
			mare.collections.allSiblingGroups.each( function( siblingGroup ) {
				if( siblingGroup.get( 'isBookmarked' ) ) {
					mare.collections.gallerySiblingGroups.add( siblingGroup );
				}
			});
		}
	});
}());
