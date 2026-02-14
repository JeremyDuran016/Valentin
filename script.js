window.addEventListener("DOMContentLoaded", () => {

/* ================= FUENTE BONITA ================= */
const link = document.createElement("link");
link.href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;500&display=swap";
link.rel="stylesheet";
document.head.appendChild(link);

/* ================= CANVAS ================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let mouse = {x:null,y:null};

let blackHoleActive = true;
let forming = false;
let exploding = false;
let freeDrift = false; // ← movimiento libre después de explotar

let targets = [];
let activeRatio = 0.25;

/* ================= PARTICLE ================= */

class Particle{
    constructor(){ this.reset(); }

    reset(){
        this.angle = Math.random()*Math.PI*2;
        this.radius = Math.random()*canvas.width*0.7;
        this.speed = 0.0005 + Math.random()*0.0015;
        this.size = Math.random()*2+0.5;

        this.centerX = canvas.width/2;
        this.centerY = canvas.height/2;
        this.offset = Math.random()*1000;

        this.x = this.centerX;
        this.y = this.centerY;

        this.vx = 0;
        this.vy = 0;
        this.target = null;
    }

    update(){

        /* formar figuras */
        if(forming && this.target){
            this.x += (this.target.x - this.x)*0.06;
            this.y += (this.target.y - this.y)*0.06;
            return;
        }

        /* explosión */
        if(exploding){
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.985;
            this.vy *= 0.985;
            return;
        }

        /* polvo estelar libre */
        if(freeDrift){
            this.x += this.vx;
            this.y += this.vy;

            this.vx *= 0.995;
            this.vy *= 0.995;

            /* poco a poco vuelve a la órbita */
            this.angle += this.speed;
            let tx = this.centerX + Math.cos(this.angle)*this.radius;
            let ty = this.centerY + Math.sin(this.angle)*this.radius;

            this.x += (tx - this.x)*0.002;
            this.y += (ty - this.y)*0.002;
            return;
        }

        /* galaxia normal */
        this.angle += this.speed;
        let spiral = this.radius + Math.sin(Date.now()*0.001 + this.offset)*25;

        this.x = this.centerX + Math.cos(this.angle)*spiral;
        this.y = this.centerY + Math.sin(this.angle)*spiral;

        /* agujero negro inicial */
        if(blackHoleActive && mouse.x !== null){
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx*dx+dy*dy);

            if(dist < 140){
                this.x -= dx*0.03;
                this.y -= dy*0.03;
            }
        }
    }

    draw(){
        ctx.fillStyle="#ff4d6d";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fill();
    }
}

/* ================= CREAR PARTÍCULAS ================= */

for(let i=0;i<950;i++){
    particles.push(new Particle());
}

/* ================= LOOP ================= */

function animate(){
    ctx.fillStyle="rgba(5,5,15,0.35)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}
animate();

window.addEventListener("mousemove",e=>{
    mouse.x=e.clientX;
    mouse.y=e.clientY;
});

/* ================= FORMAR TEXTO ================= */

function formText(text){

    forming = true;
    exploding = false;

    activeRatio += 0.18;
    if(activeRatio > 1) activeRatio = 1;

    const activeCount = Math.floor(particles.length * activeRatio);

    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = canvas.width;
    temp.height = canvas.height;

    tctx.fillStyle="white";
    tctx.font="bold 120px Montserrat";
    tctx.textAlign="center";
    tctx.fillText(text,canvas.width/2,canvas.height/2);

    const data = tctx.getImageData(0,0,temp.width,temp.height).data;

    targets=[];

    for(let y=0;y<temp.height;y+=6){
        for(let x=0;x<temp.width;x+=6){
            let i=(y*temp.width+x)*4;
            if(data[i+3]>150){
                targets.push({x,y});
            }
        }
    }

    particles.forEach((p,i)=>{
        p.target = (i < activeCount) ? targets[i % targets.length] : null;
    });
}

/* ================= CORAZÓN ================= */

function formHeart(){

    forming = true;

    const cx = canvas.width/2;
    const cy = canvas.height/2;

    targets=[];

    for(let t=0;t<Math.PI*2;t+=0.02){
        let x = 16*Math.pow(Math.sin(t),3);
        let y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));

        targets.push({ x: cx + x*18, y: cy + y*18 });
    }

    particles.forEach((p,i)=>{
        p.target = targets[i % targets.length];
    });
}

