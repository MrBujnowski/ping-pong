const uuid = require('uuid');  // Import knihovny UUID pro generování unikátních identifikátorů
const MAX_SPEED = 5;  // Maximální rychlost míčku
const MIN_SPEED = 2;  // Minimální rychlost míčku
const MAX_SCORE = 10;  // Maximální dosažitelné skóre

class Game {
	constructor(id, username, id2, username2) {
		this.ball_vel = 0.5;  // Počáteční rychlost míčku
		this.id = uuid.v4();  // Generování unikátního ID instance hry
		this.player1 = id;  // ID prvního hráče
		this.player2 = id2;  // ID druhého hráče
		this.players = {};  // Objekt pro uchování informací o hráčích
		this.players[id] = { name: username.toString(), pos: 50, score: 0 };  // Přidání prvního hráče do objektu hráčů s jeho ID, jménem, počáteční pozicí a skóre 0
		this.players[id2] = { name: username2.toString(), pos: 50, score: 0 };  // Přidání druhého hráče do objektu hráčů s jeho ID, jménem, počáteční pozicí a skóre 0
		this.ball = [20, 50];  // Počáteční pozice míčku na hrací ploše
		this.ball_velocity = [MIN_SPEED, 0];  // Počáteční rychlost míčku
	}

	// Aktualizuje stav hry a vypočítá novou pozici a rychlost míčku
	update() {
		this.ball[0] += this.ball_velocity[0];  // Aktualizace polohy míčku v ose X podle aktuální rychlosti
		this.ball[1] += this.ball_velocity[1];  // Aktualizace polohy míčku v ose Y podle aktuální rychlosti

		// Detekce a zpracování kolize míčku s okrajem hrací plochy
		if (this.ball[0] >= 100) {
			this.players[this.player1].score++;  // Zvýšení skóre prvního hráče
			this.reset(1);  // Resetování hry po dosažení konce hrací plochy
		} else if (this.ball[0] <= 0) {
			this.players[this.player2].score++;  // Zvýšení skóre druhého hráče
			this.reset(2);  // Resetování hry po dosažení konce hrací plochy
		}

		// Odrážení míčku od horního a dolního okraje hrací plochy
		if (this.ball[1] >= 100) {
			this.ball_velocity[1] *= -1;  // Obrácení vertikální rychlosti míčku
			this.ball[1] = 99;  // Korekce pozice míčku na hranici hrací plochy
		} else if (this.ball[1] <= 0) {
			this.ball_velocity[1] *= -1;  // Obrácení vertikální rychlosti míčku
			this.ball[1] = 1;  // Korekce pozice míčku na hranici hrací plochy
		}

		// Detekce a zpracování kolize míčku s hráči
		if (
			this.ball[1] < this.players[this.player2].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player2].pos - 10 &&
			this.ball[0] > 94 &&
			this.ball[0] < 98
		) {
			this.ball[0] = 94;  // Korekce pozice míčku po kolizi s hráčem
			var relativeIntersectY =
				this.players[this.player2].pos - this.ball[1] - 1;  // Výpočet relativního průniku Y
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;  // Normalizace relativního průniku Y
			this.ball_velocity[0] = -(
				(1 - Math.abs(normalizedRelativeIntersectionY)) *
					(MAX_SPEED - MIN_SPEED) +
				MIN_SPEED
			);  // Výpočet nové horizontální rychlosti míčku
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;  // Nastavení nové vertikální rychlosti míčku
		} else if (
			this.ball[1] < this.players[this.player1].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player1].pos - 10 &&
			this.ball[0] < 6 &&
			this.ball[0] > 2
		) {
			this.ball[0] = 6;  // Korekce pozice míčku po kolizi s hráčem
			var relativeIntersectY =
				this.players[this.player1].pos - this.ball[1] - 1;  // Výpočet relativního průniku Y
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;  // Normalizace relativního průniku Y
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;  // Normalizace relativního průniku Y
			this.ball_velocity[0] =
				(1 - Math.abs(normalizedRelativeIntersectionY)) *
					(MAX_SPEED - MIN_SPEED) +
				MIN_SPEED;  // Výpočet nové horizontální rychlosti míčku
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;  // Nastavení nové vertikální rychlosti míčku
		}
	}

	reset(player) {
		if (player == 1) {
			this.ball = [60, 50];  // Nastavení nové pozice míčku pro prvního hráče
			this.ball_velocity = [-(MIN_SPEED - 1), 0];  // Nastavení nové rychlosti míčku pro prvního hráče
		} else {
			this.ball = [40, 50];  // Nastavení nové pozice míčku pro druhého hráče
			this.ball_velocity = [MIN_SPEED - 1, 0];  // Nastavení nové rychlosti míčku pro druhého hráče
		}
	}
}

module.exports = Game;  // Exportování třídy Game pro použití v jiných modulech
