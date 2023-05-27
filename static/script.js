let canvas = document.getElementById("zplane-canvas");
let ctx = canvas.getContext("2d");
let conjugateindex=[]
var conjugate_btn= document.getElementById("add_conjugate");
var checkconj=0;
canvas.height = 500;
canvas.width = 500;
const rect = canvas.getBoundingClientRect(); //store position and size info of the canvas on the screen

// For deleting individual poles and zeros

//const menu = document.querySelector(".wrapper");
//var delete_button = document.getElementById("delete");
//var close_button = document.getElementById("close");


// Drawing the unit circle and axis
function setUpCanvas() {
    ctx.beginPath();
    ctx.arc(180, 180, 160, 0, 2 * Math.PI, false);  //(xcenter,ycenter,radius,startangle,endangle,counterclock)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 180);  //drawing axes (Real axis)
    ctx.lineTo(360, 180);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(180, 0);  //drawing axes (Imaginary axis)
    ctx.lineTo(180, 360);
    ctx.lineWidth = 0.5;
    ctx.stroke();
};

setUpCanvas();

//Get control buttons

var zero_btn = document.getElementById("draw-zeros");
var pole_btn = document.getElementById("draw-poles");

//clear buttons
var All_clear_button = document.getElementById("clear-all"); 
var clear_zeros_button = document.getElementById("clear-zeros");
var clear_poles_button = document.getElementById("clear-poles");

conjugate_btn.addEventListener("change", function() {
  if (conjugate_btn.checked) {
      checkconj = 1;
  } else {
      checkconj = 0;
  }
  
});
//Setting draw shape variable to zero or pole  
var draw_shape = "zero"; // default
zero_btn.style.backgroundColor =" rgba(18, 82, 119, 1)" ;
zero_btn.onclick = function(){

    draw_shape = "zero";
    zero_btn.style.backgroundColor =" rgba(18, 82, 119, 1)" ;
    pole_btn.style.backgroundColor = "black";
};

pole_btn.onclick = function(){

    draw_shape = "pole";
    pole_btn.style.backgroundColor =" rgba(18, 82, 119, 1)" ;
    zero_btn.style.backgroundColor = "black";
};

//Set variables for drawing 

var start_x = 0; // start_x and start_y for current mouse position
var start_y = 0;
var end_x = 360;
var end_y = 360;

let shapes = []
let zeros_list = []
let poles_list = []

let  selected_shape = null; //Zero / Pole
var to_draw = false;
var to_move = false;

//Drawing shapes

function drawZero(x,y)
{
ctx.beginPath();

ctx.arc(x,y,6,0, 2* Math.PI, false);
ctx.lineWidth= 1;

ctx.fillStyle = "#296d98";
ctx.fill();
ctx.strokeStyle = "black";
ctx.stroke();


};

function drawPole(x, y) {
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "red";

    ctx.moveTo(x - 6, y - 6);
    ctx.lineTo(x + 6, y + 6);

    ctx.moveTo(x + 6, y - 6);
    ctx.lineTo(x - 6, y + 6);

    ctx.stroke();
};

//Move shape
//Function checks if new point in complex domain is within boundries of another existing point (shape object)
function is_mousepointer_in_shape(shape)
{
let left = shape.x - 6;
let right = shape.x +6;
let top = shape.y - 6;
let bottom = shape.y +6;

if(left<start_x && right>start_x && top<start_y && bottom>start_y)
{
    return true
}
return false;

};


function Shapes_Draw(shapes){

ctx.clearRect(0,0,canvas.width,canvas.height);
setUpCanvas();

for(let shape of shapes)
{
  // console.log('t');
if(shape.type == "zero"){
  // console.log(checkconj);
    drawZero(shape.x,shape.y);
    // if(checkconj === 1){
    //   console.log(-shape.y);
    //   drawZero(shape.x,-shape.y);
    // }
    //shape ={x:5,y:4}
}
else{

    drawPole(shape.x,shape.y);
}

}

};

