lem
===

telemetry database for time-series data using LevelDB

## plan

A 'node' is an entity in a property tree that has a history of values changing over time.

Nodes are identified by pathname - either dot or slash delimeted:

```
tracktube.cars.red5.speed
```

and

```
tracktube/cars/red5/speed
```

are the same nodes - i.e. a variable that has a history of values.

LevelDB is perfect for time-series data because it saves to disk in key order.

The keys for actual values will include the timestamp for the value.

The timestamp is either sent with the value or added on insert.

An example of a full key for the above node:

```
tracktube/cars/red5/speed/123456
```

This is one value and can be read as 'the speed for tracktube.cars.red5 at timestamp: 123456'

One limitation of lem is one value per node per millisecond.

If you need a telemetry system with more resolution than 1/1000th of a second - lem is probably not for you : )


### POST /

Add/update a node at the given key - you can save meta data to nodes this way:

```
$ curl -X POST -d '{"meta":"apples"}' http://lem.digger.io/tracktube/cars/red5/speed
```

### GET /

Returns the data for a node at a key:

```
$ curl http://lem.digger.io/tracktube/cars/red5/speed
```

returns:

```json
{
	"id":"tracktube.cars.red5.speed",
	"meta":"apples",
	"count":1242,
	"modified":23238282
}
```

Two extra fields are added to the results for each node:

 * count
 * modified

Count represents how many values are in the nodes history - modified is the timestamp of the most recent value.

### POST /history

Add a new value for a node - if the request body is JSON the object should contain:

 * value
 * timestamp

```
$ curl -X POST -d '{"value":76,"timestamp":123460}' http://lem.digger.io/tracktube/cars/red5/speed/history
```

if the request body is not JSON - the body is used as the value and a timestamp is added from the servers local time:

```
$ curl -X POST -d '76' http://lem.digger.io/tracktube/cars/red5/speed/history
```

### GET /history

Returns an array of values for a node:

```
$ curl http://lem.digger.io/tracktube/cars/red5/speed/history
```

returns:

```json
{
	id:'tracktube.cars.red5.speed',
	results:[[
		123456,70
	],[
		123457,72
	],[
		123458,74
	],[
		123459,75
	],[
		123460,76
	]
}
```

### get /history?from=&to=

You can control the time-period that results are returned for using the from and to query parameters

```
$ curl http://lem.digger.io/tracktube/cars/red5/speed/history?from=123458&to=123459
```

returns:

```json
{
	id:'tracktube.cars.red5.speed',
	results:[[
		123458,74
	],[
		123459,75
	]
}
```

## license

MIT

