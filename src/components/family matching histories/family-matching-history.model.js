const keystone			= require( 'keystone' ),
	  Types				= keystone.Field.Types;

// create model
var FamilyMatchingHistory = new keystone.List( 'Family Matching History', {
	autokey: { path: 'key', from: 'slug', unique: true },
    defaultSort: '-date'
});

// create fields
FamilyMatchingHistory.add( 'General Information', {
	
	registrationNumber: { type: Types.Text, label: 'family registration number', required: true, initial: true },
	family: { type: Types.Relationship, label: 'family', ref: 'Family', initial: true },
	child: { type: Types.Relationship, label: 'child', ref: 'Child', initial: true },
	createdBy: { type: Types.Relationship, label: 'created by', ref: 'Admin', required: true, noedit: true, initial: true },
	homestudySent: { type: Types.Boolean, label: 'homestudy sent', default: false, initial: true },
	notes: { type: Types.Textarea, label: 'notes', initial: true },
	date: { type: Types.Date, label: 'date', inputFormat: 'MM/DD/YYYY', format: 'MM/DD/YYYY', default: Date.now, utc: true, required: true, noedit: true }
	
});

// define default columns in the admin interface and register the model
FamilyMatchingHistory.defaultColumns = 'family,child,homestudySent|10%,notes|40%,date|15%';
FamilyMatchingHistory.register();
