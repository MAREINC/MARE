(function () {
	'use strict';

	mare.views.Form_AgencyEventSubmission = Backbone.View.extend({
		el: '.form--agency-event-submission',

		initialize: function() {
			// initialize parsley validation on the form
			this.form = this.$el.parsley();
			
			this.form.on( 'field:validated', this.validateForm );
		},

		validateForm: function validateForm() {
			var ok = $( '.parsley-error' ).length === 0;
			$( '.bs-callout-info' ).toggleClass( 'hidden', !ok );
			$( '.bs-callout-warning' ).toggleClass( 'hidden', ok );
		}

	});
}());