var host = window.location.href; // Získá aktuální URL stránky
console.log(host);
var socket = io.connect(host); // Připojí se k socketu pomocí aktuální URL

let game_state; // Proměnná pro uložení stavu hry

// Mění text na stránce "searching for match"
let i = '';
let interval = setInterval(() => {
	document.getElementById('searching-for-match').innerHTML = 'Hledání zápasu' + i;
	i += '.';
	if (i == '.....') i = '';
}, 500);

// Kontroluje ping
let ping_interval = setInterval(() => {
	let time = Date.now();
	socket.emit('get-ping', callback => {
		document.getElementById('ping').innerHTML = `Ping: ${Date.now() - time}ms`;
	});
}, 500);

// Získává počet online hráčů
socket.on('player-broadcast', players => {
	document.getElementById('online-players').innerHTML = `Online: ${players}`;
});

// Hra byla zahájena
socket.on('game-started', data => {
	clearInterval(interval); // Zastaví interval pro hledání zápasu
	game_state = new Pong(
		data.username,
		data.player,
		data.opp_username,
		data.ball
	); // Inicializuje nový objekt Pong s údaji o hře
	interval = setInterval(() => {
		game_state.update(); // Aktualizuje stav hry 60krát za sekundu
	}, (1 / 60) * 1000);
	document.getElementById('match-making').remove(); // Odstraní matchmaking div
	document.getElementById('gameplay').style.display = 'flex'; // Zobrazí div pro hru
	fit_canvas(); // Přizpůsobí plátno velikosti obrazovky
});

// Získává nová herní data a aktualizuje stav hry
socket.on('game-data', (data, callback) => {
	game_state.game.self.score = data.score; // Aktualizuje skóre hráče
	game_state.game.opp.score = data.opp_score; // Aktualizuje skóre soupeře
	game_state.game.ball = data.ball; // Aktualizuje pozici míčku
	game_state.game.opp.pos = data.opp_pos; // Aktualizuje pozici soupeře
	callback(game_state.game.self.pos); // Posílá zpět aktuální pozici hráče
});

// Zobrazí matchmaking div
socket.on('matchmaking-begin', () => {
	document.getElementById('match-making').style.display = 'block';
});

// Přizpůsobí plátno velikosti obrazovky při změně velikosti okna
window.addEventListener('resize', fit_canvas);
function fit_canvas() {
	let canvas = document.getElementById('drawing-canvas');
	let parent = document.getElementById('gameplay');
	canvas.height = parent.offsetHeight - 10;
	canvas.width = parent.offsetWidth - 10;
}

// Posílá uživatelské jméno na server
function setUsername() {
	socket.emit(
		'set-username',
		document.getElementById('input-username').value,
		callback => {
			if (callback) {
				document.getElementById('start-screen').remove(); // Odstraní úvodní obrazovku
				console.log('Změna uživatelského jména úspěšná');
			} else {
				window.alert(
					'Uživatelské jméno je neplatné, musí mít více než 3 znaky, nesmí obsahovat mezery a musí být jedinečné. (^[a-zA-Z0-9_.-]{3,}$)'
				);
			}
		}
	);
}

// Hra pro dva hráče 1v1
function oneVerseOne() {
	// Ovládání pomocí klávesnice
	let KEYMAP = {};
	KEYMAP[87] = false; // Klávesa W
	KEYMAP[83] = false; // Klávesa S
	KEYMAP[38] = false; // Šipka nahoru
	KEYMAP[40] = false; // Šipka dolů
	document.addEventListener('keydown', function (event) {
		KEYMAP[event.keyCode] = true;
	});
	document.addEventListener('keyup', function (event) {
		KEYMAP[event.keyCode] = false;
	});
	game = new Game(
		0,
		2,
		1,
		4
	);
	game_state = new Pong(
		"Player One",
		1,
		"Player Two",
		[50, 50]
	);
	clearInterval(interval);
	interval = setInterval(() => {
		if (KEYMAP[87]) game_state.upSelf(); // Pohyb hráče nahoru
		if (KEYMAP[83]) game_state.downSelf(); // Pohyb hráče dolů
		if (KEYMAP[38]) game_state.upOpp(); // Pohyb soupeře nahoru
		if (KEYMAP[40]) game_state.downOpp(); // Pohyb soupeře dolů
		game_state.update(); // Aktualizace stavu hry
		game.update(); // Aktualizace stavu hry včetně fyziky a kolizí
		game_state.game.self.score = game.players[0].score;
		game.players[0].pos = game_state.game.self.pos;
		game_state.game.opp.score = game.players[1].score;
		game.players[1].pos = game_state.game.opp.pos;
		game_state.game.ball = game.ball;
	}, (1 / 60) * 1000);

	document.getElementById('match-making').remove();
	document.getElementById('gameplay').style.display = 'flex';
	fit_canvas();
}

// Zpracovává odchod soupeře ze hry
socket.on('player-left', () => {
	socket.disconnect();
	document.location.reload();
});

// Pohyb myší
$('#drawing-canvas').mousemove(function (e) {
	let mouse_pos = getMousePos(e);
	game_state.game.self.pos =
		(mouse_pos.y / document.getElementById('drawing-canvas').height) * 100;
});

function getMousePos(evt) {
	let canvas = document.getElementById('drawing-canvas');
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Mobilní zařízení
document.addEventListener('touchstart', touchHandler);
document.addEventListener('touchmove', touchHandler);

function touchHandler(e) {
	if (e.touches) {
		let playerY =
			e.touches[0].pageY -
			document.getElementById('drawing-canvas').offsetTop;
		game_state.game.self.pos =
			(playerY / document.getElementById('drawing-canvas').height) * 100;
		e.preventDefault();
	}
}
