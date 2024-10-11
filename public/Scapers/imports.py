# %load imports
import re
import time
import math
import json
import copy
import pprint
import random
import pickle
import requests
import itertools
from itertools import islice
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
CHROME_DRIVER = './chromedriver' #assumes that your chrome driver is in the same directory as this imports.py file and the working jupytyer notebook file
FIREFOX_DRIVER = './geckodriver' #""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions


def setup_driver(headless=True, driver_type=CHROME_DRIVER) -> webdriver:
    if 'chrome' in driver_type.lower():
        options = ChromeOptions()
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')
        if headless:
            options.add_argument('-headless')
        driver = webdriver.Chrome(executable_path=driver_type, chrome_options=options)
    else:
        options = FirefoxOptions()
        if headless:
            options.add_argument('-headless')
        driver = webdriver.Firefox(executable_path=driver_type, options=options)
    return driver


def parse_weighted_average_monthly_price(free_months, promo_months, promo_price, monthly_price, actual_price, contract_length_months):
    if contract_length_months == 1 and free_months == 0:
        weighted_average_monthly_price = monthly_price
    elif free_months > 0 and contract_length_months == 1:
        weighted_average_monthly_price = round(((12 - free_months) * monthly_price)/12, 2) #uses 12 month long duration
    elif free_months > 0 and contract_length_months > 1:
         weighted_average_monthly_price = round(((contract_length_months - free_months) * monthly_price)/contract_length_months, 2)
    elif promo_months == 0 or promo_months == contract_length_months:
        weighted_average_monthly_price = monthly_price
    elif promo_months > contract_length_months > 0:
        if contract_length_months == 1 and promo_months > 1:
            weighted_average_monthly_price = round(((promo_months * promo_price) + (actual_price * (12 - promo_months)))/12, 2) #uses 12 month long duration
        else:
            weighted_average_monthly_price = round(((promo_months * promo_price) + (actual_price * (contract_length_months - promo_months)))/contract_length_months, 2)
    elif contract_length_months > promo_months > 0:
        total_cost = promo_months*promo_price + (actual_price*(contract_length_months-promo_months))
        weighted_average_monthly_price = round(total_cost/contract_length_months,2)
    return weighted_average_monthly_price


def parse_two_year_cost(free_months, promo_price, promo_months, secondary_price, secondary_months, actual_price, upfront_charge):
    promo = promo_months * promo_price
    secondary = secondary_price * secondary_months
    rest = (24-free_months-promo_months-secondary_months) * actual_price
    two_year_cost = round(promo + secondary + rest + upfront_charge, 2)
    return two_year_cost


def get_roaming_fields(**kwargs):
    """
    Used for germany scrapers
    """
    roaming_data_mb = 0
    roaming_minutes = 0
    roaming_sms = 0
    note = None
    if kwargs['roaming_included'] is True:
        roaming_data_mb = kwargs['plan_data_mb']
        roaming_minutes = kwargs['minutes_all_net']
        roaming_sms = kwargs['sms_all_net']
        note = 'Roaming fields are for EU only;'
    return roaming_data_mb, roaming_minutes, roaming_sms, note


def check_for_plans(plans):
    if len(plans) == 0:
        raise ValueError('No plans!')


def parse_speed_name(download_speed):
    if download_speed == 44444:
        ret = 'Max 4G Speed'
    elif  download_speed == 55555:
        ret = 'Max 5G Speed'
    elif download_speed < 1024:
        ret = str(download_speed) + ' Mb/s'
    else:
        ret = str(round(download_speed/1024, 2)) + ' Gb/s'
    return ret