// Mouse Events / clicks on canvas

canvas.onclick = (event)=>{
//menu.style.visibility = "hidden";
to_draw = true;
start_x = parseInt(event.offsetX); 
start_y = parseInt(event.offsetY);

let distance = Math.sqrt(Math.pow(start_x - 180, 2) + Math.pow(start_y - 180, 2));
let radius = 160;

// check if new point is within boundries of already existing point
for(let shape of shapes)
{
  if(is_mousepointer_in_shape(shape))
  {
    to_draw = false;
  }
}

if(distance<radius){
if(to_draw)
{

if(draw_shape == "zero")
{
    drawZero(start_x,start_y);
    shapes.push({x:start_x, y:start_y,type:"zero"});
    
    if(checkconj === 1){
      let index = shapes.length - 1;
      shapes[index].conj=index+1;
      let conv_pix_x=(start_x - 180)/160;
      let conv_pix_y=-(start_y - 180)/160;
      let new_y=-conv_pix_y;
      let draw_x= (conv_pix_x*160)+180;
      let draw_y=-(new_y*160)+180;
      

      drawZero(draw_x,draw_y);
      shapes.push({x:draw_x, y:draw_y,type:"zero",conj:index});

    }
}
else{

    drawPole(start_x,start_y);
    shapes.push({x:start_x,y:start_y,type:"pole"});
    if(checkconj === 1){
     let index = shapes.length - 1;
     shapes[index].conj=index+1;
      let conv_pix_x=(start_x - 180)/160;
      let conv_pix_y=-(start_y - 180)/160;
      let new_y=-conv_pix_y;
      let draw_x= (conv_pix_x*160)+180;
      let draw_y=-(new_y*160)+180;
      

      drawPole(draw_x,draw_y);
      shapes.push({x:draw_x, y:draw_y,type:"pole",conj:index});

      
    }

}
to_draw = false;
convert_to_cartesian(shapes);
}


}


}


canvas.onmousedown = (event)=>{

start_x = parseInt(event.clientX - rect.left);
start_y = parseInt(event.clientY - rect.top);
let index = 0;
// Check is click is in boundries of any existing point or shape 
for(let shape of shapes){
if(is_mousepointer_in_shape(shape)){
selected_shape = index;
to_move = true;


}
index++;
}

};

//User has hand off the mouse click 
canvas.onmouseup = ()=>{
if(to_move){
to_move = false;
canvas.style.cursor = "default";
}

};
document.addEventListener("keydown", function(event) {
  if (event.key === "Backspace") {
    if (selected_shape !== null) {
      console.log(selected_shape)
      let selected_conj_check=shapes[selected_shape];
      
      
   
      shapes.splice(selected_shape, 1);
      Shapes_Draw(shapes);
      convert_to_cartesian(shapes);
      selected_shape = null;
    }
  }
});
canvas.onmousemove = (event) =>{
//Shape currently being moved    
if(to_move){
  canvas.style.cursor = "move";
end_x = parseInt( event.clientX - rect.left); //calc current mouse coordinates relative to canvas
end_y = parseInt(event.clientY - rect.top);

let diff_x = end_x - start_x;  //differences between the current and starting coordinates of the mouse movement in the x-axis and y-axis
let diff_y = end_y - start_y;
// get shape selected by  indexing the shapes by (selected_shapes)
let current_shape_selected = shapes[selected_shape];
//Move the selected shape according to mouse movement
current_shape_selected.x +=diff_x;
current_shape_selected.y +=diff_y;

if(current_shape_selected.hasOwnProperty("conj")){
  console.log("s");
let conj_drag=shapes[current_shape_selected.conj];
conj_drag.x +=diff_x;
let conv_pix_y=-(current_shape_selected.y - 180)/160;
let new_y=-conv_pix_y;

conj_drag.y=-(new_y*160)+180;

}
//Clear canvas, redraw unit circle and axis, then draw all shapes in shapes array
Shapes_Draw(shapes);

convert_to_cartesian(shapes);

//
// Update starting coordinates to be equal to the current coordinates
start_x = end_x;
start_y = end_y;

}


};

