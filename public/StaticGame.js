// Maximální a minimální rychlost míčku
const MAX_SPEED = 1.5;
const MIN_SPEED = 1;
// Maximální skóre pro vítězství
const MAX_SCORE = 10;

class Game {
	// Konstruktor inicializuje hru
	constructor(id, username, id2, username2) {
		this.ball_vel = 0.5; // Počáteční rychlost míčku
		this.player1 = id; // ID prvního hráče
		this.player2 = id2; // ID druhého hráče
		this.players = {}; // Objekt pro uložení hráčů
		this.players[id] = { name: username.toString(), pos: 50, score: 0 }; // Inicializace prvního hráče
		this.players[id2] = { name: username2.toString(), pos: 50, score: 0 }; // Inicializace druhého hráče
		this.ball = [20, 50]; // Počáteční pozice míčku
		this.ball_velocity = [MIN_SPEED, 0]; // Počáteční rychlost míčku
	}

	// Aktualizuje stav hry a vypočítá pozici a rychlost míčku
	update() {
		// Aktualizace pozice míčku na základě jeho rychlosti
		this.ball[0] += this.ball_velocity[0];
		this.ball[1] += this.ball_velocity[1];
		
		// Kontrola, zda míček prošel přes hranici hracího pole (přičtení bodu)
		if (this.ball[0] >= 100) {
			this.players[this.player1].score++;
			this.reset(1);
		} else if (this.ball[0] <= 0) {
			this.players[this.player2].score++;
			this.reset(2);
		}

		// Kontrola srážky míčku s horní a dolní hranicí hracího pole
		if (this.ball[1] >= 100) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 99;
		} else if (this.ball[1] <= 0) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 1;
		}

		// Kontrola srážky míčku s pálkou druhého hráče
		if (
			this.ball[1] < this.players[this.player2].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player2].pos - 10 &&
			this.ball[0] > 94 &&
			this.ball[0] < 98
		) {
			this.ball[0] = 94;
			var relativeIntersectY =
				this.players[this.player2].pos - this.ball[1] - 1;
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;
			this.ball_velocity[0] = -(
				(1 - Math.abs(normalizedRelativeIntersectionY)) *
				(MAX_SPEED - MIN_SPEED) +
				MIN_SPEED
			);
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;
		// Kontrola srážky míčku s pálkou prvního hráče
		} else if (
			this.ball[1] < this.players[this.player1].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player1].pos - 10 &&
			this.ball[0] < 6 &&
			this.ball[0] > 2
		) {
			this.ball[0] = 6;
			var relativeIntersectY =
				this.players[this.player1].pos - this.ball[1] - 1;
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;
			this.ball_velocity[0] =
				(1 - Math.abs(normalizedRelativeIntersectionY)) *
				(MAX_SPEED - MIN_SPEED) +
				MIN_SPEED;
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;
		}
	}

	// Resetuje pozici a rychlost míčku po dosažení bodu
	reset(player) {
		if (player == 1) {
			this.ball = [60, 50]; // Nová pozice míčku
			this.ball_velocity = [-MIN_SPEED / 3, 0]; // Nová rychlost míčku
		} else {
			this.ball = [40, 50]; // Nová pozice míčku
			this.ball_velocity = [MIN_SPEED / 3, 0]; // Nová rychlost míčku
		}
	}
}
