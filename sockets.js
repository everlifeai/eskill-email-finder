exports.socket = function()
{
	var net = require('net');
	var socket = new net.Stream();
	var input = '';
	var read = 0;
	var readCallbacks = [];
	var writeCallbacks = [];
	
	var outputDebug = function(o, message)
	{
		if(o.debug)
			o.debugOutput(message);
	}

	this.debug = true;

	this.debugOutput = console.log;
	
	this.eol = '\r\n';

	this.timeout = 0;

	this.connect = function(port, host, callback)
	{
		var o = this;
		socket.on('error', function(err)
		{
			outputDebug(o, 'Connection error: ' + err);
			callback(err);
		});
		socket.setTimeout(this.timeout * 1000, function()
		{
			outputDebug(o, 'Timeout reached');
			callback(new Error('Timeout reached'));
		}
		);
		socket.on('connect', function()
		{
			outputDebug(o, 'Connected');
			callback(null);
		});
		socket.on('data', function(buffer)
		{
			outputDebug(o, 'Received ' + buffer.length + ' bytes');
			input += buffer.toString('utf8');
			for(var c = 0; c < readCallbacks.length; ++c)
			{
				if(readCallbacks[c] !== null)
					readCallbacks[c](null);
			}
		});
		socket.on('drain', function()
		{
			outputDebug(o, 'Sent queued data');
			for(var c = 0; c < writeCallbacks.length; ++c)
			{
				if(writeCallbacks[c] !== null)
					writeCallbacks[c](null);
			}
		});
		socket.connect(port, host);
	}

	this.read = function(callback)
	{
		var o = this;
		var readCallback = function(err)
		{
			var eol;

			if(input.length != 0)
			{
				var data = input.substr(read, input.length - read);
				read = 0;
				input = ''
				callback(null, data);
				return true;
			}
			return false;
		}
		if(!readCallback(null))
		{
			var currentCallback = readCallbacks.length;
			readCallbacks[currentCallback] = function(err)
			{
				if(readCallback(err))
					readCallbacks[currentCallback] = null;
			}
		}
	}

	this.readLine = function(callback)
	{
		var o = this;
		var readLineCallback = function(err)
		{
			var eol;

			if((eol = input.indexOf(o.eol, read)) != -1)
			{
				var line = input.substr(read, eol - read);
				read = eol + o.eol.length;
				callback(null, line);
				return true;
			}
			return false;
		}
		if(!readLineCallback(null))
		{
			var currentCallback = readCallbacks.length;
			readCallbacks[currentCallback] = function(err)
			{
				if(readLineCallback(err))
					readCallbacks[currentCallback] = null;
			}
		}
	}

	this.write = function(data, callback)
	{
		outputDebug(this, 'Sending ' + data.length + ' bytes')
		if(socket.write(data))
			callback(null);
		else
		{
			var currentCallback = writeCallbacks.length;
			writeCallbacks[currentCallback] = function(err)
			{
				writeCallbacks[currentCallback] = null;
				callback(err);
			}
		}
	}

	this.writeLine = function(line, callback)
	{
		this.write(line +  this.eol, callback);
	}

	this.end = function()
	{
		socket.end();
		socket.destroy();
	}
};