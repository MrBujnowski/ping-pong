var express = require('express');  // Import modulu express pro vytvoření webového serveru
var Game = require('./Game');  // Import třídy Game pro správu her
var app = express();  // Inicializace aplikace express
const HERTZ = 60; // Aktualizační frekvence hry (60x za sekundu)
const port = process.env.PORT || 80;  // Nastavení portu serveru
var server = require('http')
	.createServer(app)
	.listen(port);  // Vytvoření a naslouchání HTTP serveru na daném portu
var io = require('socket.io')(server);  // Inicializace socket.io pro komunikaci mezi klienty a serverem
const uNRegex = new RegExp('^[a-zA-Z0-9_.-]{3,}$');  // Regulární výraz pro validaci uživatelského jména

app.use(express.static(__dirname + '/node_modules'));  // Přidání adresáře node_modules jako statický obsah
app.use(express.static(__dirname + '/public'));  // Přidání adresáře public jako statický obsah
app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/public/index.html');  // Nastavení základního souboru index.html jako hlavního vstupu
});

// Třída pro uživatele
class User {
	constructor(socket) {
		this.socket = socket;  // Uložení socketu uživatele
		this.username = socket.id;  // Nastavení výchozího jména uživatele na ID socketu
		this.game = { id: null, playing: false };  // Inicializace informací o hře
	}
}

// Objekt pro ukládání všech připojených uživatelů
let users = {};
let matchmaking = [];  // Pole pro ukládání uživatelů čekajících na hru
let games = {};  // Objekt pro ukládání spuštěných her

// Správa socketů
io.on('connection', socket => {
	console.log(`Nový klient připojen: ${socket.id}`);  // Výpis nového připojeného klienta
	users[socket.id] = new User(socket);  // Vytvoření nové instance uživatele a uložení do objektu users
	socket.broadcast.emit('player-broadcast', Object.keys(users).length);  // Oznámení všem klientům počtu připojených hráčů
	socket.emit('player-broadcast', Object.keys(users).length);  // Oznámení připojenému klientovi počtu připojených hráčů

	// Kontrola duplicity uživatelských jmen
	socket.on('set-username', (username, callback) => {
		let same_username = false;  // Proměnná pro kontrolu duplicity jména

		if (!uNRegex.test(username)) {  // Kontrola platnosti uživatelského jména podle regulárního výrazu
			callback(false);  // Odpověď klientovi, že jméno není platné
			same_username = true;  // Nastavení flagu na true kvůli neplatnému jménu
		}

		for (var key in users) {  // Procházení všech uživatelů
			var user = users[key];
			if (user.username == username) {  // Pokud je jméno již obsazeno
				callback(false);  // Odpověď klientovi, že jméno není platné
				same_username = true;  // Nastavení flagu na true kvůli duplicitě jména
			}
		}

		if (!same_username && users[socket.id].username == socket.id) {  // Pokud je jméno platné a unikátní
			console.log(
				`${users[socket.id].username} nastavil(a) své uživatelské jméno na ${username}`
			);  // Výpis, že uživatel změnil jméno
			users[socket.id].username = username;  // Uložení nového jména uživatele
			callback(true);  // Potvrzení klientovi, že jméno bylo úspěšně nastaveno
			socket.emit('matchmaking-begin');  // Informování klienta o zahájení hledání hry
			matchMaker(socket.id);  // Spuštění procesu matchmakeru pro nového uživatele
		} else {
			console.log(
				`${users[socket.id].username} se pokusil(a) nastavit své uživatelské jméno na ${username}, ale uživatelské jméno je již použito nebo je neplatné.`
			);  // Výpis, že uživatel se pokusil změnit jméno, ale nebylo to možné
		}
	});

	socket.on('get-ping', callback => {
		callback(true);  // Odeslání potvrzení o pingování zpět klientovi
	});

	// Odpojení uživatele
	socket.on('disconnect', () => {
		console.log(`Klient odpojen: ${users[socket.id].username}`);  // Výpis, že klient se odpojil
		delete users[socket.id];  // Odstranění uživatele ze seznamu připojených
		socket.broadcast.emit('player-broadcast', Object.keys(users).length);  // Informování klientů o změně počtu připojených hráčů

		if (matchmaking.length != 0 && matchmaking[0] == socket.id) {  // Pokud je uživatel ve frontě pro hru
			matchmaking = [];  // Vyprázdnění fronty matchmakingu
		}

		// Odstranění uživatele ze hry, pokud je v ní
		for (key in games) {
			let game = games[key];
			if (game.player1 == socket.id) {
				users[game.player2].socket.emit('player-left');  // Informování druhého hráče, že první hráč opustil hru
				delete games[key];  // Odstranění hry ze seznamu her
			} else if (game.player2 == socket.id) {
				users[game.player1].socket.emit('player-left');  // Informování prvního hráče, že druhý hráč opustil hru
				delete games[key];  // Odstranění hry ze seznamu her
			}
		}
	});
});

