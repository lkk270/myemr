from datetime import datetime
from dateutil import tz


class PostpaidType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.currency = 'EUR'
        self.scraper_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_url = None
        self.provider_name = None
        self.reseller_provider = None
        self.plan_name = None
        self.network_name = None
        self.is_lte = None
        self.is_5g = False 
        self.contract_length_months = 1
        # price related variables
        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.secondary_price = 0
        self.secondary_months = 0
        self.weighted_average_monthly_price = 0
        # usage related
        self.plan_data_mb = 0
        self.lte_data_mb = 0
        self.is_unlimited_talk = None
        self.is_unlimited_text = None
        self.minutes_all_net = None
        self.minutes_on_net = None
        self.sms_all_net = None
        self.talk_text_share = None
        self.downstream = 0
        self.throttle_speed = None
        self.tariff_quality_score = None
        # new fields
        self.plan_cashback = None
        self.porting_bonus = None
        self.monthly_price_no_discount = None
        self.is_triple_sim = None
        self.free_months = 0
        self.segment = 'standard'
        self.roaming_data_mb = 0 
        self.roaming_minutes = 0 
        self.minutes_international = 0
        self.roaming_sms = 0
        # used notes for tier 3 pricing
        self.notes = None

class BundleType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.provider_name = None
        self.reseller_provider = None
        self.network_name = None
        self.plan_name = None
        self.currency = 'EUR'
        self.scraper_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_url = None
        self.is_lte = None
        self.is_5g = False 
        self.contract_length_months = 1

        self.device_name = None
        self.device_storage = None

        self.onetime_charge = 0
        self.onetime_device = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.device_monthly_price = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.secondary_price = 0
        self.secondary_months = 0

        self.plan_data_mb = 0
        self.is_unlimited_talk = None
        self.is_unlimited_text = None
        self.minutes_all_net = None
        self.sms_all_net = None
        self.minutes_on_net = 0
        self.downstream = 0
        self.talk_text_share = 0
        self.throttle_speed = None
        self.tariff_quality_score = None

        # new fields
        self.plan_cashback = None
        self.porting_bonus = None
        self.installment_months = 24
        self.free_months = 0
        self.notes = None
        self.segment = 'standard'
        self.roaming_data_mb = 0 
        self.roaming_minutes = 0 
        self.minutes_international = 0
        self.roaming_sms = 0


class DSLType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.currency = 'EUR'
        self.scraper_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_url = None
        self.provider_name = None
        self.plan_name = None
        self.contract_length_months = 1
        self.internet_connection_type = None

        self.device_name = None
        self.device_monthly_price = 0
        self.device_brand = None

        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.shipping_cost = 0
        self.free_months = 0 #used by UKE germany CSV DSLs

        self.download_speed = 0
        self.upload_speed = 0 #used by UKE germany CSV DSLs
        self.data_cap = 0

        self.minutes_all_net = 0 #used by UKE germany CSV DSLs

        self.international_minutes_landline = 0 #used by UKE germany CSV DSLs
        self.is_mobile_5g = 0 #used by UKE germany CSV DSLs
        self.mobile_data_mb = 0 #used by UKE germany CSV DSLs
        self.minutes_all_net_mobile = 0 #used by UKE germany CSV DSLs
        self.minutes_on_net_mobile = 0 #used by UKE germany CSV DSLs
        self.sms_all_net_mobile = 0 #used by UKE germany CSV DSLs
        self.sms_on_net_mobile = 0 #used by UKE germany CSV DSLs
        self.roaming_minutes = 0 #used by UKE germany CSV DSLs
        self.roaming_data_mb = 0 #used by UKE germany CSV DSLs
        self.talk_text_share = None #used by UKE germany CSV DSLs

        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.social_media_apps_mobile = None
        self.data_social_media_mb_mobile = 0

        self.with_tv = None
        self.with_modem = None
        self.with_landline = None
        self.with_mobile = None
        self.notes = None


class DeviceTypeAmazon(object):
    def __init__(self):
        self.scraper_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.scraper_time = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime("%H:%M:%S")
        self.device_name = None
        self.device_brand = None
        self.device_storage = None
        self.device_color = None
        self.device_model = None
        self.device_sku = None
        self.out_of_stock = 0
        self.device_retail_price = None
        self.device_actual_price = None
        self.is_unlocked= None
        self.is_prime= None
        self.is_one_day_shipping = None
        self.shipping_cost = None
        self.review_score = None
        self.device_seller = None
        self.device_seller_score = None


class DeviceTypeCheck24(object):
    def __init__(self):
        self.source_url = None
        self.source_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_time = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime("%H:%M:%S")
        self.device_brand = None
        self.device_name = None
        self.device_color = None
        self.device_storage = None
        self.provider_name = None
        self.device_price = None
        self.stamp = None


class DeviceTypePromotion(object):
    def __init__(self):
        self.source_url = None
        self.api_url = None
        self.source_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_time = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime("%H:%M:%S")
        self.tariff_name = None
        self.tariff_network = None
        self.tariff_brand = None
        self.tariff_reseller = None
        self.plan_gb = None
        self.contract_length = None
        self.top_callout = None
        self.filter_data_gb = None
        self.filter_minutes = None
        self.filter_netzo2 = None
        self.filter_netztel = None
        self.filter_netzvod = None
        self.filter_contract =None
        self.api_sorting_backoffice_priority = None
        self.api_sorting_disabled_for_performance = None
        self.api_sorting_best_value_priority = None
        self.api_sorting_disabled_for_product_landingpage = None


class ScreenShotType(object):
    def __init__(self):
        self.start_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.end_date = datetime.now(tz=tz.gettz("Europe/Berlin")).strftime('%Y-%m-%d')
        self.source_url = None
        self.provider_name = None
        self.plan_name = None
        self.network_name = None
        self.average_price = None
        self.screenshot_name = None