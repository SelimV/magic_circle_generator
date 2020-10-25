var canvas;//store the canvas
var canvasSide = Math.min(window.innerWidth, window.innerHeight);//dimension of the square canvas
var prevX, newX, prevY, newY;//store previous and new values of mouse coordinates
var pressure = 0;//pressure for pen input
var drawing = false; //indicate when pen input is drawing
var pressureButtonValue = false;
var weight = 1;//stroke weight
var rotationOrder = 24;//the order of the rotational symmetry
var includeReflection = true;//include a horizontal reflection line, i.e. add * to the signature
var inversionRadii = [50, 70];//radii of the inversion circles
var includeInversion = true;//include an inversion, i.e. "a reflection with regard to a circle"


//for using pressure.js
function initPressure() {
    //defines the behaviour of the pressure sensitivity
    Pressure.set('#canvas', {
        start: function (event) {
            // this is called on force start
            drawing = true;
        },
        change: function (force, event) {
            if (pressureButtonValue) {
                pressure = force;
            } else {
                pressure = 1;
            }

        },
        end: function (event) {
            pressure = 1;
            drawing = false;
        }

    });
}


function setup() {
    canvas = createCanvas(canvasSide, canvasSide);
    canvas.id('canvas'); //needs an id to assign the pressure thingy
    initPressure();
    prevX = X();
    prevY = Y();
    disableScroll(); //fix a bug with pen input

    //set up some UI buttons for toggling options
    setUI();
}



function draw() {
    newX = X(); //read new mouse position
    newY = Y();
    applyMatrix(canvasSide / 200, 0, 0, -canvasSide / 200, canvasSide / 2, canvasSide / 2);//apply transform to easier coordinates

    noFill();
    if (drawing) {
        strokeWeight(pressure * weight);
        stroke(0);

        //draws rotations and reflections
        drawGroup();
        drawInversion();

    }

    //save the coordinates for next round
    prevX = newX;
    prevY = newY;
}

function drawGroup() {
    drawRotations();
    drawReflections();

}
function drawRotations() {
    for (let r = 0; r < rotationOrder; r++) {
        line(prevX, prevY, newX, newY);
        rotate(2 * PI / rotationOrder);
    }
}

function drawReflections() {
    if (includeReflection) {
        scale(-1, 1);
        drawRotations();
    }
}
function drawInversion() {
    if (includeInversion) {
        for (let i = 0; i < inversionRadii.length; i++) {
            const interestingRadius = inversionRadii[i];
            let tempPrevX = prevX, tempNewX = newX, tempPrevY = prevY, tempNewY = newY;//store the right values in temporary variables
            let OW = pressure * weight; //stroke weight originally
            let OWR = OW / 2;   //radius of the stroke weight
            let OPR = dist(0, 0, prevX, prevY);  //original draw centre radii
            let ONR = dist(0, 0, newX, newY);

            let OPHB = OPR + OWR;   //High and low bound of the original drawing radii
            let OPLB = OPR - OWR;
            let ONHB = ONR + OWR;
            let ONLB = ONR - OWR;
            let R2 = interestingRadius * interestingRadius;//the square of the inversion circle radius
            let IPLB = R2 / OPHB; //the high and low bounds after inversion
            let IPHB = R2 / OPLB;
            let INLB = R2 / ONHB;
            let INHB = R2 / ONLB;
            //if we are near origin, it is easy to accidentally colour the whole picture black
            if (INLB < 150 && IPLB < 150) {
                let IW = INHB - INLB;//stroke weight after inversion
                let IPR = (IPLB + IPLB) / 2;//the inverted draw centre radii
                let INR = (INLB + INLB) / 2;
                let prevRatio = IPR / OPR;//scaling ratios for the coordinates
                let newRatio = INR / ONR;
                prevX *= prevRatio;//scale the coordinates
                prevY *= prevRatio;
                newX *= newRatio;
                newY *= newRatio;
                strokeWeight(IW);//scale the stroke weight


                drawGroup();//draw the symmetric points with the inverted coordinates

                //restore the coordinates
                prevX = tempPrevX;
                newX = tempNewX;
                prevY = tempPrevY;
                newY = tempNewY;
            }
        }


    }
}










//transforms mouse coordinates so that they are easier to work with
function X() {
    return (mouseX - canvasSide / 2) / (canvasSide / 200);

}
function Y() {
    return -(mouseY - canvasSide / 2) / (canvasSide / 200);

}
//these are used to disable stupid touch scrolling stuff that makes the thing laggy AF
function preventDefault(e) {
    e.preventDefault();
}
function disableScroll() {
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}


//for setting up the buttons
function setUI() {
    //let pressureCheckbox = createCheckbox('Pressure sensitivity for pen input', false);
    //create UI elements
    let pressureButton = createButton("ACTIVATE pressure sensitivity for pen input");

    let clearButton = createButton("Clear");

    let weightLabel = createDiv('Stroke weight ');
    let weightInput = createInput(1);

    let rotationLabel = createDiv('Rotation order ');
    let rotationInput = createInput(rotationOrder);

    let reflectionLabel = createDiv('Include reflection ');
    let reflectionCheckbox = createCheckbox('', includeReflection);

    let inversionLabel = createDiv('Include inversions ');
    let inversionCheckbox = createCheckbox('', includeInversion);

    let radiiLabel = createDiv('Inversion radii ');
    let radiiInput = createInput(inversionRadii);

    //on landscape screen, put the UI on the right, otherwise on the bottom
    var leftPosition = 20, topPosition = 20;
    if (canvasSide < window.innerWidth - 320) {
        leftPosition += canvasSide;
    } else {
        topPosition += canvasSide;
    }
    //position the UI elements
    pressureButton.position(leftPosition, topPosition);
    topPosition += 40;
    clearButton.position(leftPosition, topPosition);
    topPosition += 40;
    weightLabel.position(leftPosition, topPosition);
    weightInput.position(leftPosition + 100, topPosition);
    topPosition += 40;
    rotationLabel.position(leftPosition, topPosition);
    rotationInput.position(leftPosition + 100, topPosition);
    topPosition += 40;
    reflectionLabel.position(leftPosition, topPosition);
    reflectionCheckbox.position(leftPosition + 120, topPosition);
    topPosition += 40;
    inversionLabel.position(leftPosition, topPosition);
    inversionCheckbox.position(leftPosition + 120, topPosition);
    topPosition += 40;
    radiiLabel.position(leftPosition, topPosition);
    radiiInput.position(leftPosition + 100, topPosition);


    //pressureCheckbox.changed(togglePressure(pressureButton));
    pressureButton.mousePressed(togglePressure(pressureButton));
    clearButton.mousePressed(clear);
    weightInput.input(weightInputEvent);
    rotationInput.input(rotationInputEvent);
    reflectionCheckbox.changed(toggleReflection);
    inversionCheckbox.changed(toggleInversion);
    radiiInput.input(radiiInputEvent);
}
function togglePressure(button) {
    return () => {
        if (pressureButtonValue) {
            pressureButtonValue = false;
            button.html("ACTIVATE pressure sensitivity for pen input");
        } else {
            pressureButtonValue = true;
            button.html("DISABLE pressure sensitivity for pen input");
        }
    }
}
function weightInputEvent() {
    weight = this.value();
}
function rotationInputEvent() {
    rotationOrder = this.value();
}
function toggleReflection() {
    includeReflection = this.checked();
}
function toggleInversion() {
    includeInversion = this.checked();
}
function radiiInputEvent() {
    inversionRadii = this.value().split(',').map(Number);
}
