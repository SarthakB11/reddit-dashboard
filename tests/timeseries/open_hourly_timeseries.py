import webbrowser
import time
import sys

print("Opening timeseries page with hourly view in browser...")
webbrowser.open("http://localhost:3000/timeseries")
print("Once the page loads, please click the 'Hourly' button to see hourly data")

print("Script completed. The timeseries page should be open in your browser.")
print("You should see real hourly data from the backend with the 'Data from API' indicator.") 