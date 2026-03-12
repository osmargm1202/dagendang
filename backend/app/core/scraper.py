import httpx
from bs4 import BeautifulSoup
from datetime import date
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def scrape_bancentral_rates():
    """
    Scrapes the official exchange rates from Banco Central de la RD.
    """
    url = "https://bancentral.gov.do/"
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            rates = {}
            
            h5_tags = soup.find_all("h5")
            for h5 in h5_tags:
                text = h5.get_text(strip=True)
                if re.match(r"^\d+\.\d+$", text):
                    prev = h5.find_previous_sibling("small")
                    if prev:
                        label = prev.get_text(strip=True).lower()
                        if label == 'compra':
                            if 'usd_buy' not in rates: rates['usd_buy'] = float(text)
                            elif 'eur_buy' not in rates: rates['eur_buy'] = float(text)
                        elif label == 'venta':
                            if 'usd_sell' not in rates: rates['usd_sell'] = float(text)
                            elif 'eur_sell' not in rates: rates['eur_sell'] = float(text)
            
            if rates:
                rates['date'] = date.today()
                return rates
            return None
    except Exception as e:
        logger.error(f"Error scraping Banco Central: {str(e)}")
        return None

async def scrape_micm_fuel_prices():
    """
    Scrapes fuel prices from MICM.
    """
    url = "https://micm.gob.do/"
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
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
                p_text = p.get_text(strip=True).lower()
                for key, db_key in mappings.items():
                    if key in p_text and db_key not in prices:
                        parent = p.find_parent("div")
                        if parent:
                            # The text usually looks like "$290.10Gasolina Premium"
                            parent_text = parent.get_text(strip=True)
                            match = re.search(r"\$(\d+\.\d+|\d+,\d+)", parent_text)
                            if match:
                                val = float(match.group(1).replace(',', '.'))
                                prices[db_key] = val
            
            if prices:
                prices['date'] = date.today()
                return prices
            return None
    except Exception as e:
        logger.error(f"Error scraping MICM: {str(e)}")
        return None
