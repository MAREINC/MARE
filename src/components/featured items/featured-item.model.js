const keystone			= require( 'keystone' ),
	  Types				= keystone.Field.Types;

// configure the s3 storage adapters
const imageStorage = new keystone.Storage({
	adapter: require( 'keystone-storage-adapter-s3' ),
	s3: {
		key: process.env.S3_KEY, // required; defaults to process.env.S3_KEY
		secret: process.env.S3_SECRET, // required; defaults to process.env.S3_SECRET
		bucket: process.env.S3_BUCKET_NAME, // required; defaults to process.env.S3_BUCKET
		region: process.env.S3_REGION, // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
		path: '/featured-items/images',
		// use the file name with spaces replaced by dashes instead of randomly generating a value
		// NOTE: this is needed to prevent access errors when trying to view the files
		generateFilename: file => file.originalname.replace( /\s/g, '_' ),
		publicUrl: file => `${ process.env.CLOUDFRONT_URL }/featured-items/images/${ file.originalname.replace( /\s/g, '_' ) }`
	},
	schema: {
		bucket: true, // optional; store the bucket the file was uploaded to in your db
		etag: true, // optional; store the etag for the resource
		path: true, // optional; store the path of the file in your db
		url: true // optional; generate & store a public URL
	}
});

// create model
var Featured = new keystone.List( 'Featured Item', {
	autokey: { path: 'key', from: 'title', unique: true },
	map: { name: 'title' }
});

// create fields
Featured.add({

	title: { type: Types.Text, label: 'title', default: 'Featured Items', noedit: true, initial: true }

}, 'About Us', {

	aboutUs: {
		title: { type: Types.Text, label: 'about us title', initial: true, default: 'Our Services' },
		target: { type: Types.Relationship, ref: 'Page', label: 'about us page', filter: { type: 'aboutUs' }, required: true, initial: true },
		image: { type: Types.File, storage: imageStorage, label: 'about us image' },
		url: { type: Types.Url, label: 'about us url', noedit: true }
	}

}, 'Success Story', {

	successStory: {
		title: { type: Types.Text, label: 'success story title', initial: true, default: 'Adoption Stories' },
		target: { type: Types.Relationship, ref: 'Success Story', label: 'success story', required: true, initial: true },
		image: { type: Types.File, storage: imageStorage, label: 'success story image' },
		url: { type: Types.Url, label: 'success story url', noedit: true }
	}

}, 'Upcoming Event', {

	event: {
		title: { type: Types.Text, label: 'event title', initial: true, default: 'Events' },
		target: { type: Types.Relationship, ref: 'Event', label: 'event', filters: { isActive: true }, required: true, initial: true },
		image: { type: Types.File, storage: imageStorage, label: 'event image' },
		url: { type: Types.Url, label: 'event url', noedit: true }
	}
});

Featured.schema.virtual( 'hasAboutUsImage' ).get( function() {
	'use strict';

	return !!this.aboutUs.image.url;
});

Featured.schema.virtual( 'hasSuccessStoryImage' ).get( function() {
	'use strict';

	return !!this.successStory.image.url;
});

Featured.schema.virtual( 'hasEventImage' ).get( function() {
	'use strict';

	return !!this.event.image.url;
});

// pre save
Featured.schema.pre( 'save', function( next ) {
	'use strict';

	// create objects of values to pass into the updateFieldsFunction
	const aboutUsOptions		= { id: this.aboutUs.target, targetModel: 'Page', field: 'aboutUs' },
		  successStoryOptions	= { id: this.successStory.target, targetModel: 'Success Story', field: 'successStory', url: '/adoption-stories' },
		  eventOptions			= { id: this.event.target, targetModel: 'Event', field: 'event' };
	// call updateFields for each of the three main model sections and receive a promise back for each
	const aboutUsUpdated		= this.updateFields( aboutUsOptions ),
		  successStoryUpdated	= this.updateFields( successStoryOptions ),
		  eventUpdated			= this.updateFields( eventOptions );
	// once all three model sections have been updated
	Promise.all( [ aboutUsUpdated, successStoryUpdated, eventUpdated ] ).then( () => {
		next();
	});
});

Featured.schema.methods.updateFields = function updateFields( { id, targetModel, field, url } ) {
	// return a promise for cleaner asynchronous processing
	return new Promise( ( resolve, reject ) => {
		// if no selection was made, we won't have an _id, abort execution and resolve with an undefined value
		if( !id ) {
			return resolve();
		}
		// fetch the model specified in the field using it's _id value
		keystone.list( targetModel ).model
				.findById( id )
				.exec()
				.then( model => {
					// if we can't find the model (it may have been deleted since last save), abort execution and resolve with an undefined value
					if( !model ) {
						return resolve();
					}
					// populate the related fields
					this[ field ].url = url ? url : model.get( 'url' );
					// resolve with the _id of the model for easy refetching further down the line
					resolve( model.get( '_id' ) );

				}, err => {
					// if there was an error while fetching the model, reject the promise and return the error 
					reject( err );
				});
	});
};

// define default columns in the admin interface and register the model
Featured.defaultColumns = 'title, aboutUs.target, successStory.target, event.target';
Featured.register();