/* ================= EXPLOSIÓN ================= */

function explode(){

    forming = false;
    exploding = true;

    particles.forEach(p=>{
        let ang = Math.random()*Math.PI*2;
        let force = Math.random()*10+3;

        p.vx = Math.cos(ang)*force;
        p.vy = Math.sin(ang)*force;
    });

    setTimeout(()=>{
        exploding=false;
        freeDrift=true; // ← quedan flotando vivos
        showPressButton();
    },2000);
}

/* ================= BOTÓN ROMÁNTICO ================= */

function createLoveButton(text){
    const btn=document.createElement("button");
    btn.innerHTML=`💖 ${text} 💖`;

    btn.style.fontFamily="Montserrat";
    btn.style.fontSize="18px";
    btn.style.padding="16px 28px";
    btn.style.borderRadius="40px";
    btn.style.border="none";
    btn.style.background="linear-gradient(135deg,#ff4d6d,#ff8fa3)";
    btn.style.color="white";
    btn.style.boxShadow="0 0 25px rgba(255,77,109,0.6)";
    btn.style.cursor="pointer";
    btn.style.transition="0.3s";
    btn.style.zIndex="20";

    btn.onmouseenter=()=>btn.style.transform="scale(1.08)";
    btn.onmouseleave=()=>btn.style.transform="scale(1)";

    return btn;
}

/* ================= SECUENCIA ================= */

startBtn.onclick=()=>{
    blackHoleActive=false;
    startBtn.style.display="none";

    setTimeout(()=>formText("TE AMO"),1000);
    setTimeout(()=>formText("MI NIÑA"),4000);
    setTimeout(()=>formText("GRACIAS"),7000);
    setTimeout(()=>formText("POR EXISTIR"),10000);
    setTimeout(()=>formHeart(),13000);
    setTimeout(()=>explode(),17000);
};

/* ================= PRESIÓNAME ================= */

function showPressButton(){

    const btn=createLoveButton("PRESIÓNAME");
    btn.style.position="fixed";
    btn.style.top="50%";
    btn.style.left="50%";
    btn.style.transform="translate(-50%,-50%)";

    document.body.appendChild(btn);

    btn.onclick=()=>{
        btn.remove();
        showFinal();
    };
}

/* ================= MENSAJE FINAL BONITO ================= */

function showFinal(){

    const msg=document.createElement("div");
    msg.innerHTML=`
        <div style="font-family:'Great Vibes'; font-size:64px; margin-bottom:20px;">
            Pide un deseo AMOR
        </div>
        <div style="font-family:Montserrat; font-size:22px; letter-spacing:1px;">
            el mío ya se cumplió cuando te conocí
        </div>
    `;

    msg.style.position="fixed";
    msg.style.top="50%";
    msg.style.left="50%";
    msg.style.transform="translate(-50%,-50%)";
    msg.style.color="white";
    msg.style.textAlign="center";
    msg.style.opacity="0";
    msg.style.transition="2.5s";
    msg.style.zIndex="30";

    document.body.appendChild(msg);

    setTimeout(()=>msg.style.opacity="1",300);

    spawnPhotos();
}

/* ================= FOTOS ================= */

function spawnPhotos(){

    const photos=[
        "img/foto1.jpg",
        "img/foto2.jpg",
        "img/foto3.jpg",
        "img/foto4.jpg",
        "img/foto5.jpg"
    ];

    photos.forEach((src,i)=>{

        setTimeout(()=>{

            let img=document.createElement("img");
            img.src=src;

            img.style.position="fixed";
            img.style.width="4cm";
            img.style.height="6cm";
            img.style.objectFit="cover";
            img.style.opacity="0";
            img.style.transition="3s";
            img.style.zIndex="10";

            let x,y;
            do{
                x=Math.random()*90;
                y=Math.random()*90;
            }while(x>35 && x<65 && y>35 && y<65);

            img.style.left=x+"%";
            img.style.top=y+"%";
            img.style.transform=`rotate(${Math.random()*20-10}deg) scale(0.6)`;

            document.body.appendChild(img);

            setTimeout(()=>{
                img.style.opacity="0.9";
                img.style.transform=`rotate(${Math.random()*20-10}deg) scale(1)`;
            },200);

        }, i*900);
    });
}

});
