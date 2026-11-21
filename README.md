Slabikář – Angular 22
Výuková aplikace pro děti v první třídě základní školy. Pomáhá procvičovat písmena, slabiky a první slova dvěma metodami čtení. Průběžně zaznamenává pokrok a umožňuje vracet se k problematickým slovíčkům.
Funkce aplikace
- Písmenka – poznávání písmen s obrázky a možností poslechu.
- Slabiky – čtení a poslech slabik.
- První slova – výběr správného rozdělení slova na slabiky nebo hlásky.
- Dvě metody čtení – slabiková a genetická; metodu lze přepínat.
- Navigace mezi slovy – předchozí a další slovo; na prvním slově je návrat zpět deaktivovaný.
- Hvězdičky – za správně vyřešené slovo se hvězdička uděluje pouze jednou.
- Můj pokrok – počet hvězdiček, odpovědí a procentuální úspěšnost.
- Problematická slovíčka – evidence slov, ve kterých dítě chybuje, počtu chyb a série správných odpovědí (correctStreak). Po třech správných odpovědích za sebou se slovo ze seznamu odstraní. Seznam lze procvičovat také samostatně.
- České MP3 nahrávky – přehrávání lokálních zvukových souborů bez závislosti na systémovém hlasu nebo připojení k internetu.
Požadavky
- Node.js ve verzi kompatibilní s Angular 22
- npm
Spuštění ve vývojovém režimu
npm install
npm start
Aplikace se otevře na adrese vypsané Angular CLI, obvykle http://localhost:4200.
Testování a pokrytí kódu
Projekt používá Jasmine + Karma pro unit testy a testy komponent.
# Run tests
npm test

# Run tests and generate a coverage report
npm test -- --code-coverage
Report pokrytí kódu se obvykle vytvoří ve složce coverage/. Sledujte zejména pokrytí větví (Branches), protože služby obsahují podmínky pro chyby, správné odpovědi a odstraňování zvládnutých slov.

Při testování ProblemWordsService lze pomocí Jasmine spyOn() nahradit čtení a zápis do localStorage. Samotná testovaná služba zůstává skutečná. Pro zpracování čekajících Angular efektů lze v testech použít TestBed.tick().
Spuštění v Electronu (offline)
Projekt obsahuje integraci s Electronem pro spuštění jako desktopová aplikace.
npm run electron:offline
Tento příkaz sestaví Angular aplikaci a spustí ji v Electronu z lokálních souborů. Nevytváří sám o sobě instalační .exe; zabalení do instalačního programu je samostatný krok.
