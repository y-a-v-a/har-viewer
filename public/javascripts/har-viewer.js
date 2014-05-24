document.getElementById('har').addEventListener('change', handleFileSelect, false);

google.load("visualization", "1", {
	packages: ["corechart"]
});

//google.setOnLoadCallback(drawChart);

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

	var har = JSON.parse(data)
    , entries
    , wrapper
    , pages = har.log.pages || [];
	
    for (var j = 0; j < pages.length; j++) {
        entries = getEntriesForPage(j, har);
        wrapper = createContainer('p' + pages[j]._date, 'charts');
        appendBasicData(pages[j], wrapper);
        for (var i = 0; i < infos.length; i++) {
            drawChart(infos[i][1](entries), infos[i][0], wrapper.id);
        }
    }
}

function appendBasicData(page, parent) {
    var meta = document.createElement('div');
    meta.innerHTML = page._URL + ' in ' + page._browser_name + ' ' + page._browser_version;
    meta.style.fontSize = '10px';
    parent.appendChild(meta);
}

function createContainer(id, parent) {
	var div = document.createElement('div');
	div.id = id.replace(' ',  '-').toLowerCase();
    if (parent === undefined) {
        document.body.appendChild(div);
    } else {
        document.getElementById(parent).appendChild(div);
    }
	return div;
}

function drawChart(data, id, parent) {
	var dataTable = google.visualization.arrayToDataTable(data)
	, options = {
      title: id,
      legend: 'none',
      width: 256,
      height: 256
    },
    target = createContainer(id, parent);

	var chart = new google.visualization.PieChart(target);
	chart.draw(dataTable, options);
}

function getEntriesForPage(j, har) {
	var entries = har.log.entries, i = 0, entriesForPage = [],
    id = har.log.pages[j].id;
	for (;i < entries.length;i++) {
		if (entries[i].pageref === id) {
			entriesForPage.push(entries[i]);
		}
	}
	return entriesForPage;
}

var infos = [

	['Response Codes', function retrieveSatusesFromEntries(entries) {
		var responses = {}, data = ['Response code#Amount'.split('#')], i = 0, responseCode;
		for (; i < entries.length; i++) {
			responseCode = "" + entries[i].response.status;
			if (responses[responseCode] === undefined) {
				responses[responseCode] = 0;
			}
			responses[responseCode] += 1;
		}
		for ( var p in responses) {
			if (responses.hasOwnProperty(p)) {
				data.push([p, responses[p]]);
			}
		}
		return data;
	}],

	['Data per Mime type', function retrieveSizePerMimeType(entries) {
		var mimes = {}, data = ['Mime type#Size'.split('#')], i = 0, contentType, size;
		for (; i < entries.length; i++) {
			contentType = entries[i].response.content.mimeType;
			size = entries[i].response.content.size;
			if (mimes[contentType] === undefined) {
				mimes[contentType] = 0;
			}
			mimes[contentType] += size;
		}
        for (var p in mimes) {
            if (mimes.hasOwnProperty(p)) {
                data.push([p, mimes[p]]);
            }
        }
		return data;
	}],

	['Requests per host', function requestsPerHost(entries) {
		var requests = {}, data = ['Host#Amount'.split('#')], i = 0, host;
		for (; i < entries.length; i++) {
			host = entries[i]._host;
			if (requests[host] === undefined) {
				requests[host] = 0;
			}
			requests[host] += 1;
		}
        for (var p in requests) {
            if (requests.hasOwnProperty(p)) {
                data.push([p, requests[p]]);
            }
        }
		return data;
	}]
];