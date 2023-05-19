from flask import Flask, request, render_template, jsonify ,redirect, url_for
from scipy import signal
import numpy as np  
import pandas as pd
import os
import json

app = Flask(__name__)  #Create instance of Flask class

zeros_list = []
poles_list = []


All_PassF_Zeros = [] 
All_PassF_Poles = []


@app.route('/')
def Main_Page():
    return render_template('index.html')

#@app.route('/calcgain',methods=['GET','POST'])

#def calculate_gain():
    
    