function parsedots(path){
	return (path || '').replace(/[\.\/]/g, '~');
}

function getdots(path){
	return (path || '').replace(/\~/g, '.');
}

function getslashes(path){
	return (path || '').replace(/\~/g, '/');
}

function levelrange(start, end){
	return {
		keyEncoding:'ascii',
		start:start,
		end:end + '\xff'
	}
}

function querykeys(path, starttime, endtime){
	path = parsedots(path + '.');
	var start = path;
	var end = path;
	if(starttime){
		start += starttime;
	}
	if(endtime){
		end += endtime;
	}
	return levelrange(start, end);
}

module.exports = {
	parsedots:parsedots,
	getdots:getdots,
	querykeys:querykeys,
	levelrange:levelrange
}