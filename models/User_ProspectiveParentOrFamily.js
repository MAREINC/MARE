var keystone = require('keystone'),
	Types = keystone.Field.Types;

// Create model
var ProspectiveParentOrFamily = new keystone.List('Prospective Parent or Family', {
	track: true,
	autokey: { path: 'key', from: 'registrationNumber', unique: true },
	map: { name: 'contact1.name.full' },
	defaultSort: 'contact1.name.full'
});

// Create fields
ProspectiveParentOrFamily.add('Permissions', {

	permissions: {
		isVerified: { type: Boolean, label: 'has a verified email address', default: false, noedit: true },
		isActive: { type: Boolean, label: 'is active', default: true, noedit: true }
	}

}, 'General Information', {

	registrationNumber: { type: Number, label: 'registration number', format: false, required: true, initial: true },
	initialContact: { type: Types.Text, label: 'initial contact', note: 'mm/dd/yyyy', required: true, initial: true },
	flagCalls: { type: Types.Boolean, label: 'flag calls', initial: true },
	familyConstellation: { type: Types.Relationship, label: 'family constellation', ref: 'Family Constellation', required: true, initial: true },
	singleParentOptions: { type: Types.Relationship, label: 'single parent options', ref: 'Single Parent Option', initial: true },
	language: { type: Types.Relationship, label: 'language', ref: 'Language', required: true, initial: true },
	otherLanguages: { type: Types.Relationship, label: 'other languages', ref: 'Language', many: true, initial: true },

	password: { type: Types.Password, label: 'password', required: true, initial: true },
	avatar: { type: Types.CloudinaryImage, label: 'avatar', folder: 'users/prospective parents\\/families', autoCleanup: true }

}, 'Contact 1', {

	contact1: {

		name: {
			first: { type: Types.Text, label: 'first Name', required: true, initial: true },
			last: { type: Types.Text, label: 'last Name', required: true, initial: true },
			full: { type: Types.Text, label: 'name', hidden: true, noedit: true, initial: false }
		},

		phone: {
			work: { type: Types.Text, label: 'work phone number', initial: true },
			home: { type: Types.Text, label: 'home phone number', initial: true },
			cell: { type: Types.Text, label: 'cell phone number', initial: true },
			preferred: { type: Types.Select, label: 'preferred phone', options: 'work, home, cell', initial: true }
		},

		email: { type: Types.Email, label: 'email address', initial: true },
		preferredMethod: { type: Types.Select, label: 'preferred communication method', options: 'e-mail, home phone, cell phone, work phone, unknown', required: true, initial: true },
		gender: { type: Types.Relationship, label: 'gender', ref: 'Gender', required: true, initial: true },
		race: { type: Types.Relationship, label: 'race', ref: 'Race', many: true, required: true, initial: true },
		occupation: { type: Types.Text, label: 'occupation', initial: true },
		birthDate: { type: Types.Text, label: 'date of birth', note: 'mm/dd/yyyy', required: true, initial: true }
	},

}, 'Contact 2', {

	contact2: {
		name: {
			first: { type: Types.Text, label: 'first name', initial: true },
			last: { type: Types.Text, label: 'last name', initial: true },
			full: { type: Types.Text, label: 'name', hidden: true, noedit: true }
		},

		phone: {
			work: { type: Types.Text, label: 'work phone number', initial: true },
			home: { type: Types.Text, label: 'home phone number', initial: true },
			cell: { type: Types.Text, label: 'cell phone number', initial: true },
			preferred: { type: Types.Select, label: 'preferred phone', options: 'work, home, cell', initial: true }
		},

		email: { type: Types.Email, label: 'email address', initial: true },
		preferredMethod: { type: Types.Select, label: 'preferred communication method', options: 'e-mail, home phone, cell phone, work phone, unknown', initial: true },
		gender: { type: Types.Relationship, label: 'gender', ref: 'Gender', initial: true },
		race: { type: Types.Relationship, label: 'race', ref: 'Race', many: true, initial: true },
		occupation: { type: Types.Text, label: 'occupation', initial: true },
		birthDate: { type: Types.Text, label: 'date of birth', note: 'mm/dd/yyyy', initial: true }
	}

}, 'Home Contact Information', {

	address: {
		street1: { type: Types.Text, label: 'street 1', required: true, initial: true },
		street2: { type: Types.Text, label: 'street 2', initial: true },
		city: { type: Types.Text, label: 'city', required: true, initial: true },
		state: { type: Types.Relationship, label: 'state', ref: 'State', required: true, initial: true },
		zipCode: { type: Types.Text, label: 'zip code', required: true, initial: true },
		country: { type: Types.Text, label: 'country', initial: true },
		region: { type: Types.Relationship, label: 'region', ref: 'Region', initial: true }
	}

}, 'Current Children in Family', {

	numberOfChildren: { type: Types.Select, label: 'number of children', options: '1, 2, 3, 4, 5, 6+', required: true, initial: true },

	currentChild1: {
		name: { type: Types.Text, label: 'child 1 name:', dependsOn: { numberOfChildren: ['1', '2', '3', '4', '5', '6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 1 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['1', '2', '3', '4', '5', '6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 1 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['1', '2', '3', '4', '5', '6+'] }, initial: true }
	},

	currentChild2: {
		name: { type: Types.Text, label: 'child 2 name:', dependsOn: { numberOfChildren: ['2', '3', '4', '5', '6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 2 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['2', '3', '4', '5', '6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 2 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['2', '3', '4', '5', '6+'] }, initial: true }
	},

	currentChild3: {
		name: { type: Types.Text, label: 'child 3 name:', dependsOn: { numberOfChildren: ['3', '4', '5', '6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 3 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['3', '4', '5', '6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 3 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['3', '4', '5', '6+'] }, initial: true }
	},

	currentChild4: {
		name: { type: Types.Text, label: 'child 4 name:', dependsOn: { numberOfChildren: ['4', '5', '6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 4 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['4', '5', '6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 4 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['4', '5', '6+'] }, initial: true }
	},

	currentChild5: {
		name: { type: Types.Text, label: 'child 5 name:', dependsOn: { numberOfChildren: ['5', '6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 5 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['5', '6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 5 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['5', '6+'] }, initial: true }
	},

	currentChild6: {
		name: { type: Types.Text, label: 'child 6 name:', dependsOn: { numberOfChildren: ['6+'] }, initial: true },
		birthDate: { type: Types.Text, label: 'child 6 date of birth', note: 'mm/dd/yyyy', dependsOn: { numberOfChildren: ['6+'] }, initial: true },
		type: { type: Types.Relationship, label: 'child 6 type', ref: 'Child Type', dependsOn: { numberOfChildren: ['6+'] }, initial: true }
	}

}, 'Other Considerations', {

	otherAdultsInHome: {
		number: { type: Types.Number, label: 'number of other adults living in the home', initial: true },
		relationships: { type: Types.Text, label: 'relationship of other adults living in the home', initial: true }
	},

	havePetsInHome: { type: Types.Boolean, label: 'have pets in the home', initial: true }

}, 'Stages', {

	stages: {
		gatheringInformation: {
			started: { type: Types.Boolean, label: 'gathering information', initial: true },
			date: { type: Types.Text, label: 'date gathering information started', note: 'mm/dd/yyyy', dependsOn: { 'stages.gatheringInformation.started': true }, initial: true }
		},
		lookingForAgency: {
			started: { type: Types.Boolean, label: 'looking for agency', initial: true },
			date: { type: Types.Text, label: 'date looking for agency started', note: 'mm/dd/yyyy', dependsOn: { 'stages.lookingForAgency.started': true }, initial: true }
		},
		workingWithAgency: {
			started: { type: Types.Boolean, label: 'working with agency', initial: true },
			date: { type: Types.Text, label: 'date working with agency started', note: 'mm/dd/yyyy', dependsOn: { 'stages.workingWithAgency.started': true }, initial: true }
		},
		MAPPTrainingCompleted: {
			completed: { type: Types.Boolean, label: 'MAPP training completed', initial: true },
			date: { type: Types.Text, label: 'date MAPP training completed', note: 'mm/dd/yyyy', dependsOn: { 'stages.MAPPTrainingCompleted.completed': true }, initial: true }
		}
	},

	homestudy: {
		completed: { type: Types.Boolean, label: 'homestudy completed', initial: true },
		initialDate: { type: Types.Text, label: 'initial date homestudy completed', note: 'mm/dd/yyyy', dependsOn: { 'homestudy.completed': true }, initial: true },
		mostRecentDate: { type: Types.Text, label: 'most recent update completed', note: 'mm/dd/yyyy', dependsOn: { 'homestudy.completed': true }, initial: true }
	},

	onlineMatching: {
		started: { type: Types.Boolean, label: 'online matching', initial: true },
		date: { type: Types.Text, label: 'date online matching started', note: 'mm/dd/yyyy', dependsOn: { 'onlineMatching.started': true }, initial: true }
	},

	registeredWithMARE: {
		registered: { type: Types.Boolean, label: 'registered with MARE', initial: true },
		date: { type: Types.Text, label: 'date registered with MARE', note: 'mm/dd/yyyy', dependsOn: { 'registeredWithMARE.registered': true }, initial: true },
		status: { type: Types.Relationship, label: 'status', ref: 'Child Status', dependsOn: { 'registeredWithMARE.registered': true }, initial: true }
	},

	familyProfile: {
		created: { type: Types.Boolean, label: 'family profile created', initial: true },
		date: { type: Types.Text, label: 'date family profile created', note: 'mm/dd/yyyy', dependsOn: { 'familyProfile.created': true }, initial: true }
	},

	closed: {
		isClosed: { type: Types.Boolean, label: 'closed', initial: true },
		date: { type: Types.Text, label: 'date closed', note: 'mm/dd/yyyy', dependsOn: { 'closed.isClosed': true }, initial: true },
		reason: { type: Types.Relationship, label: 'reason', ref: 'Closed Reason', dependsOn: { 'closed.isClosed': true }, initial: true }
	}

}, 'Social Worker Information', {

	socialWorker: { type: Types.Relationship, label: 'social worker', ref: 'Social Worker', initial: true }

}, 'Family Services', {

	familyServices: {
		mentee: { type: Types.Boolean, label: 'mentee', initial: true },
		mentor: { type: Types.Boolean, label: 'mentor', initial: true },
		mediaSpokesperson: { type: Types.Boolean, label: 'media spokesperson', initial: true },
		eventPresenterOrSpokesperson: { type: Types.Boolean, label: 'event presenter/spokesperson', initial: true },
		communityOutreach: { type: Types.Boolean, label: 'community outreach', initial: true },
		fundraising: { type: Types.Boolean, label: 'fundraising', initial: true },
		MARESupportGroupLeader: { type: Types.Boolean, label: 'MARE support group leader', initial: true },
		MARESupportGroupParticipant: { type: Types.Boolean, label: 'MARE support group participant', initial: true },
		receivesConsultationServices: { type: Types.Boolean, label: 'receives consultation services', initial: true }
	}

}, 'Info Preferences', {

	infoPacket: {
		packet: { type: Types.Select, options: 'English, Spanish, none', label: 'Packet', initial: true },
		date: { type: Types.Text, label: 'date info packet sent', note: 'mm/dd/yyyy', initial: true },
		notes: { type: Types.Textarea, label: 'notes', initial: true },
		mailingLists: { type: Types.Relationship, label: 'mailing lists', ref: 'Mailing List', many: true, initial: true }
	}

}, 'Matching Preferences', {

	matchingPreferences: {
		gender: { type: Types.Relationship, label: 'gender', ref: 'Gender', many: true, initial: true },
		legalStatus: { type: Types.Relationship, label: 'legal status', ref: 'Legal Status', many: true, initial: true },

		adoptionAges: {
			from: { type: Types.Number, label: 'from age', initial: true },
			to: { type: Types.Number, label: 'to age', initial: true }
		},

		numberOfChildrenToAdopt: { type: Types.Number, label: 'number of children to adopt', initial: true },
		siblingContact: { type: Types.Boolean, label: 'contact with siblings', initial: true },
		birthFamilyContact: { type: Types.Boolean, label: 'contact with birth parents', initial: true },
		race: { type: Types.Relationship, label: 'race', ref: 'Race', many: true, initial: true },

		maxNeeds: {
			physical: { type: Types.Select, options: 'none, mild, moderate, severe', label: 'maximum physical needs', initial: true },
			intellectual: { type: Types.Select, options: 'none, mild, moderate, severe', label: 'maximum intellectual needs', initial: true },
			emotional: { type: Types.Select, options: 'none, mild, moderate, severe', label: 'maximum emotional needs', initial: true }
		},

		disabilities: { type: Types.Relationship, label: 'disabilities', ref: 'Disability', many: true, initial: true },
		otherConsiderations: { type: Types.Relationship, label: 'other considerations', ref: 'Other Consideration', initial: true }

	}

}, 'Heard About MARE From', {

	heardAboutMAREFrom: { type: Types.Relationship, label: 'how did you hear about mare?', ref: 'Way To Hear About MARE', many: true, initial: true },
	heardAboutMAREOther: { type: Types.Text, label: 'other', note: 'only fill out if "other" is selected in the field above', initial: true }

}, 'Registration Details', {
	registeredViaWebsite: { type: Types.Boolean, label: 'registered through the website', noedit: true, initial: true }
});

ProspectiveParentOrFamily.relationship({ path: 'placements', ref: 'Placement', refPath: 'prospectiveParentOrFamily' });
ProspectiveParentOrFamily.relationship({ path: 'inquiries', ref: 'Inquiry', refPath: 'prospectiveParentOrFamily' });
ProspectiveParentOrFamily.relationship({ path: 'mailing-lists', ref: 'Mailing List', refPath: 'prospectiveParentOrFamilyAttendees' });
ProspectiveParentOrFamily.relationship({ path: 'internal-notes', ref: 'Internal Note', refPath: 'prospectiveParentOrFamily' });

// Displaly associations via the Relationship field type
// TODO: link inquiries.

// Pre Save
ProspectiveParentOrFamily.schema.pre('save', function(next) {
	'use strict';

	this.contact1.name.full = this.contact1.name.first + ' ' + this.contact1.name.last;

	// if both the first and last names are set for the second contact, set the full name to 'first last'
	// if only the first name is set, set the full name to the first name
	// if only the last name is set, set the full name to the last name
	// if neither the first nor the last name have been entered, set the full name to an empty string
	if(this.contact2.name.first && this.contact2.name.first.length > 0 && this.contact2.name.last && this.contact2.name.last.length > 0) {
		this.contact2.name.full = this.contact2.name.first + ' ' + this.contact2.name.last;
	} else if(this.contact2.name.first && this.contact2.name.first.length > 0 && (!this.contact2.name.last || !this.contact2.name.last.length > 0)) {
		this.contact2.name.full = this.contact2.name.first;
	} else if((!this.contact2.name.first || !this.contact2.name.first.length > 0) && this.contact2.name.last && this.contact2.name.last.length > 0) {
		this.contact2.name.full = this.contact2.name.last;
	} else {
		this.contact2.name.full = '';
	}

	// TODO: Assign a registration number if one isn't assigned
	next();
});

// // Define default columns in the admin interface and register the model
ProspectiveParentOrFamily.defaultColumns = 'registrationNumber, contact1.name.full, contact2.name.full';
ProspectiveParentOrFamily.register();
