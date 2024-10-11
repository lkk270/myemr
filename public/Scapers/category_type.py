class PostpaidType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.provider_name = None
        self.network_name = None
        self.currency = None
        self.scraper_date = datetime.today()
        self.source_url = None
        self.plan_name = None
        self.is_lte = True
        self.is_5g = None
        self.is_dongle = False
        self.contract_length_months = 1
        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.plan_data_mb = 0
        self.minutes_all_net = 0
        self.minutes_on_net = 0
        self.sms_all_net = 0
        self.sms_on_net = 0
        self.is_unlimited_talk = None
        self.is_unlimited_text = None
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.included_subscriptions = None
        self.free_months = 0
        self.roaming_data_mb = 0 
        self.roaming_minutes = 0 
        self.minutes_international = 0
        self.sms_international = 0
        self.notes = None
        self.segment = 'standard'        


class BundleType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.provider_name = None
        self.network_name = None
        self.currency = None
        self.scraper_date = datetime.today()
        self.source_url = None
        self.plan_name = None
        self.is_lte = None
        self.is_5g = None
        self.contract_length_months = 1
        self.device_name = None
        self.device_storage = None
        self.onetime_charge = 0
        self.onetime_device = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.plan_data_mb = 0
        self.is_unlimited_talk = None
        self.is_unlimited_text = None
        self.roaming_data_mb = 0 
        self.roaming_minutes = 0 
        self.minutes_international = 0
        self.sms_international = 0
        self.notes = None

class DSLType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.provider_name = None
        self.currency = None
        self.scraper_date = datetime.today()
        self.source_url = None
        self.plan_name = None

        self.contract_length_months = 1
        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.free_months = 0
        self.promo_months = 0
        self.promo_price = 0
        self.actual_price = 0
        self.secondary_price = 0 #secondary promo price. if there is one promo and then there is a second price before the actual price after the promos end
        self.secondary_months = 0
        self.weighted_average_monthly_price = 0
        self.two_year_cost = 0
        
        self.is_lte = None #to be deleted
        self.is_5g = None #to be deleted
        self.with_tv = None
        self.with_modem = None
        self.with_landline = None
        self.with_mobile = None

        self.upload_speed = 0
        self.download_speed = 0
        # if the website didn't specify a cap, it should set to unlimited (999999) mb format
        self.data_cap = None
        self.internet_connection_type = None

        self.minutes_all_net = 0 #for landline portion of plan
        self.minutes_on_net = 0 #for landline portion of plan
        self.minutes_all_net_mobile = 0 #for mobile portion of plan
        self.minutes_on_net_mobile = 0 #for mobile portion of plan
        self.sms_all_net_mobile = 0 #for mobile portion of plan
        self.sms_on_net_mobile = 0 #for mobile portion of plan
        self.international_minutes_mobile = 0 #for mobile portion of plan
        self.international_minutes_landline = 0 #for landline portion of plan
        self.talk_text_share = False #related to mobile portion of plan
        
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.social_media_apps_mobile = None
        self.data_social_media_mb_mobile = 0
        
        self.notes = None

        self.mobile_data_mb = 0 #related to mobile
        self.roaming_data_mb = 0 #related to mobile
        self.roaming_minutes = 0 #related to mobile
        self.is_mobile_5g = None #related to mobile
       



class PrepaidType(object):
    def __init__(self, country=None):
        self.country = country
        self.website = None
        self.provider_name = None
        self.network_name = None
        self.currency = None
        self.scraper_date = datetime.today()
        self.source_url = None
        self.plan_name = None
        self.is_lte = None
        self.is_5g = None
        self.validity_period_days = None
        self.package_price = 0
        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.plan_data_mb = 0
        # self.is_unlimited_talk = None
        # self.is_unlimited_text = None
        self.minutes_all_net = 0
        self.sms_all_net = 0
        self.minutes_on_net = 0
        self.sms_on_net = 0
        self.notes = None
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.included_subscriptions = None
        self.roaming_data_mb = 0 
        self.roaming_minutes = 0 
        self.minutes_international = 0
        self.roaming_sms = 0
        self.segment = 'standard'

