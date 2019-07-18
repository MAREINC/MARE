(function () {
	'use strict';

	mare.views.ChildRegistration = Backbone.View.extend({
		el: '.form--child-registration',

		events: {
			'change #is-not-ma-city-checkbox'		: 'toggleCitySelect',
			'change [name="isPartOfSiblingGroup"]'	: 'toggleSiblingNamesTextbox'
		},

		initialize: function() {
			// DOM cache commonly used elements
			this.$MACityContainer		= this.$( '.city-container' );
			this.$NonMACityContainer	= this.$( '.non-ma-city-container' );
			this.$MACity				= this.$( '#city' );
			this.$NonMACity				= this.$( '#non-ma-city' );
			this.$siblingNamesContainer	= this.$( '.sibling-names-container' );
			this.$siblingNames			= this.$( '#sibling-names' );

			// initialize a view for fetching and restoring form data
			mare.views.restoreFormData = mare.views.restoreFormData || new mare.views.RestoreFormData( { formClass: 'form--child-registration', form: this } );
			// restore the form data when the restore form view registers a restore click
			mare.views.restoreFormData.on( 'restore', this.restoreFormData, this );
			// emit an event when the form data changes
			$( '.form--child-registration' ).on( 'formInputChanged', function( a ) {
				this.trigger( 'formInputChanged' );
			}.bind( this ));

			// initialize parsley validation on the form
			this.form = this.$el.parsley();
			// bind the city form elements individually to allow for binding/unbinding parsley validation
			this.MACityValidator = this.$MACity.parsley();
			this.nonMACityValidator = this.$NonMACity.parsley();
			// bind the sibling names textbox individually to allow for binding/unbinding parsley validation
			this.siblingNamesValidator = this.$siblingNames.parsley();
			// triggers parsley validation on each field when the form is submitted
			this.form.on( 'field:validated', this.validateForm );
			// fires an event when the form is successfully submitted
			this.form.on( 'form:validated', this.announceSubmit.bind( this ) );
		},

		validateForm: function validateForm() {
			var ok = $( '.parsley-error' ).length === 0;
			$( '.bs-callout-info' ).toggleClass( 'hidden', !ok );
			$( '.bs-callout-warning' ).toggleClass( 'hidden', ok );
		},

		toggleCitySelect: function toggleCitySelect( event ) {
				// toggle showing of the MA city dropdown menu
				this.$MACityContainer.toggleClass( 'hidden' );
				// toggle showing of the city free text field
				this.$NonMACityContainer.toggleClass( 'hidden' );

				// if the city free text field is hidden
				if( this.$NonMACityContainer.hasClass( 'hidden' ) ) {
					// add the validation binding to the city dropdown menu
					this.$MACity.attr( 'data-parsley-required', 'true' );
					// remove the validation binding from the city free text field
					this.$NonMACity.attr( 'data-parsley-required', 'false' );
					// add the required attribute to the city dropdown menu needed to show the red background during form validation
					this.$MACity.attr( 'required', true );
					// remove the required attribute to the city free text field needed to show the red background during form validation
					this.$NonMACity.attr( 'required', false );
					// reset validation on the city free text field field
					// if it was already validated, we need to clear out the check so the form can be submitted
					this.nonMACityValidator.reset();

				// otherwise, if the city dropdown menu is hidden
				} else {
					// add the validation binding to the city free text field
					this.$NonMACity.attr( 'data-parsley-required', 'true' );
					// remove the validation binding from the city dropdown menu
					this.$MACity.attr( 'data-parsley-required', 'false' );
					// add the required attribute to the city free text field needed to show the red background during form validation
					this.$MACity.attr( 'required', true );
					// remove the required attribute from the city dropdown menu needed to show the red background during form validation
					this.$NonMACity.attr( 'required', false );
					// reset validation on the city dropdown menu
					// if it was already validated, we need to clear out the check so the form can be submitted
					this.MACityValidator.reset();
				}
		},

		toggleSiblingNamesTextbox: function toggleSiblingNamesTextbox( event ) {
			var value = this.$('[name="isPartOfSiblingGroup"]:checked').val();

			// if the child is part of a sibling group
			if( value === 'Yes' ) {
				this.$siblingNamesContainer.removeClass( 'hidden' );
				
				// add the validation binding to the sibling names text field
				this.$siblingNames.attr( 'data-parsley-required', 'true' );
				// add the required attribute to the sibling names text field needed to show the red background during form validation
				this.$siblingNames.attr( 'required', true );
			
			// otherwise, if the child is not part of a sibling group
			} else {
				this.$siblingNamesContainer.addClass( 'hidden' );
				
				// remove the validation binding from the city dropdown menu
				this.$siblingNames.attr( 'data-parsley-required', 'false' );
				// remove the required attribute from the sibling names text field needed to show the red background during form validation
				this.$siblingNames.attr( 'required', false );
				// clear out the input box since it's hidden and not part of the form submission
				this.$siblingNames.val('');
				// and reset validation on the field.  If it was already validated, we need to clear out the check so the form can be submitted
				this.siblingNamesValidator.reset();
			}
		},

		restoreFormData: function restoreFormData() {
			mare.views.restoreFormData.restore( 'form--child-registration', this );
			this.trigger( 'formDataRestored' );
		},

		announceSubmit: function announceSubmit() {
			if( this.form.validationResult ) {
				this.trigger( 'formSubmitted' );
			}
		}
	});
}());