class Pong {
	// Inicializuje plátno (canvas)
	constructor(username, player, opp_username, ball, status) {
		//$('body').css({ overflow: 'hidden', position: 'fixed' });
		this.canvas = document.getElementById('drawing-canvas');
		this.ctx = document.getElementById('drawing-canvas').getContext('2d');
		this.game = {
			player: player, // Určuje, zda je hráč 1 nebo 2
			self: { username: username, score: 0, pos: 50 }, // Informace o hráči (uživatelské jméno, skóre, pozice)
			opp: { username: opp_username, score: 0, pos: 50 }, // Informace o soupeři (uživatelské jméno, skóre, pozice)
			ball: ball // Počáteční pozice míčku
		};
		this.player_velocity = 3; // Rychlost hráče
	}

	// Vymaže plátno - připraví ho pro nový snímek
	clear() {
		this.ctx.fillStyle = 'black'; // Nastaví barvu výplně na černou
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Vymaže plátno
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Vyplní plátno černou barvou
	}

	// Vykreslí další snímek na plátno
	update() {
		this.clear(); // Vymaže předchozí snímek
		this.ctx.font = '32px monospace'; // Nastaví písmo
		this.ctx.textAlign = 'center'; // Nastaví zarovnání textu na střed

		// Vykreslí skóre a pozice hráče a soupeře
		if (this.game.player == 1) {
			this.ctx.fillStyle = '#0000ff'; // Modrá barva pro hráče
			this.ctx.fillText(
				`${this.game.self.username}: ${this.game.self.score}`,
				this.canvas.width / 4,
				50
			);
			this.ctx.fillRect(
				0.05 * this.canvas.width,
				((this.game.self.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
			this.ctx.fillStyle = '#ff0000'; // Červená barva pro soupeře
			this.ctx.fillText(
				`${this.game.opp.username}: ${this.game.opp.score}`,
				3 * (this.canvas.width / 4),
				50
			);
			this.ctx.fillRect(
				0.95 * this.canvas.width,
				((this.game.opp.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
		} else {
			this.ctx.fillStyle = '#ff0000'; // Červená barva pro soupeře
			this.ctx.fillText(
				`${this.game.opp.username}: ${this.game.opp.score}`,
				this.canvas.width / 4,
				50
			);
			this.ctx.fillRect(
				0.05 * this.canvas.width,
				((this.game.opp.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);

			this.ctx.fillStyle = '#0000ff'; // Modrá barva pro hráče
			this.ctx.fillText(
				`${this.game.self.username}: ${this.game.self.score}`,
				3 * (this.canvas.width / 4),
				50
			);
			this.ctx.fillRect(
				0.95 * this.canvas.width,
				((this.game.self.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
		}

		// Vykreslí míček
		this.ctx.fillStyle = '#ffffff'; // Bílá barva pro míček
		this.ctx.fillRect(
			(this.game.ball[0] / 100) * this.canvas.width,
			(this.game.ball[1] / 100) * this.canvas.height,
			0.02 * this.canvas.height,
			0.02 * this.canvas.height
		);
	}

	// Ovládání klávesnicí
	upSelf() {
		if (this.game.self.pos > 10) this.game.self.pos -= 3; // Pohyb hráče nahoru
	}

	downSelf() {
		if (this.game.self.pos < 90) this.game.self.pos += 3; // Pohyb hráče dolů
	}

	upOpp() {
		if (this.game.opp.pos > 10) this.game.opp.pos -= 3; // Pohyb soupeře nahoru
	}

	downOpp() {
		if (this.game.opp.pos < 90) this.game.opp.pos += 3; // Pohyb soupeře dolů
	}
}
