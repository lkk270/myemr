from datetime import datetime

class PostpaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Costa Rica'
        self.scraper_date = datetime.today()
        self.currency = 'CRC'
        self.website = provider_name
        self.network_name = provider_name
        self.provider_name = provider_name

        self.source_url = None
        self.plan_name = None
        self.is_lte = True
        self.contract_length_months = 1
        # no upfront cost is found
        self.upfront_charge = 0
        self.monthly_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.two_year_cost = 0
        self.plan_data_mb = 0
        self.lte_data_mb = 0
        self.regular_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.minutes_on_net = 0
        self.minutes_all_net = 0
        self.minutes_international = 0
        self.minutes_countries = None
        self.notes = None
        self.sms_on_net = 0
        self.sms_all_net = 0
        self.call_rate = None
        self.offpeak_call_rate = None
        self.notes = None


class PrepaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Costa Rica'
        self.scraper_date = datetime.today()
        self.currency = 'CRC'
        self.website = provider_name
        self.network_name = provider_name
        self.provider_name = provider_name
        self.source_url = None
        self.plan_name = None
        self.is_lte = None
        self.validity_period_days = None
        self.package_price = 0
        self.plan_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.minutes_on_net = 0
        self.minutes_all_net = 0
        self.minutes_international = 0
        self.minutes_countries = None
        self.sms_on_net = 0
        self.sms_all_net = 0
        # no credit value ?
        self.credit_value = 0
        self.call_rate = None
        self.notes = None

class BundleType(object):
    def __init__(self, provider_name=None):
        self.country = 'Costa Rica'
        self.scraper_date = datetime.today()
        self.currency = 'CRC'
        self.website = provider_name
        self.network_name = provider_name
        self.provider_name = provider_name
        self.source_url = None
        self.plan_name = None
        self.is_lte = None
        self.contract_length_months = 1
        self.device_name = None
        self.device_storage = None
        self.device_monthly_price = 0
        self.onetime_charge = 0
        self.onetime_device = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.monthly_price = 0
        self.two_year_cost = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.plan_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.minutes_on_net = 0
        self.minutes_all_net = 0
        self.sms_on_net = 0
        self.sms_all_net = 0
        self.minutes_international = 0
        self.minutes_countries = None



# Roaming are by analyst
class RoamingType(object):
    def __init__(self, country=None):
        self.country = country
        self.country_destination = None
        self.scraper_date = datetime.today()
        self.website = None
        self.currency = None
        self.provider_name = None
        self.source_url = None
        self.plan_type = None
        self.package_name = None
        self.package_price = 0
        self.package_validity_days = 0
        self.package_mins = 0
        self.package_sms = 0
        self.package_data_mb = 0
        self.rate_call_home = 0
        self.rate_call_within_country = 0
        self.rate_incoming_call = 0
        self.rate_sms = 0
        self.rate_per_mb = 0
        self.notes = None
