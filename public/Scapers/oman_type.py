from datetime import datetime

class PostpaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Oman'
        self.currency = 'OMR'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.network_name = provider_name
        self.is_lte = True
        self.source_url = None
        self.plan_name = None
        self.arabic_name = None
        self.contract_length_months = 1
        self.upfront_charge = 0
        self.monthly_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.two_year_cost = 0
        self.minutes_on_net = 0
        self.minutes_all_net = 0
        self.minutes_international = 0
        self.weekend_talk = 0
        self.sms_all_net = 0
        self.sms_international = 0
        self.plan_data_mb = 0
        self.weekend_data_mb = 0
        self.roaming_sms = 0
        self.roaming_minutes = 0
        self.roaming_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        # number for free call
        self.unlimited_calling = 0
        # notes for [promotional data: X GB (Y months)]
        self.notes = None

class PrepaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Oman'
        self.currency = 'OMR'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.network_name = provider_name
        self.is_lte = True
        self.source_url = None
        self.plan_name = None
        self.arabic_name = None
        self.validity_period_days = None
        self.plan_data_mb = 0
        self.night_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.package_price = 0
        self.minutes_on_net = 0
        self.minutes_all_net = 0
        self.minutes_international = 0
        self.roaming_minutes = 0
        self.roaming_data_mb = 0
        self.roaming_sms = 0
        self.sms_on_net = 0
        self.sms_all_net = 0
        self.sms_international = 0
        self.talk_text_share = None
        self.unlimited_calling = 0
        self.sim_included = False
        self.notes = None