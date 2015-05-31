var request = require('request');


request.post('http://localhost:1337/gateway/create', {form: {serial: 'EDISON' + Math.trunc(Math.random()*1000), type:'EDISON1.0'}},function(err,httpResponse,gData){
    var gateway = JSON.parse(gData);

    for (var i = 0; i < Math.trunc(Math.random()*100); i++) { 

      request.post('http://localhost:1337/node/create', {form: {serial:'NODE' + Math.trunc(Math.random()*1000), icon: 'XB8LP.png' ,type:'XB8LP'}},function(err,httpResponse,nData){ 
          var node = JSON.parse(nData);

        request.get('http://localhost:1337/gateway/' + gateway.id + '/nodes/add/' + node.id, function(err,httpResponse,body){ 

          console.log('http://localhost:1337/gateway/' + gateway.id + '/nodes/add/' + node.id);
          console.log(body);

        });

        for (var i = 0; i < Math.trunc(Math.random()*100); i++) { 

              var defaultSettings = {delta: {time: 300, value: 2}, min: -20, max: 65, safe: {min: 15, max: 35}};
    
              var items = [
                {node: node.serial, type: 'TEMP1_0', icon: '48x48/weather.png' ,value: Math.trunc(Math.random()*defaultSettings.max), action: 'CHANGE', settings: defaultSettings},
                {node: node.serial, type: 'HUMI1_0', icon: '48x48/rainmeter.png' ,value: Math.trunc(Math.random()*defaultSettings.max), action: 'CHANGE', settings: defaultSettings},
                {node: node.serial, type: 'BATE1_0', icon: '48x48/battery.png' ,value: Math.trunc(Math.random()*defaultSettings.max), action: 'CHANGE', settings: defaultSettings},
                {node: node.serial, type: 'LIGH1_0', icon: '48x48/flashlight app.png' ,value: Math.trunc(Math.random()*defaultSettings.max), action: 'TIMER', settings: defaultSettings}
              ];

              request.post('http://localhost:1337/datapoint/create', {form: items[Math.trunc(Math.random()*items.length)]},function(err,httpResponse,body){ 

                console.log(body);

              });
        };

      });

    };

});
