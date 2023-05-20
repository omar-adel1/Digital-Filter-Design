from flask import Flask, request, render_template, jsonify ,redirect, url_for
from scipy import signal
import numpy as np  
import pandas as pd
import os
import json

app = Flask(__name__)  #Create instance of Flask class

zeros_list = []   #Zeros and poles of filter design 
poles_list = []


All_PassF_Zeros = []   #All pass filter zeros and poles
All_PassF_Poles = []

appliedAPF_Zeros = [] #original system or signal has been processed or modified using an all-pass filter. 
appliedAPF_poles = [] # Applied for phase correction 



@app.route('/')
def Main_Page():
    return render_template('index.html')

@app.route('/calcgain',methods=['GET','POST'])
def calculate_gain():
    ##Client side to server side or backend
    
    data_zeros_poles = request.get_json()  #Data retrieved as POST request from getResponse in JS 
    
    zeros_list.clear()  #ensure only zeros and poles from the current request are retrieved
    poles_list.clear()
    
    # Retrieve poles and zeros from JS to calculate magnitude and phase response to be sent to JS to update plots
    
    
    for poles in data_zeros_poles[0]:
        pole_real = poles["real"]
        pole_imag = poles["img"]
        poles_list.append(pole_real + pole_imag*1j)
        
    for zeros in data_zeros_poles[1]:
        zero_real = zeros["real"]
        zero_imag = zeros["img"]
        zeros_list.append(zero_real + zero_imag*1j )
        
    Total_filter_zeros = zeros_list + appliedAPF_Zeros    #combines the user-provided zeros and poles with the additional zeros and poles that have been applied to the system.
    Total_filter_poles = poles_list + appliedAPF_poles    #account for phase distortion happened after filter design (zero and poles)    
    
    #Get the magnitude response of the designed digital filter 
    frequencies, frequency_response = signal.freqz_zpk(zeros_list,poles_list,1)
    
    Magnitude_Gain = 20 * np.log10(np.abs(frequency_response))  #Decibel scale
    
    #Get the phase response from the total zeros and poles of system
    _,frequency_response = signal.freqz_zpk(Total_filter_zeros,Total_filter_poles,1)
    
    #It unwraps the phase angles by adding the necessary multiple of ±2π to remove the discontinuities. 
    # The unwrapping process ensures that the phase signal is represented as a smooth and continuous function.

    Phase_Gain = np.unwrap(np.angle(frequency_response))
    
    #Server side or backend to frontend for plotting(Client side)
    
    return json.dumps({"frequencies":frequencies.tolist(),"magnitude" : Magnitude_Gain.tolist() , "phase": Phase_Gain.tolist() })

