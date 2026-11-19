# Slabikář – Angular 22

Výuková aplikace pro první třídu: písmena, slabiky, první slova, dvě metody čtení a ukládání pokroku.

## Spuštění

Vyžaduje Node.js kompatibilní s Angular 22 a npm.

```bash
npm install
npm start
```

Otevřete adresu, kterou vypíše Angular CLI (obvykle http://localhost:4200).

## Technické principy

- Standalone komponenta, `OnPush`, `provideZonelessChangeDetection()`
- Signals: `signal`, `computed`
- `HttpClient` načítá `/lessons.json`
- RxJS `catchError` + `toSignal` pro asynchronní stav
- Dependency injection přes `inject()`
- Strict TypeScript a strict Angular templates
- `localStorage` pro výsledky a volbu metody
- Lokální české MP3 soubory v `public/audio/`, bez závislosti na hlasových balíčcích systému

## Omezení první verze

Výukové sady jsou zatím malé a pořadí písmen není sladěno s konkrétním školním slabikářem. Genetická metoda používá rozklad slov na písmena a slabiková metoda rozklad na slabiky. Nahrávání hlasu, vyhodnocování skutečné výslovnosti, rodičovské účty ani cloudové ukládání zatím nejsou součástí MVP. První MP3 jsou automaticky vytvořené syntetickým českým hlasem eSpeak; pro výuku hlásek doporučujeme nahradit je pedagogicky ověřenými nahrávkami. Odpovědi se ukládají jen pro cvičení První slova.

## Rozšíření

Výukový obsah upravíte v `public/lessons.json`; další komponenty lze vyčlenit do `features/` při rozšíření projektu.

## České MP3 nahrávky

Nahrávky jsou v `public/audio/` a jejich mapování v `public/audio/manifest.json`.
Soubor lze nahradit kvalitnější nahrávkou při zachování názvu, nebo upravit cestu v manifestu.
Tlačítka v aplikaci používají `LearningService.speak()` a přehrávají MP3 přes HTMLAudioElement.
Zvuk se spustí až po kliknutí uživatele. Neznámý výraz se nečte anglicky.
Pro výuku českých hlásek a slabik je nutná kontrola výslovnosti dospělým; syntetický hlas nemusí izolované hlásky vyslovit správně.
