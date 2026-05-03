# Panel RGB dla MADLIONS MAD 68 Pro

[Click here for the English version (README.md)](README.md)

Ten projekt to autorskie narzędzie z interfejsem webowym oraz silnikiem w Pythonie, służące do sterowania podświetleniem RGB w klawiaturze **MADLIONS MAD 68 Pro** (i potencjalnie innych kompatybilnych modelach 68-klawiszowych). Pozwala on pominąć standardowe oprogramowanie i daje pełną kontrolę nad animacjami poprzez nowoczesny panel w przeglądarce.

![MAD 68 RGB Panel](panel.png)

⚠️ **Bezpieczeństwo**: Ten program **nie modyfikuje** w żaden sposób oprogramowania układowego (firmware) klawiatury. Wykorzystuje on wbudowany tryb oświetlenia "Customization" (Custom) i po prostu wysyła do niej polecenia pokolorowania danych przycisków na odpowiednie kolory. Program nie ma prawa uszkodzić sprzętu. Szansa na to wynosi 0%, o ile zachowuje się zdrowy rozsądek przy ustawianiu parametrów wyświetlania animacji. 
*Wskazówka: Zalecamy ustawienie parametru "FPS" na poziomie **8-10** i unikanie maksymalnych prędkości animacji, aby zapewnić najwyższą płynność i stabilność.*

## 🚀 Funkcje
- **Sterowanie w czasie rzeczywistym**: Zmiana animacji, kolorów i parametrów natychmiastowo przez WebSockets.
- **Obsługa gradientów**: Możliwość definiowania własnych sekwencji kolorów (do 6 slotów) dla większości animacji.
- **Silnik animacji**: Modularna architektura – animacje to proste pliki JSON z osadzonym kodem Python.
- **Nowoczesne UI**: Panel w stylu dark-mode z płynnymi animacjami.

---

## 🛠️ Wymagania
- **Node.js**: Wersja 22+ (testowane na v22.20.0)
- **Python**: Wersja 3.13+ (testowane na 3.13.13)
- **Klawiatura**: MADLIONS MAD 68 Pro (lub inne modele o tym samym układzie)

---

## 📦 Instalacja

1. **Pobierz/Sklonuj** to repozytorium na swój komputer.
2. **Zainstaluj zależności Node.js**:
   Otwórz terminal w folderze projektu i wpisz:
   ```bash
   npm install
   ```
3. **Zainstaluj zależności Pythona**:
   Potrzebujesz biblioteki `hidapi` do komunikacji ze sprzętem:
   ```bash
   pip install hidapi
   ```

---

## 🚦 Jak uruchomić

1. Podłącz klawiaturę kablem USB.
2. Kliknij dwukrotnie plik `start.bat` w głównym folderze.
3. Otwórz przeglądarkę i wejdź pod adres: `http://localhost:3333`

---

## ⚙️ Konfiguracja (VID/PID)

Jeśli Twoja klawiatura nie jest wykrywana, najprawdopodobniej ma inną rewizję i konieczna będzie aktualizacja numerów **Vendor ID (VID)** oraz **Product ID (PID)**.

### [Opcja A - Zalecana] Użyj skryptu wyszukującego
W systemie Windows jedno urządzenie może pojawiać się wielokrotnie pod różnymi nazwami, co utrudnia znalezienie właściwego. Przygotowaliśmy prosty skrypt, który rozwiąże ten problem:
1. Wejdź do folderu `engine/`.
2. Uruchom plik `find_my_keyboard.py` (klikając na niego dwukrotnie).
3. Pojawi się czarne okienko terminala z listą wykrytych VID i PID dla Twojej klawiatury.
4. Zapisz znalezione `0x...` wartości.

### [Opcja B - Alternatywna] Menedżer Urządzeń Windows
1. Otwórz **Menedżer Urządzeń**.
2. Znajdź klawiaturę w sekcji "Urządzenia do interfejsu człowieczego" (HID).
3. Prawy przycisk myszy -> **Właściwości** -> zakładka **Szczegóły**.
4. Z listy wybierz **Identyfikatory sprzętu**. Zobaczysz kod np. `VID_373B&PID_10D4`.

### Jak wpisać to do projektu:
1. Otwórz plik `engine/rgb_engine.py` (np. w Notatniku).
2. Znajdź linię `class HIDController:` i zmień domyślne wartości:
   ```python
   def __init__(self, vid=0x373B, pid=0x10D4, interface=1):
   ```
   *(Podmień `0x373B` i `0x10D4` na wartości uzyskane ze skryptu)*

---

## 🎨 Dodawanie własnych animacji

Animacje znajdują się w folderze `animations/`. Aby dodać nową, stwórz plik `.json`.

### Struktura pliku JSON:
- `id`: Unikalny identyfikator.
- `name`: Nazwa widoczna w panelu.
- `supports_gradient`: `true` jeśli animacja ma obsługiwać zakładkę Gradient.
- `params`: Definicje suwaków i przełączników dla UI.
- `code`: Logika animacji w języku Python.

### Logika (Python):
Sekcja `code` jest wykonywana w każdej klatce animacji. Masz dostęp do:
- `matrix`: Bytearray reprezentujący stan RGB (3 bajty na klawisz).
- `t`: Aktualny czas (w sekundach).
- `params`: Słownik z wartościami suwaków z panelu.
- `colorsys`: Biblioteka do konwersji HSV -> RGB.
- `math`: Standardowe funkcje matematyczne.

---

## 🛡️ Licencja
Projekt jest udostępniany na licencji **GNU General Public License v3.0**. Oznacza to, że możesz go dowolnie używać, modyfikować i udostępniać, ale każda praca pochodna musi pozostać otwarta (open-source) na tej samej licencji. Komercyjna sprzedaż tego kodu jest zabroniona.
