from django.shortcuts import render

# Create your views here.
import json 
import urllib.request 
  
  
def index(request): 
    if request.method == 'POST': 
        city = request.POST['city'] 
        # recieve JSON data from API 
        source = urllib.request.urlopen( 
            'http://api.openweathermap.org/data/2.5/weather?q=' 
                    + city + '&appid=2806ec6fa398b3ee0837f40217ed8d03').read() 
  
        # convert JSON data to a dictionary 
        datalist = json.loads(source) 
        data = { 
            "city": str(city.capitalize()),  
            "temp": int(datalist['main']['temp']), 
            "humidity": str(datalist['main']['humidity']),
            "report": str(datalist['weather'][0]['main']), 
        }
    
        data["temp"] = str(round(data["temp"] - 273.15) * 9/5 + 32) + "F"
        print(data) 
    else: 
        data ={} 
    return render(request, "main/index.html", data) 