var keystone = require( 'keystone' ),
	Types = keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var AccountVerificationCode = new keystone.List( 'Account Verification Code', {
	hidden: false, // TODO: do we want to hide this model?
	map: { name: 'code' },
	defaultSort: '-dateSent'
});

// Create fields
AccountVerificationCode.add({
	code: { type: Types.Text, label: 'code', required: true, noedit: true, initial: true },
    user: { type: Types.Relationship, label: 'user', ref: 'User', required: true, noedit: true, initial: true },
	dateSent: { type: Types.Date, label: 'date sent', inputFormat: 'MM/DD/YYYY', format: 'MM/DD/YYYY', default: Date.now, utc: true, required: true, noedit: true },
	isExchanged: { type: Boolean, label: 'has token been exchanged?', noedit: true }
});

// Define default columns in the admin interface and register the model
AccountVerificationCode.defaultColumns = 'code, user, dateSent, isExchanged';
AccountVerificationCode.register();