// Delete single zeros or poles
// canvas.addEventListener('contextmenu',function(e){
// e.preventDefault();
// start_x = e.offsetX, start_y = e.offsetY;

// let menu_appear = false;
// let index = 0;
// for(let shape of shapes){
// if(is_mousepointer_in_shape(shape)){

//     selected_shape = index;
//     menu_appear = true;
// }

// index++;

// }

// // if(menu_appear){

// //     menu.style.left = '${start_x}px';
// //     menu.style.top = '${start_y + 180}px';
// //     menu.style.visibility = "visible";

// // }

// });


//Delete menu buttons
//Arrow function
// close_button.onclick = ()=>{

// menu.style.visibility = "hidden";

// };

// delete_button.onclick = ()=>{
// //menu.style.visibility = "hidden";
// shapes.splice(selected_shape,1);
// Shapes_Draw(shapes);
// convert_to_cartesian(shapes);
// };

//Clear buttons(All,zeros,poles)

All_clear_button.onclick = ()=>{
shapes=[];
Shapes_Draw(shapes);
convert_to_cartesian(shapes);

};

clear_zeros_button.onclick = ()=>{
  zeros_list = []
  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    
    if (shape.type == "zero") {
        shapes.splice(i, 1); // Remove the current shape from the array
        i--; // Adjust the index to account for the removed element
    }

}

  
  Shapes_Draw(shapes);
  convert_to_cartesian(shapes);

};

clear_poles_button.onclick = ()=>{
  poles_list = []
  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    
    if (shape.type == "pole") {
        shapes.splice(i, 1); // Remove the current shape from the array
        i--; // Adjust the index to account for the removed element
    }
}

  
  Shapes_Draw(shapes);
  convert_to_cartesian(shapes);
};

function convert_to_cartesian(shapes){
zeros_list = []
poles_list = []

let x = 0;
let y = 0;
for (let shape of shapes ){
x= (shape.x - 180)/160;
y = -(shape.y - 180)/160;

if(shape.type=="zero"){
  

    zeros_list.push({real:x , img:y})
    
}

else{
poles_list.push({real : x,img:y})

}

}
 
console.log(zeros_list);
console.log(poles_list);
getMagnitude_Phase_response();

};

function convert_to_pixels(zeros_list,poles_list){
shapes = []
let x = 0; 
let y = 0;
for(let zero of zeros_list){

shapes.push({x: x,y: y,type: "zero"});

}
for(let pole of poles_list){
    x=(poles_list["real"]*160) + 180
    y=(poles_list["img"]*160) +180
    shapes.push({x: x,y: y,type: "pole"});
    
    }

    Shapes_Draw(shapes);

    getMagnitude_Phase_response();
};

// Magnitude and phase response 5000
// Client side send poles and zeros ---=> Get Mag and phase from backend


function getMagnitude_Phase_response(){
//Asynchronus Javascript and XML
//To dynamically update content without reloading the whole page (only parts of web page)
  $.ajax({
    dataType : "json",
    contentType : "application/json ; charset=utf-8",
    data : JSON.stringify([zeros_list,poles_list]), //Send data (zeros,poles) to server (backend)
    type: 'POST', //POST (like submitting a form)
    url: 'http://127.0.0.1:5000/calcgain',  //Sent to this function in backend
    //If got response(success)  data from backend (mag and phase response)is sent to the frontend (JS) 
    //to dynamic, real-time update of the plots
    success: function(data_mag_phase){
     
        Frequencies = data_mag_phase["frequencies"];
        magnitude_gain = data_mag_phase["magnitude"];
        phase_gain = data_mag_phase["phase"];


        var update_magnitude = { 'x':[Frequencies], 'y':[magnitude_gain]  };
        var phase_update = { 'x':[Frequencies], 'y':[phase_gain]  };

        console.log(phase_update);
        console.log(update_magnitude);




        Plotly.update("magnitude_response",update_magnitude);
        Plotly.update("phase_response", phase_update); 

    }

  })


};

