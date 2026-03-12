import httpx
from bs4 import BeautifulSoup
import re

def parse_bcrd():
    url = "https://bancentral.gov.do/"
    try:
        response = httpx.get(url, timeout=10.0, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        rates = {}
        # Find all h5 tags containing numbers
        h5_tags = soup.find_all("h5")
        for h5 in h5_tags:
            text = h5.get_text(strip=True)
            if re.match(r"^\d+\.\d+$", text):
                # The previous small element tells us if it's compra or venta
                prev = h5.find_previous_sibling("small")
                if prev:
                    label = prev.get_text(strip=True).lower()
                    if label == 'compra':
                        if 'usd_buy' not in rates: rates['usd_buy'] = float(text)
                        elif 'eur_buy' not in rates: rates['eur_buy'] = float(text)
                    elif label == 'venta':
                        if 'usd_sell' not in rates: rates['usd_sell'] = float(text)
                        elif 'eur_sell' not in rates: rates['eur_sell'] = float(text)
                    
        print("BCRD Results:", rates)
    except Exception as e:
        print("Error BCRD:", e)

def parse_micm():
    url = "https://micm.gob.do/"
    try:
        response = httpx.get(url, timeout=10.0, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        prices = {}
        mappings = {
            "gasolina premium": "gasoline_premium",
            "gasolina regular": "gasoline_regular",
            "gasoil óptimo": "diesel_optimum",
            "gasoil regular": "diesel_regular",
            "gas licuado de": "glp",
            "gas natural": "gas_natural"
        }
        
        for p in soup.find_all("p"):
            text = p.get_text(strip=True).lower()
            for key, db_key in mappings.items():
                if key in text and db_key not in prices:
                    # Look for the next p tag
                    next_p = p.find_next_sibling("p")
                    if next_p:
                        price_text = next_p.get_text(strip=True)
                        match = re.search(r"(\d+\.\d+|\d+,\d+)", price_text)
                        if match:
                            val = float(match.group(1).replace(',', '.'))
                            prices[db_key] = val
        
        print("MICM Results:", prices)
    except Exception as e:
        print("Error MICM:", e)

if __name__ == "__main__":
    parse_bcrd()
    parse_micm()
