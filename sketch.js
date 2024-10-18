let jugador, computadora, pelota;
let anchoCampo = 800;
let altoCampo = 400;
let puntuacionJugador = 0;
let puntuacionComputadora = 0;
let grosorMarco = 10;
let fondo, imgRaquetaJugador, imgRaquetaComputadora, imgPelota, sonidoRebote, sonidoGol;

function preload() {
  fondo = loadImage('fondo1.png');
  imgRaquetaJugador = loadImage('barra1.png');
  imgRaquetaComputadora = loadImage('barra2.png');
  imgPelota = loadImage('bola.png');
  sonidoRebote = loadSound('446100__justinvoke__bounce.wav'); // Cargar el sonido de rebote
  // sonidoGol = loadSound('173859__jivatma07__j1game_over_mono.wav'); // Cargar el sonido de gol
}

function setup() {
  createCanvas(anchoCampo, altoCampo);
  jugador = new Raqueta(20, imgRaquetaJugador);
  computadora = new Raqueta(width - 20, imgRaquetaComputadora);
  pelota = new Pelota(imgPelota);
  textAlign(CENTER, CENTER);
  textSize(32);
}

function draw() {
  background(fondo);
  mostrarPuntuacion();
  dibujarMarcos();
  jugador.mostrar();
  computadora.mostrar();
  pelota.mostrar();
  pelota.mover();
  pelota.rebotar();
  if (keyIsDown(UP_ARROW)) {
    jugador.mover(-jugador.velocidad);
  } else if (keyIsDown(DOWN_ARROW)) {
    jugador.mover(jugador.velocidad);
  }
  computadora.moverAI(pelota);
}

function mostrarPuntuacion() {
  fill(color("#2B3FD6"));
  text(`${puntuacionJugador} - ${puntuacionComputadora}`, width / 2, 50);
}

function dibujarMarcos() {
  fill(color("#2B3FD6"));
  rect(0, 0, width, grosorMarco); // Marco superior
  rect(0, height - grosorMarco, width, grosorMarco); // Marco inferior
}

class Raqueta {
  constructor(x, img) {
    this.x = x;
    this.y = height / 2;
    this.ancho = 10;
    this.alto = 60;
    this.velocidad = 5;
    this.img = img;
  }

  mostrar() {
    image(this.img, this.x, this.y, this.ancho, this.alto);
  }

  mover(paso) {
    this.y += paso;
    this.y = constrain(this.y, grosorMarco, height - grosorMarco - this.alto);
  }

  moverAI(pelota) {
    if (this.y + this.alto / 2 < pelota.y) {
      this.y += this.velocidad;
    } else if (this.y + this.alto / 2 > pelota.y) {
      this.y -= this.velocidad;
    }
    this.y += random(-2, 2);
    this.y = constrain(this.y, grosorMarco, height - grosorMarco - this.alto);
  }
}

class Pelota {
  constructor(img) {
    this.x = width / 2;
    this.y = height / 2;
    this.radio = 12;
    this.velocidadX = 5;
    this.velocidadY = 3;
    this.incrementoVelocidad = 0.7;
    this.img = img;
    this.angulo = 0;
  }

  mostrar() {
    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    image(this.img, -this.radio, -this.radio, this.radio * 2, this.radio * 2);
    pop();
  }

  mover() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    let velocidadMagnitud = sqrt(this.velocidadX ** 2 + this.velocidadY ** 2);
    this.angulo += velocidadMagnitud * 0.05;
  }

  rebotar() {
    if (this.y < grosorMarco + this.radio || this.y > height - grosorMarco - this.radio) {
      this.velocidadY *= -1;
    }
    if (this.x < 0) {
      puntuacionComputadora++;
      // sonidoGol.play(); // Reproducir el sonido de gol
      narrarMarcador();
      this.reset();
    } else if (this.x > width) {
      puntuacionJugador++;
      // sonidoGol.play(); // Reproducir el sonido de gol
      narrarMarcador();
      this.reset();
    }
    if (this.chocaRaqueta(jugador) || this.chocaRaqueta(computadora)) {
      this.ajustarAngulo(jugador, computadora);
      sonidoRebote.play(); // Reproducir el sonido de rebote
    }
  }

  chocaRaqueta(raqueta) {
    return (
      this.x - this.radio < raqueta.x + raqueta.ancho &&
      this.x + this.radio > raqueta.x &&
      this.y > raqueta.y &&
      this.y < raqueta.y + raqueta.alto
    );
  }

  ajustarAngulo(jugador, computadora) {
    let raqueta = this.x < width / 2 ? jugador : computadora;
    let puntoImpacto = (this.y - raqueta.y) / raqueta.alto;
    let nuevoAngulo = map(puntoImpacto, 0, 1, -PI / 4, PI / 4);
    this.velocidadX = (this.x < width / 2 ? 1 : -1) * cos(nuevoAngulo) * sqrt(this.velocidadX ** 2 + this.velocidadY ** 2);
    this.velocidadY = sin(nuevoAngulo) * sqrt(this.velocidadX ** 2 + this.velocidadY ** 2);
    this.aumentarVelocidad();
  }

  aumentarVelocidad() {
    if (this.velocidadX > 0) {
      this.velocidadX += this.incrementoVelocidad;
    } else {
      this.velocidadX -= this.incrementoVelocidad;
    }
    if (this.velocidadY > 0) {
      this.velocidadY += this.incrementoVelocidad;
    } else {
      this.velocidadY -= this.incrementoVelocidad;
    }
    jugador.velocidad += this.incrementoVelocidad;
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadX = 5;
    this.velocidadY = 3;
    this.angulo = 0;
    jugador.velocidad = 5;
  }
}

function narrarMarcador() {
  let marcador = `${puntuacionJugador} - ${puntuacionComputadora}`;
  let mensaje = new SpeechSynthesisUtterance(marcador);
  window.speechSynthesis.speak(mensaje);
}