def is_good_device(device_name):
    bad_words = {'ipad', 'macbook', 'airpods', 'tv', 
               'lenovo', 'ps5', 'matebook', 'tab', 'sony', 'tuya', 
               'dell', 'easyplus', 'tuf', 'rog', 'lg', 'mifi', 
               'protection', 'matepad', 'zte', 'vivobook',
               'projector', 'speaker', 'cpe', 'pack', 'case',
               'cable', 'airtag', 'wallet', 'adapter', 'charger',
               'watch', 'zephyrus', 'laptop', 'magsafe', '4k', 'uled'}
    device_name = device_name.lower()
    if any(word in device_name for word in bad_words):
        return False
    else:
        return True

def add_galaxy_to_device_name(device_name_param, device_brand_param):
    device_name = device_name_param.lower()
    device_brand = device_brand_param.lower()
    ret = device_name.title()
    if 'samsung' == device_brand and 'galaxy' not in device_name:
        if 'samsung' in device_name:
            ret = 'Samsung Galaxy ' + device_name.split('samsung')[1].strip()
        else:
            ret = 'Samsung Galaxy ' + device_name
    return ret


def get_soup(url, firefox_driver=False):
    try:
        if firefox_driver is False:
            driver = setup_driver()
        elif firefox_driver is True:
            driver = setup_driver(driver_type=FIREFOX_DRIVER)
        driver.set_window_size(1400, 1400)
        driver.get(url)
        time.sleep(10)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()
    except Exception as e:
        driver.quit()   
        raise e
    return soup


def get_soups(urls, firefox_driver=False):
    ret = {}
    try:
        if firefox_driver is False:
            driver = setup_driver()
        elif firefox_driver is True:
            driver = setup_driver(driver_type=FIREFOX_DRIVER)
        driver.set_window_size(1400, 1400)
        for url in urls:
            if type(url) == tuple:
                url = url[0]
            driver.get(url)
            time.sleep(10)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            ret[url] = soup
        driver.quit()
    except Exception as e:
        driver.quit()   
        raise e
    return ret


def get_soup_d(url, driver):
    try:
        driver.get(url)
        time.sleep(10)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
    except Exception as e:
        driver.quit()   
        raise e
    return soup


def has_number(string_input):
    return bool(re.search(r'\d', string_input))


def convert_to_clean_string(container, lower=True):
    ret = ' '.join(container.text.split()).replace('\u200b', '').replace(u'\u200B', '').strip()
    if lower is True:
        ret = ret.lower()
    return ret


def parse_device_storage(device_storage_text):
    unknown_strs = ['unbekannt']
    if 'gb' in device_storage_text:
        gb_split = device_storage_text.split('gb')[0].strip()
        if gb_split == '1.000' or gb_split == '1000':
            ret = 1024
        else:
            ret = int(device_storage_text.split('gb')[0])
    elif 'tb' in device_storage_text:
        ret = int(device_storage_text.split('tb')[0]) * 1024
    elif any(u == device_storage_text for u in unknown_strs):
        ret = None
    return ret


def check_fields(fields_to_check, field_limits_dict):
    """
    sanity checker to make sure some fields that require a 0 initialization isn't applied to every plan
    """
    for field, value in fields_to_check.items():
        if value > field_limits_dict[field]:
            raise ValueError(f"Too many plans with no {field.split('_')[1]}")


def ensure_exclusive_vat(soup):
    accepted_strs = ['all the prices are exclusive of vat', 'all stated prices are exclusive of 10% vat']
    soup_text = convert_to_clean_string(soup)
    if all(s not in soup_text for s in accepted_strs):
        raise ValueError("VAT policy might've changed")


def ensure_inclusive_vat(soup):
    accepted_strs = ['all prices are vat inclusive', 
                     'all prices are inclusive of vat', 
                     '10% vat inclusive',
                     'prices mentioned are vat inclusive',
                     '( inclusive of 10% vat)']
    soup_text = convert_to_clean_string(soup)
    if all(s not in soup_text for s in accepted_strs):
        raise ValueError("VAT policy might've changed")

    
