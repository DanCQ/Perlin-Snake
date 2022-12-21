const canvas = document.getElementById("canvas");
const portfolio = document.querySelector(".portfolio");

let screenHeight = window.innerHeight;
let screenWidth = window.innerWidth;
canvas.height = screenHeight;
canvas.width = screenWidth;
c = canvas.getContext("2d");

const array = []; //object array
let allow = true; //used for interval
let off; //used for interval
let time = 0; //used for interval

//perlin noise function items
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;
const scaled_cosine = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));
let mutate = 0;
let perlin;
let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave



//141 colors. The minimum is 0, the maximum is 140
const colorArray = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", 
    "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", 
    "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", 
    "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", 
    "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", 
    "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", 
    "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", 
    "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", 
    "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen",
    "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", 
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", 
    "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", 
    "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", 
    "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", 
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", 
    "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan",
    "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"
];


//Returns a random number within a chosen range
function randomRange(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
//Math.floor() rounds down to the nearest whole number  e.i. 10 = 0 - 9  
//Math.random() returns a random decimal between 0 - 0.99
}


//generates random numbers related to each other 
const noise = function(x, y = 0, z = 0) {

    if(perlin == null) {

        perlin = new Array(PERLIN_SIZE + 1);

        for(let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = Math.random();
        }
    }
    if(x < 0) {
        x = -x;
    }
    if(y < 0) {
        y = -y;
    }
    if(z < 0) {
        z = -z;
    }

    let xi = Math.floor(x);
    let yi = Math.floor(y);
    let zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;

    let r = 0;
    let ampl = 0.5;
    let n1, n2, n3;

    for(let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
        
        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);

        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAPB) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAPB + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);

        of += PERLIN_ZWRAPB;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAPB) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAPB + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);

        n1 += scaled_cosine(zf) * (n2 - n1);

        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;

        if(xf >= 1.0) {
            xi++;
            xf--;
        }
        if(yf >= 1.0) {
            yi++;
            yf--;
        }
        if(zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
}


class Circle {
    constructor(x, y, radius, color, offset) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.offset = offset; //distance away drawn
    }

    //circle
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.strokeStyle = "black";
        c.lineWidth = 0.7;
        c.stroke();
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        mutate += 0.005;
        this.x = noise(mutate + this.offset + 8) * screenWidth;
        this.y = noise(mutate + this.offset + 3) * screenHeight;
        
        this.draw();
    }

}

function creator() {

    for(let i = 0; i < 10; i++) {

        let radius = randomRange(20,35);
        let x = randomRange(radius,screenWidth - radius);
        let y = randomRange(radius,screenHeight - radius);
        let color = colorArray[randomRange(0,colorArray.length - 1)];

        let segment = new Circle(x, y, radius, color, i *  0.001);
        array.push(segment);
    }
}


function animate() {

    requestAnimationFrame(animate);

    c.fillStyle = "rgba(0, 0, 0, 0.001)";
    c.fillRect(0,0,screenWidth,screenHeight);

    array.forEach(obj => {
        obj.color = colorArray[randomRange(0,colorArray.length - 1)];
        obj.update();
    });

}


canvas.addEventListener("click", function() {

    portfolio.style.visibility = "visible";

    time = 10000; //10 seconds, resets on click
    
    if(allow) {

        allow = false; //prevents multiple intervals

        off = setInterval(() => {
            time -= 1000;
        
            if(time <= 0) {
                portfolio.style.visibility = "hidden";
                clearInterval(off);
                allow = true;
            }
        }, 1000);
    }
});


canvas.addEventListener("mousemove", function() {

    portfolio.style.visibility = "visible";

    time = 10000; //10 seconds, resets on click
    
    if(allow) {

        allow = false; //prevents multiple intervals

        off = setInterval(() => {
            time -= 1000;
        
            if(time <= 0) {
                portfolio.style.visibility = "hidden";
                clearInterval(off);
                allow = true;
            }
        }, 1000);
    }
});


//prevents infite loop when loading page on mobile
setTimeout(function() {
    window.addEventListener("resize", function() {
        
        //Only way found to avoid a canvas resize bug on mobile
        setTimeout(function() {
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
            canvas.height = screenHeight;
            canvas.width = screenWidth;
        },100);
    });
}, 25); 


window.onload = function() {

    creator();
    
    animate();

};