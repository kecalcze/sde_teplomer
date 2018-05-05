load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_dht.js');

let led = 25;
let topic = '/devices/' + Cfg.get('device.id') + '/events';

// GPIO pin which has a DHT sensor data wire connected
let weatherData = 15;

// Initialize DHT library
let dht = DHT.create(weatherData, DHT.AM2302);

print('LED GPIO:', led, 'AM2302_DATA GPIO:', weatherData);

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

let getWeather = function() {
  let temp = dht.getTemp();
  let hum = dht.getHumidity();
  
  if (isNaN(hum) || isNaN(temp)) {
    return 'Failed to read data from sensor';
  }

  return JSON.stringify({
    temperature: {
      value: temp,
      unit: "*C"
    },
    humidity: {
      value: hum,
      unit: "%"
    }
  });
};

// Blink built-in LED every second
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(10000 /* 10 sec */, Timer.REPEAT, function() {
  let value = GPIO.toggle(led);
  print(value ? 'Tick' : 'Tock', 'uptime:', Sys.uptime(), getInfo());
  print(getWeather());
}, null);

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);

