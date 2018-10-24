const config = require('./config.js');
const path   = require('path');
const fs     = require('fs-extra');
const twig   = require('twig');
const glob   = require('glob');

// - data
const data = {};
const renderData = () => {

	glob(config.srcPaths.data.all, (err, files) => {
		files.forEach((filePath) => {
			let file     = filePath.split('/').pop(),
				fileName = file.slice(0, -5);
			// console.log(fileName);
			data[fileName] = JSON.parse(fs.readFileSync( filePath ));
		});
	});

	data.env       = process.env.NODE_ENV;
	data.assetPath = config.assetPath;
	data.portPath  = data.assetPath; // local/prod dual ports, can be set to assetPath for prod
	data.timestamp = Date.now();

	return data;

};

// - render
const renderAll = () => {
	
	glob(config.srcPaths.html, (err, files) => {

		files.forEach((file) => {
			// console.log(file);
			renderSingle(file);
		});

	});

};

const renderSingle = (file) => {

	let options = {
		settings: {
			views: config.srcPaths.templates
		},
		data: renderData()
	};

	twig.renderFile(file, options, (err, html) => {

		let parts = file.split('/');
			parts.shift();

		// if in views/pages/ remove views and pages from path
		if ( parts.length == 2 ) {
			// home page
			parts.splice(0, 1); // flatten path
		} else if ( parts.length > 2 ) {
			// pages dir
			parts.splice(0, 3); // flatten path
		}

		file = parts.join('/');


		let dest = config.destPaths.root + '/' + file;

		if ( !err && html ) {
			fs.outputFile(dest, html);
		} else {
			return;
		}

	});

};

renderAll();