/*
Update Plots of magnitude and phase response

Parameters:
title_graph: The title of the response drawn
label_gain: label of 
frequency_x: X-axis--> Frequencies
gain_y: Magnitude or phase gain (Y-axis)
ID_div: ID of the plot container 

*/

function mag_phase_response_draw(title_graph,label_gain,frequency_x,gain_y,ID_div){


var record_response = {
    x: frequency_x,
    y: gain_y,
    type: "scatter",
    mode: "lines"

};

var graph_layout_properties = {
    width: 400,
    height: 200,
    margin:{t:40,b:45,l:55,r:20},
    
    xaxis:{title: 'Frequency[Hz]'},  //frequency axis for both gains(Mag,phase)
    yaxis:{title: label_gain},
    title: title_graph

};

var graph_data = [record_response];

Plotly.newPlot(ID_div,graph_data,graph_layout_properties);


};

//Initialize Plots (Magnitude and phase plots)
mag_phase_response_draw("Magnitude Response","Amplitude [db]",[],[],"magnitude_response");
mag_phase_response_draw("Phase Response","Angle [rad]",[],[],"phase_response");



//------------------------------ 3rd col-----------------//

function CreateGraph(Div, Title, Time, Magnitude){
  var Datapoints ={
    x: Time,
    y: Magnitude,
    type: "scatter",
    mode: "lines"
  };
  var layout = {
    title: Title,
    height: 200,
    width: 400,
    margin: { t: 25, b: 35, l: 40, r: 5 },
    xaxis: { title: 'Time [s]', range: [0, 3] },
    yaxis: { title: "Magnitude" }
  };
  var Data = [Datapoints];
  
  Plotly.newPlot(Div,Data,layout);
};
// intia empty graph
CreateGraph("General_signal", "General Signal",[],[]);
CreateGraph("Filtered_signal","Filtered Signal", [],[]);
//zyad
function setUpPlot(div, time, amp, graph_title) {
    // Prepare The data
    var plot = {
        x: time,
        y: amp,
        type: "scatter",
        mode: "lines"
    };

    // Prepare the graph and plotting
    var layout = {
        width: 400,
        height: 200,
        margin: { t: 25, b: 35, l: 40, r: 5 },

        xaxis: { title: 'Time [s]', range: [0, 3] },
        yaxis: { title: "Amplitude" },
        title: graph_title
    };

    var data = [plot];

    Plotly.newPlot(div, data, layout);
};

// Import Signal

// Import Signal

let working = false;
let interval;
let uploadSignal = document.getElementById('Upload_signal_button');
let speedSlider = document.getElementById('speed_slider');
let speedLabel = document.getElementById('speed_label');
let intervalTime = 1000;
let x = [];
let y = [];
let i = 0;
let layout = {
  width: 400,
  height: 200,
  margin: { t: 25, b: 35, l: 55, r: 5 },
  xaxis: { title: 'Time [s]', range: [0, 3] },
  yaxis: { title: "Amplitude" },
};
uploadSignal.onchange = (e) => {
  setUpPlot("General_signal", [], [], "Input");
  setUpPlot("Filtered_signal", [], [], "Output");
  generate_phase = false;
  
  x = [];
  y = [];
  i=0;
  
  let file = e.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (event) {
    var csvData = event.target.result;
    let parsedCSV = d3.csvParse(csvData);
    let keys = Object.keys(parsedCSV[0]);
    parsedCSV.forEach(function (d, i) {
      x.push(d[keys[0]]);
      y.push(d[keys[1]]);
    });
    
    
  };
  
  plottingDynamic(1)
};

