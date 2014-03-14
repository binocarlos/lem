module.exports = function(sep){
	return {
		parse:function(dots){
			return (dots || '').replace(/\./g, '\xff');
		}
	}
}