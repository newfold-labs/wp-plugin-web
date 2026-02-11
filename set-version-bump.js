const fs = require( 'fs' );
const semver = require( 'semver' );
const packagefile = './package.json';
const pluginfile = './wp-plugin-web.php';

if ( fs.existsSync( packagefile ) && fs.existsSync( pluginfile ) ) {
	// Read package.json
	const packageData = JSON.parse( fs.readFileSync( packagefile, 'utf8' ) );
	const currentVersion = packageData.version;
	
	// Read PHP file to get its current version
	const phpContent = fs.readFileSync( pluginfile, 'utf8' );
	const versionMatch = phpContent.match( /Version:\s+(\d+\.\d+\.\d+)/ );
	const phpVersion = versionMatch ? versionMatch[ 1 ] : currentVersion;
	
	let type = process.argv[ 2 ];
	if ( ! [ 'major', 'minor', 'patch' ].includes( type ) ) {
		type = 'patch';
	}

	const newVersion = semver.inc( currentVersion, type );
	
	// Update package.json
	packageData.version = newVersion;
	fs.writeFileSync( packagefile, JSON.stringify( packageData, null, 4 ) );

	// Update PHP file - replace both the header version and the constant
	let result = phpContent.replace( /Version:\s+\d+\.\d+\.\d+/, `Version:           ${ newVersion }` );
	result = result.replace( /define\(\s*'WEB_PLUGIN_VERSION',\s*'\d+\.\d+\.\d+'\s*\)/, `define( 'WEB_PLUGIN_VERSION', '${ newVersion }' )` );
	
	fs.writeFileSync( pluginfile, result, 'utf8' );

	console.log( 'Version updated', currentVersion, '=>', newVersion );
	console.log( 'PHP file version was:', phpVersion, '=> now:', newVersion );
}