def visit_and_bypass_cookies(driver, url, pkl_file):
    """
        Use .pkl file for a website to accept cookies when 'click accept cookies' is obscured
        :params driver: webdriver instance
        :params url: visiting url
        :params pkl_file: name and extention of file to load (eg: "mediamarkt.pkl")
        """
    driver.get(url)
    time.sleep(5)
   
    #bypass cookies to prevent obscurity
    #load pkl cookies from arch.scrapers.cookies
    pkl_file = f"./arch/scrapers/cookies/{pkl_file}"
    
    #add cookie to the driver instance
    with open(pkl_file, 'rb') as cookie_file:
        cookies = pickle.load(cookie_file)
        print("Cookies Loaded From Pickle File")
        driver.delete_all_cookies()
        time.sleep(3)
        
        for cookie in cookies:
            driver.add_cookie(cookie)
        time.sleep(3)
        print("Accepted Cookies")
    
    driver.get(url)  #need to revisit the site after adding the cookie
    time.sleep(5)


def ensure_no_missing_fields(container, possible_new_fields):
    container_text = convert_to_clean_string(container)
    for field in possible_new_fields:
        if field in container_text:
            raise ValueError(f"'{field}' was found in table_text")

def set_to_zero_oman(plan_text, details):
    ret = {}
    min_international_strs = ['int’l minutes', 'gcc min', 'international min', 'flexi', 'int']
    if 'hour' not in plan_text and 'min' not in plan_text and 'minutes_all_net' not in details and 'minutes_international' not in details and 'minutes_on_net' not in details:
        ret['minutes_all_net'] = 0
        ret['minutes_international'] = 0
        ret['minutes_on_net'] = 0
    if 'roam' not in plan_text:
        if 'calls in gcc' not in plan_text and 'roaming_minutes' not in details:
            ret['roaming_minutes'] = 0
        if 'sms and calls' not in plan_text and 'roaming_sms' not in details:
            ret['roaming_sms'] = 0
        if 'data and calls' not in plan_text and 'data, calls and sms' not in plan_text and 'data in gcc' not in plan_text and 'roaming data' not in plan_text and 'roaming_data_mb' not in details:
            ret['roaming_data_mb'] = 0
    if 'social' not in plan_text and 'social_media_apps' not in details and 'data_social_media_mb' not in details:
        ret['social_media_apps'] = None
        ret['data_social_media_mb'] = 0
    if('sms' not in plan_text and 'sms_all_net' not in details and 'sms_international' not in details) or (plan_text.count('sms') == 1 and 'sms charges' in plan_text) :
        ret['sms_all_net'] = 0
        ret['sms_international'] = 0
    if all(s not in plan_text for s in min_international_strs) and 'minutes_international' not in details:
        ret['minutes_international'] = 0
    return ret


def parse_validity(validity_text):
    if 'hours' in validity_text:
        validity_period_days = int(validity_text.replace('hours', '').replace('hour', '')[0])/24
    elif 'day' in validity_text:
        validity_period_days = int(validity_text.replace('days', '').replace('day', ''))
    elif 'unlimited' in validity_text:
        validity_period_days = 9999
    elif 'week' in validity_text:
        validity_period_days = int(validity_text.replace('weeks', '').replace('week', ''))*7
    return validity_period_days
        

def convert_data_mb_oman(text):
    if text == 'unlimited':
        ret = 999999
    elif text == 'na':
        ret = 0
    elif 'unlimited' not in text and '+' not in text:
        gb_count = text.count('gb')
        mb_count = text.count('mb')
        tb_count = text.count('tb')
        if tb_count == 1 and gb_count == 0 and mb_count == 0:
            ret = float(text.split('tb')[0]) * 1024 * 1024
        elif gb_count == 1 and tb_count == 0 and mb_count == 0:
            ret = float(text.split('gb')[0]) * 1024
        elif mb_count == 1 and tb_count == 0 and gb_count == 0:
            ret = float(text.split('mb')[0])
    return ret