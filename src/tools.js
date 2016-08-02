function levelrange(start, end){
	return {
		start:start,
		end:end + '\xff'
	}
}

function querykeys(path, starttime, endtime){
	var start = path;
	var end = path;
	if(starttime){
		start += '.' + starttime;
	}
	if(endtime){
		end += '.' + endtime;
	}
	return levelrange(start, end);
}

module.exports = {
	querykeys:querykeys,
	levelrange:levelrange
}
