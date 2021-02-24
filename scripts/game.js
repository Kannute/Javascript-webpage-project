$(document).ready(function(){

    //Odtwarzanie muzyki za pomoca JQuery
    $("#my_audio").get(0).play();

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');


    /* Zmienne gry */


let player;           // Gracz
let gravity;          // Grawitacja działająca na gracza podczas skoku
let bodies = [];   // Generowane przeszkody
let gameSpeed;        // Tempo gry zwiększane wraz z upływem czasu
let keys = {};        // Wciśnięte przez gracza przyciski (spacja, S, W, shift)
let initialSpawnTimer = 180;            //Poczatkowy czas do pojawiania sie przeszkod
let spawnTimer = initialSpawnTimer;     //Zmieniajacy sie czas pojawiania sie przeszkod, wraz z uplywem czasu

/* Event Listeners */
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

/* Klasa Gracza */
class Player {


  constructor (x, y, w, h, c) {
    /* Konstruktor gracza */

    this.x = x;     //Położenie x gracza
    this.y = y;     //Położenie y gracza
    this.w = w;     //Szerokość gracza
    this.h = h;     //Wysokość gracza
    this.c = c;     //Kolor gracza

    this.dy = 0;                //Prędkość skoku
    this.jumpForce = 15;        //Siła skoku
    this.originalHeight = h;    //Domyślna wysokość gracza, do której wraca po "kucnięciu"
    this.grounded = false;      //Flaga sprawdzajaca czy gracz znajduje sie na ziemi
    this.jumpTimer = 0;         //Czas skoku
  }

  Animate () {
    /* Metoda obslugujaca polozenie gracza na Canvasie */

    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS']) {
      this.h = this.originalHeight / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jump () {
    /* Metoda obslugujaca skok gracza */

    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw () {
    /* Metoda rysujaca pojazd gracza na Canvas */
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    
    ctx.fillStyle = this.c;
    ctx.moveTo(this.x + this.w, this.y);
    ctx.lineTo(this.x + this.w + 20, this.y + this.h/2 );
    ctx.lineTo(this.x + this.w, this.y+this.h);    
    ctx.fillStyle= this.c;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.x+this.w/3, this.y+this.h/2, 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.arc(this.x+this.w/2+10, this.y+this.h/2, 4, 0, 2 * Math.PI);
    ctx.arc(this.x+this.w/2+35, this.y+this.h/2, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x-20, this.y + this.h/6);
    ctx.lineTo(this.x, this.y + this.h/3);
    ctx.lineTo(this.x-20, this.y + this.h/2);
    ctx.lineTo(this.x, this.y + 2*this.h/3);
    ctx.lineTo(this.x-20, this.y + 5*this.h/6);
    ctx.lineTo(this.x, this.y + this.h);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }


}


class CelestialBody {
    /* Klasa przeszkody */

    constructor (x, y, r, c) {
        /* Konstruktor przeszkody */
      this.x = x;       //Polozenie x przeszkody
      this.y = y;       //Polozenie y przeszkody
      this.r = r;       //Srednica przeszkody     
      this.c = c;       //Kolor przeszkody
      this.crater = false;
      if(RandomIntInRange(0,10)%2){
        this.mx =   RandomIntInRange(-10, 10);
        this.my =   RandomIntInRange(-10, 10);
        this.mr =   RandomIntInRange(3, 6);
        this.crater=true;
      }
      this.dx = -gameSpeed;     //Predkosc przeszkody w strone gracza
    }
    
    Update () {
        /* Metoda do aktualizacji polozenia przeszkody  */
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
      }
    Draw () {
        /* Metoda rysujaca przeszkody na canvas */

        //Rysowanie ciala niebieskeigo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.c;
        ctx.fill();
        ctx.closePath();

        //Rysowanie kraterow
        if(this.crater){
            ctx.beginPath();
            ctx.moveTo(this.x+10, this.y+10);
            ctx.arc(this.x + this.mx, this.y + this.my, this.r/this.mr, 0, 2 * Math.PI);
            ctx.fillStyle = 'grey';
            ctx.fill();
            ctx.closePath();
        }
      }
    
}

function SpawnBody () {
    /* Funkcja generujaca przeszkode */
    let radius = RandomIntInRange(15, 40);      //Generowana losowa srednica
    let type = RandomIntInRange(0, 1);          //Typ przeszkody - wysoka lub niska
    let color = getRandomColor();               //Losowy kolor

    let celestialBody = new CelestialBody(canvas.width + radius, canvas.height - radius, radius, color);
  
    if (type == 1) {
      celestialBody.y -= player.originalHeight - 10;
    }
    bodies.push(celestialBody);
}

function RandomIntInRange (min, max) {
    /* Funkcja pomocnicza generujaca losowa liczbe calkowita z przedzialu */
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomColor() {
    /* Funkcja generujaca losowy kolor przeszkody */
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function Update () {
    /*Aktualizacja Canvasu */

  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Zmniejszenie czasu pojawiania sie przeszkod.. 
  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnBody();
    console.log(bodies);
    spawnTimer = initialSpawnTimer - gameSpeed * 8;
    
    // ..do pewnego momentu
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  //Rysowanie przeszkod
  for (let i = 0; i < bodies.length; i++) {
    let o = bodies[i];

    if (o.x + o.w < 0) {
      bodies.splice(i, 1);
    }

    //Obsluga kolizji z przeszkodami
    if (
      player.x < o.x + o.r &&
      player.x + player.w > o.x &&
      player.y < o.y + o.r &&
      player.y + player.h > o.y
    ) {
        //Restart gry
      bodies = [];
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;
    }

    o.Update();
  }

  player.Animate();
  gameSpeed += 0.003;

}

function Start () {
    /* Funkcja rozpoczynajaca gre i ustawiajaca wszystkie wartosci poczatkowe */

    canvas.width = 1200;    //Rozmiar Canvas
    canvas.height = 600;
  
    gameSpeed = 3;      //Szybkosc gry
    gravity = 1;        //Sila grawitacji
  
    player = new Player(70, 0, 80, 50, getRandomColor());   
  
    requestAnimationFrame(Update); 
}




//Start gry
Start();


  
});    