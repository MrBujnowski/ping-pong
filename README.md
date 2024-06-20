Ping Pong Multiplayer Game

Instalace:
1. git clone https://github.com/MrBujnowski/ping-pong
   cd pong-game
   
2. npm install

3. node server.js

4. Hra bude spuštěna na localhost:80

Návod k použití
Registrace a přihlášení

Po otevření aplikace se každý nový uživatel automaticky připojí a zobrazí se jim hlavní obrazovka.
Uživatel si může zvolit své uživatelské jméno, které musí obsahovat minimálně 3 znaky a může obsahovat písmena, číslice a znaky _.-
Hra

Hra začne, jakmile jsou ve frontě dva přihlášení hráči.
Každý hráč ovládá svou paletku pomocí šipek nahoru a dolů.
Cílem je odpálit míček za paletku soupeře, aby získal bod.

Odpojení a opětovné připojení
Pokud se hráč odpojí během hry, hra se ukončí a ostatní hráč je o tom informován.
Uživatel se může kdykoli opětovně připojit, zvolit si nové uživatelské jméno a pokračovat v hraní.