// Jednoduchý matchmaking, jakmile jsou ve frontě dva hráči, jsou spárováni
// Teoreticky by nikdy nemělo být více než dva hráči ve frontě najednou.
function matchMaker(new_player) {
	if (matchmaking.length != 0) {  // Pokud je ve frontě pro hru alespoň jeden další hráč
		var game = new Game(  // Vytvoření nové hry s prvním hráčem ve frontě a novým hráčem
			matchmaking[0],
			users[matchmaking[0]].username,
			new_player,
			users[new_player].username
		);
		games[game.id] = game;  // Uložení nové hry do seznamu spuštěných her

		// Uložení informací o hře u obou hráčů
		users[matchmaking[0]].game.id = game.id;
		users[new_player].game.id = game.id;
		users[matchmaking[0]].game.playing = true;
		users[new_player].game.playing = true;

		// Oznámení hráčům, že hra začala
		users[matchmaking[0]].socket.emit('game-started', {
			username: users[matchmaking[0]].username,
			player: 1,
			opp_username: users[new_player].username,
			ball: game.ball
		});
		users[new_player].socket.emit('game-started', {
			username: users[new_player].username,
			player: 2,
			opp_username: users[matchmaking[0]].username
		});
		console.log(`Hra ${game.id} začala.`);  // Výpis, že hra začala
		matchmaking = [];  // Vyprázdnění fronty pro matchmaking
	} else {
		matchmaking.push(new_player);  // Přidání nového hráče do fronty pro matchmaking
	}
}

// Odesílání aktualizovaných dat o hře každému hráči, každých 1/HERTZ sekundy
setInterval(() => {
	for (key in games) {  // Procházení všech spuštěných her
		let game = games[key];

		game.update();  // Aktualizace stavu hry

		// Příprava dat o hře pro oba hráče
		data = {
			1: {
				score: game.players[game.player1].score,
				pos: game.players[game.player1].pos
			},
			2: {
				score: game.players[game.player2].score,
				pos: game.players[game.player2].pos
			},
			ball: game.ball
		};

		// Odeslání aktualizovaných dat o hře oběma hráčům
		users[game.player2].socket.emit(
			'game-data',
			{
				score: data[2].score,
				opp_score: data[1].score,
				opp_pos: data[1].pos,
				ball: data.ball
			},
			callback => {
				game.players[game.player2].pos = callback;  // Uložení odpovědi o pozici hráče 2
			}
		);

		users[game.player1].socket.emit(
			'game-data',
			{
				score: data[1].score,
				opp_score: data[2].score,
				opp_pos: data[2].pos,
				ball: data.ball
			},
			callback => {
				game.players[game.player1].pos = callback;  // Uložení odpovědi o pozici hráče 1
			}
		);
	}
}, (1 / HERTZ) * 1000);  // Interval odesílání aktualizací stavu hry
