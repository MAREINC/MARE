(function () {
	'use strict';

	mare.views.Form_InformationRequest = Backbone.View.extend({
		el: '.form--information-request',

		events: {
			'change #is-not-ma-city-checkbox' 	: 'toggleCitySelect',
			'change .interest'					: 'toggleChildRegistrationNumbersInput',
			'submit'							: 'onSubmit'
		},

		initialize: function() {
			// DOM cache any commonly used elements to improve performance
			this.$MACityContainer					= this.$( '.city-container' );
			this.$NonMACityContainer				= this.$( '.non-ma-city-container' );
			this.$MACity							= this.$( '#city' );
			this.$NonMACity							= this.$( '#non-ma-city' );
			this.$interest							= this.$( '.interest' );
			this.$childRegistrationNumbersContainer	= this.$( '.child-registration-numbers-container' );
			this.$submitButton						= this.$( 'button[type="submit"]' );

			// initialize parsley validation on the form
			this.form = $( this.el ).parsley();
			
			if ( this.form ) {
				this.form.on( 'field:validated', this.validateForm );
			}
		},

		onSubmit: function( event ) {
			if ( this.form.isValid() ) {
				this.$submitButton.addClass( 'button--disabled' );
				this.$submitButton.attr( 'disabled', 'disabled' );
			}
		},

		toggleChildRegistrationNumbersInput: function toggleChildRegistrationNumbersInput() {
			// get the selected interest radio button value
			var selectedInterest = this.$( '.interest:checked' ).val();
			// if the selected interest is child info, show the registration number input, otherwise hide it
			if( selectedInterest === 'child info' ) {
				this.$childRegistrationNumbersContainer.removeClass( 'hidden' );
			} else {
				this.$childRegistrationNumbersContainer.addClass( 'hidden' );
			}
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

		validateForm: function validateForm() {
			var ok = $( '.parsley-error' ).length === 0;
			$( '.bs-callout-info' ).toggleClass( 'hidden', !ok );
			$( '.bs-callout-warning' ).toggleClass( 'hidden', ok );
		}
	});
}());