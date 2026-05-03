import hid

KEYWORDS = ['madlions', 'mad', 'shezhen', 'yizhita']

def find_keyboards():
    print("--- Szukam podłączonych urządzeń / Searching for connected devices ---")
    
    all_devices = hid.enumerate()
    found_matches = []
    
    for d in all_devices:
        man = (d.get('manufacturer_string') or "").lower()
        prod = (d.get('product_string') or "").lower()
        
        is_match = any(k in man or k in prod for k in KEYWORDS)
        
        if is_match:
            found_matches.append(d)
            print(f"Znaleziono/Found: {d.get('product_string')} ({d.get('manufacturer_string')})")
            print(f" -> VID: 0x{d['vendor_id']:04X}")
            print(f" -> PID: 0x{d['product_id']:04X}")
            print(f" -> Interfejs/Interface: {d['interface_number']}")
            print("-" * 40)

    if not found_matches:
        print("\n[!] Nie znaleziono klawiatury MADLIONS. Wypisuję wszystko:")
        print("[!] No MADLIONS keyboard found. Listing everything:\n")
        for d in all_devices:
            p = d.get('product_string')
            if p:
                print(f"[{d.get('manufacturer_string', '???')}] {p} -> VID: 0x{d['vendor_id']:04X}, PID: 0x{d['product_id']:04X}")
    else:
        print("\n" + "="*50)
        print("PODSUMOWANIE / SUMMARY")
        print("="*50)
        
        unique_pairs = set((d['vendor_id'], d['product_id']) for d in found_matches)
        
        if len(unique_pairs) == 1:
            vid, pid = list(unique_pairs)[0]
            print(f"Twoja klawiatura ma najprawdopodobniej te dane:")
            print(f"Your keyboard most likely uses these values:")
            print(f"\n   VID: 0x{vid:04X}")
            print(f"   PID: 0x{pid:04X}")
            print(f"\nW pliku rgb_engine.py spróbuj najpierw interfejsu (interface) 1 lub 2.")
            print(f"In rgb_engine.py, try interface 1 or 2 first.")
        else:
            print("Wykryto kilka różnych urządzeń MAD. Sprawdź listę powyżej.")
            print("Detected several different MAD devices. Check the list above.")
        
        print("="*50)

    input("\nNaciśnij Enter, aby zamknąć / Press Enter to close...")

if __name__ == "__main__":
    find_keyboards()