function plottingDynamic(speed){
 

  

  // speedSlider.addEventListener('input', function () {
  //   let speed = parseFloat(this.value);
  //   intervalTime = 1000 / speed;
  //   speedLabel.textContent = `Speed: ${speed}x`;
  // });

  if (working) {
    clearInterval(interval);
  }
  working = true;

  interval = setInterval(() => {
    if (i < y.length) {
      let filtered_point = Filtering(y[i]);
      plot_input_Output(y[i], filtered_point, x[i]);
      i += 1;
    } else {
      clearInterval(interval);
      working = false;
    }
    if (i == y.length) {
      clearInterval(interval);
    }
  }, intervalTime);
}
speedSlider.addEventListener('input', function () {
  let speed = parseFloat(this.value);
  intervalTime = 1000 / speed;
  speedLabel.textContent = `Speed: ${speed}x`;

  plottingDynamic(intervalTime);
});
// speedSlider.onchange = (e) =>{
//   console.log(speedSlider);
// }
let plot_input_Output = (inputPoint, outputPoint, t) => {
  Plotly.extendTraces(General_signal, { y: [[inputPoint]], x: [[t]] }, [0]);
  Plotly.extendTraces(Filtered_signal, { y: [[outputPoint]], x: [[t]] }, [0]);

  if (t >= 3) {
    var update_range = { "xaxis.range": [t - 2.5, t] };
    Plotly.relayout("General_signal", update_range);
    Plotly.relayout("Filtered_signal", update_range);
  }
};

  let Filtering = (General_Magnitude) => { // got to pyhton and do process on the magnitude of original signal and give mag of filtered signal
    let Filtered_Magnitude

    $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:5000/applyFilter',
        data: JSON.stringify({ signalPoint: General_Magnitude }),
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,
        success: function (data) {
            Filtered_Magnitude = data["y_point"];
        },
    });
    return Filtered_Magnitude
};

// ------------------- All-Pass Filters

// Open and close the page
var allpass_btn = document.getElementById("allpass_btn");
var all_pass_wrapper = document.getElementById("all_pass_wrapper");
var all_pass_close = document.getElementById("all_pass_close");

allpass_btn.onclick = function () {
    all_pass_wrapper.style.scale = "1";
};
all_pass_close.onclick = function () {
    all_pass_wrapper.style.scale = "0";
};

// Initailize the response
function drawAPFResponse(div, freq, gain) {
    // Prepare The data
    var response = {
        x: freq,
        y: gain,
        type: "scatter",
        mode: "lines"
    };

    // Prepare the graph and plotting
    var layout = {
        width: 400,
        height: 200,
        margin: { t: 25, b: 35, l: 35, r: 0 },

        xaxis: { title: 'Frequency [Hz]' },
        yaxis: { title: "Angle [radians]" },
    };

    var data = [response];

    Plotly.newPlot(div, data, layout);
};

drawAPFResponse("current_apf_graph", [], []);
drawAPFResponse("cumulative_apf_graph", [], []);



// Get A value from input data
let a_real = document.getElementById("a_real");
let a_img = document.getElementById("a_img");
var add_filter_btn = document.getElementById("add_filter_btn");
var apf_filters_container = document.getElementById("added_content");
var apply_filter_btn = document.getElementById("apply_filter_btn");

// List that contains all filters to be sent to the back-end
let apf_list = []
let apf_polar_list = []

// To check if filter was already used
function checkList(a) {
    for (let i = 0; i < apf_polar_list.length; i++) {
        if (a == apf_polar_list[i]) {
            return true;
        }
    }
    return false;
};

