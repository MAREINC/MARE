(function () {
	'use strict';

	mare.views.EventAddUnregisteredChild = Backbone.View.extend({
		// this view controls the content of the modal window, create an element to insert into the modal
		tagName: 'section',
		// give the container for our view a class we can hook into
  		className: 'child-details',

		/* initialize the add unregistered child modal */
		initialize: function initialize() {
			// create a hook to access the gallery template
			var html = $( '#event-add-unregistered-child-template' ).html();
			// compile the template to be used during rendering/repainting the gallery
			this.template = Handlebars.compile( html );	
			// initialize the modal once we've fetched the social worker data needed to display the social worker dropdown
			mare.promises.socialWorkerDataLoaded.done( function() {
				// extract the relevant data from the stored social worker models
				this.socialWorkers = mare.collections.socialWorkers.map( function( socialWorker ) {
					return {
						name: socialWorker.get( 'name' ),
						id: socialWorker.get( 'uid' )
					}
				});
			}.bind( this ) );
		},

		// events need to be bound every time the modal is opened, so they can't be put in an event block
		bindEvents: function bindEvents() {
			$( '.modal__close' ).click( this.closeModal.bind( this ) );
			// bind events for button clicks
			this.$( '.events__edit-child' ).click( this.saveEditedChild.bind( this ) );
			this.$( '.events__add-child' ).click( this.saveNewChild.bind( this ) );
			this.$( '.events__cancel-add-child' ).click( this.closeModal.bind( this ) );
		},

		// events need to be unbound every time the modal is closed
		unbindEvents: function unbindEvents() {
			$( '.modal__close' ).unbind( 'click' );
		},

		bindDropdown: function bundDropdown() {
			this.$( '.events__registrant-select' ).select2();
		},

		/* render the view onto the page */
		render: function render( options ) {
			mare.promises.socialWorkerDataLoaded.done( function() {

				var selectedSocialWorker = this.socialWorkers.find( function( socialWorker ) {
					return socialWorker.id === options.child.registrantId;
				});

				if( selectedSocialWorker ) {
					selectedSocialWorker.selected = true;
				}

				// pass the child model to through the template we stored during initialization
				var html = this.template( { child: options.child, action: options.action, socialWorkers: this.socialWorkers } );
				this.$el.html( html );
				// render the contents area and tabs
				$( '.modal-container__contents' ).html( this.$el );
				// remove the loading indicator and display the details content
				$( '.modal-container__loading' ).hide();
				$( '.modal-container__contents' ).show();

			}.bind( this ) );
		},

		/* open the edit child modal with the child's details */
		showEditModal: function showEditModal( child ) {
			// render the child's details into the modal
			this.render( { child: child, action: 'edit' } );
			// display the modal
			this.openModal();
			// bind click events for the newly rendered elements
			this.bindEvents();
			// bind the jquery dropdown plugin to the social worker select
			this.bindDropdown();
		},

		/* open the add new child modal */
		showAddModal: function showAddModal( id ) {
			// render the modal, passing in the id for the new child
			this.render( { action: 'add', child: { id: id } } );
			// display the modal
			this.openModal();
			// bind click events for the newly rendered elements
			this.bindEvents();
			// bind the jquery dropdown plugin to the social worker select
			this.bindDropdown();
		},

		saveEditedChild: function saveEditedChild() {
			// send an event notifying the parent view that a child has been edited
			this.trigger( 'childEdited', {
				id: this.$( '#id' ).val(),
				registrantId: this.$( '#registrant' ).find( ':selected' ).val(),
				firstName: this.$( '#first-name' ).val(),
				lastName: this.$( '#last-name' ).val(),
				age: this.$( '#age' ).val()
			});

			this.closeModal();
		},

		saveNewChild: function saveNewChild() {
			// send an event notifying the parent view that a child has been added
			this.trigger( 'childAdded', {
				id: this.$( '#id' ).val(),
				registrantId: this.$( '#registrant' ).find( ':selected' ).val(),
				firstName: this.$( '#first-name' ).val(),
				lastName: this.$( '#last-name' ).val(),
				age: this.$( '#age' ).val()
			});

			this.closeModal();
		},

		/* open the modal container */
		openModal: function openModal() {
			// TODO: this adds a class to the modal to adjust it's size.  This should be handled by passing in a size option to a modal view on initialization
			$( '.modal__container' ).addClass( 'modal__container--small' );

			$( '.modal__background' ).fadeIn();
			$( '.modal__container' ).fadeIn();

			mare.utils.disablePageScrolling();
		},

		/* close the modal container */
		closeModal: function closeModal() {

			$( '.modal__background' ).fadeOut();
			$( '.modal__container' ).fadeOut();

			mare.utils.enablePageScrolling();

			this.clearModalContents();

			this.unbindEvents();

			// deselect the currentlly selected social worker
			var selectedSocialWorker = this.socialWorkers.find( function( socialWorker ) {
				return socialWorker.selected;
			});

			if( selectedSocialWorker ) {
				delete selectedSocialWorker.selected;
			}
		},

		/* clear out the current contents of the modal */
		clearModalContents: function clearModalContents() {
			$( '.modal-container__contents' ).html( '' );
		}
	});
}());
