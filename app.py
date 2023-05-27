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

OutputSignal = [1 for i in range(15)]

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
    
    
    for poles in data_zeros_poles[1]:
        pole_real = poles["real"]
        pole_imag = poles["img"]
        poles_list.append(pole_real + pole_imag*1j)
        
    for zeros in data_zeros_poles[0]:
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

@app.route('/applyFilter', methods=['GET', 'POST'])
def applyFilter():
    jsonData = request.get_json()
    input_point = float(jsonData['signalPoint'])
    OutputSignal.append(input_point)
    filter_order = max(len(poles_list), len(zeros_list)) # get max length of one of them the biggest one

    if len(OutputSignal) > 2 * filter_order and len(OutputSignal) > 50:
        del OutputSignal[0:filter_order]

    finalFilterZeros = zeros_list + appliedAPF_Zeros
    finalFilterPoles = poles_list + appliedAPF_poles
    num, dem = signal.zpk2tf(finalFilterZeros, finalFilterPoles, 1)
    output_signal = signal.lfilter(num, dem, OutputSignal).real
    output_point = output_signal[-1]
    # return [output_point]
    return jsonify({"y_point": output_point.tolist()})

@app.route('/finalPhaseResponse', methods=['GET', 'POST'])
def finalPhaseResponse():

    appliedAPF_Zeros.clear()
    appliedAPF_poles.clear()

    for zero in All_PassF_Zeros:
        appliedAPF_Zeros.append(zero)
    for pole in All_PassF_Poles:
        appliedAPF_poles.append(pole)

    finalFilterZeros = zeros_list + appliedAPF_Zeros
    finalFilterPoles = poles_list + appliedAPF_poles
    freq, complex_gain = signal.freqz_zpk(
        finalFilterZeros, finalFilterPoles, 1)
    result_phase = np.unwrap(np.angle(complex_gain))#calculate complex gain and unwrapsto avoid phase jumps 

    return jsonify({"result_phase": result_phase.tolist(), "freq": freq.tolist()})


@app.route('/allPassPhase', methods=['GET', 'POST'])
def allpassPhase():
    All_PassF_Zeros.clear()
    All_PassF_Poles.clear()

    data = request.get_json()
    for item in data:
        if item["real"] == '':
            item["real"] = 0
        if item["img"] == '':
            item["img"] = 0
        real_poles = float(item["real"])
        img_poles = float(item["img"])
        pole = real_poles+img_poles*1j
        All_PassF_Zeros.append(1/np.conj(pole))
        All_PassF_Poles.append(pole)

    freq, complex_gain = signal.freqz_zpk(All_PassF_Zeros, All_PassF_Poles, 1)
    Ap_phase = np.unwrap(np.angle(complex_gain))
    return jsonify({"Ap_phase": Ap_phase.tolist(), "freq": freq.tolist()})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)