// Add filter to the content menu
function addFilterInMenu(a) {

    // Filter div
    let filter_div = document.createElement("div");
    filter_div.className = "filter";

    // The input data
    let filter_text = document.createElement("p");
    let text = document.createTextNode("a = " + a);
    filter_text.appendChild(text);

    // Delete Button
    let del_btn = document.createElement("span");
    let del_text = document.createTextNode("delete");
    del_btn.appendChild(del_text);
    del_btn.className = "material-symbols-outlined";
    del_btn.classList.add("del-filter");
    // Important to be able to delete filter from the list
    del_btn.id = a;

    // Finish the div then append it
    filter_div.appendChild(filter_text);
    filter_div.appendChild(del_btn);
    apf_filters_container.appendChild(filter_div);
};

// Add Filter Button
add_filter_btn.onclick = function () {
    // var input_a = input_text.value.replace(/\s/g, "");

    let filter_polar = "";
    if (a_img.value < 0) {
        filter_polar = a_real.value + a_img.value + "j";
    }
    else if (a_img.value > 0) {
        filter_polar = a_real.value + "+" + a_img.value + "j";
    }
    else {
        filter_polar = a_real.value
    }

    // if input is empty or already used
    if (filter_polar === '' || checkList(filter_polar)) {
        a_real.value = "";
        a_img.value = "";
        a_real.focus();
        return;
    }

    // Push filter to the list
    apf_list.push({ real: a_real.value, img: a_img.value });
    apf_polar_list.push(filter_polar);

    // Add filter to the menu
    addFilterInMenu(filter_polar);

    a_real.value = "";
    a_img.value = "";
    a_real.focus();

    // plot filter response 
    allPassFiltersResponse(apf_list);
};


// Delete Filter
document.addEventListener('click', function (e) {
    if (e.target.classList.contains("del-filter")) {

        // Remove it from filters list
        let index = 0;
        for (let i = 0; i < apf_polar_list.length; i++) {
            if (e.target.id == apf_polar_list[i]) {
                index = i;
                break;
            }
        }

        apf_list.splice(index, 1);
        apf_polar_list.splice(index, 1);

        // remove it from history
        e.target.parentNode.remove();

        // plot filter response 
        allPassFiltersResponse(apf_list);
    }
});


// Catalogue
var swiper = new Swiper(".swiper", {
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    // grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",

    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true
    },
    spaceBetween: 40,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
    },

    // Catalogue on click
    onClick: function (e) {
        real = document.querySelector('.swiper-slide-active .info .real').textContent;
        img = document.querySelector('.swiper-slide-active .info .img').textContent;
        let polar = "";

        if (img == '') {
            polar = real;
        }
        else if(real==''){
          polar = img + "j";
        }
        else {
            polar = real + "+" + img + "j";
        }
        

        if (checkList(polar)) {
            return
        }
        // Push filter to the list
        apf_list.push({ real: real, img: img });
        apf_polar_list.push(polar);

        // Add filter to the menu
        addFilterInMenu(polar);
        // plot filter response 
        allPassFiltersResponse(apf_list);

    }
});

function allPassFiltersResponse(apf_list) {
    $.ajax({
        contentType: "application/json;charset=utf-8",
        url: 'http://127.0.0.1:5000/allPassPhase',
        type: 'POST',
        data: JSON.stringify(apf_list),
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            freq = response["freq"];
            Ap_phase = response["Ap_phase"];
            var phase_update = { x: [freq], y: [Ap_phase] };

            Plotly.update("cumulative_apf_graph", phase_update);
        },
    });
};


// apply filter on original phase
apply_filter_btn.onclick = function () {
    finalResponse();
}

function finalResponse() {
    $.ajax({
        url: 'http://127.0.0.1:5000/finalPhaseResponse',
        type: 'POST',
        data: false,
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            freq = response["freq"];
            final_phase = response["result_phase"];
            console.log(freq)
            console.log(final_phase)
            var phase_update = { x: [freq], y: [final_phase] };

            Plotly.update("phase_response", phase_update);
            Plotly.update("current_apf_graph", phase_update);
        },
    });
};
