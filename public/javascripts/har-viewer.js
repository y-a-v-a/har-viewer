document.getElementById('har').addEventListener('change', handleFileSelect, false);

//var piechart = document.getElementById('piechart');

function handleFileSelect(ev) {
	var file = ev.target.files[0];

	var reader = new FileReader();
	reader.onload = handleContents;
	reader.onerror = function() {
		alert('Error reading file...');
	};
	reader.readAsText(file);
}

function handleContents(ev) {
	var data = ev.target.result;

	var har = JSON.parse(data);
	var entries = getEntriesForPage("page_1_1", har);
//	var statuses = retrieveSatusesFromEntries(entries);
	// console.log(statuses);
//	drawChart(statuses, createContainer('test'));
	
	// for (var i = 0; i < infos; i++) {
		console.log(infos[0][0]);
		drawChart(infos[0][1](entries), createContainer(infos[0][0]));
	// }
}

function createContainer(id) {
	var div = document.createElement('div');
	div.id = id.replace(' ',  '-').toLowerCase();
	document.body.appendChild(div);
	return div;
}

////


google.load("visualization", "1", {
	packages: ["corechart"]
});

//google.setOnLoadCallback(drawChart);

function drawChart(data, target) {
	var dataTable = google.visualization.arrayToDataTable(data)
	, options = {};
	//   title: 'My Daily Activities'
	// };

	var chart = new google.visualization.PieChart(target);
	chart.draw(dataTable, options);
}


/////

function getPagesInHar(har) {
	return har.log.pages.length;
}

function getEntriesForPage(id, har) {
	var entries = har.log.entries, i = 0, entriesForPage = [];
	for (;i < entries.length;i++) {
		if (entries[i].pageref === id) {
			entriesForPage.push(entries[i]);
		}
	}
	return entriesForPage;
}

var infos = [

	['Response Codes', function retrieveSatusesFromEntries(entries) {
		var responses = {}, data = [['Response code', 'Amount']], i = 0, responseCode;
		for (; i < entries.length; i++) {
			responseCode = "" + entries[i].response.status;
			if (responses[responseCode] === undefined) {
				responses[responseCode] = 0;
			}
			responses[responseCode] += 1;
		}
		for ( var d in responses) {
			if (responses.hasOwnProperty(d)) {
				data.push([d, responses[d]]);
			}
		}
		return data;
	}],

	['Data per Mime type', function retrieveSizePerMimeType(entries) { // @TODO create google proof response
		var mimes = {}, i = 0, contentType, size;
		for (; i < entries.length; i++) {
			contentType = entries[i].response.content.mimeType;
			size = entries[i].response.content.size;
			if (mimes[contentType] === undefined) {
				mimes[contentType] = 0;
			}
			mimes[contentType] += size;
		}
		return mimes;
	}],

	['Requests per host', function requestsPerHost(entries) { // @TODO create google proof response
		var requests = {}, i = 0, host;
		for (; i < entries.length; i++) {
			host = entries[i]._host;
			if (requests[host] === undefined) {
				requests[host] = 0;
			}
			requests[host] += 1;
		}
		return requests;
	}]
];