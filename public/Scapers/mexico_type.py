
class PostpaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Mexico'
        self.currency = 'MXN'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.network_name = provider_name
        self.is_lte = True
        self.is_5g = False
        self.source_url = None
        self.plan_name = None
        self.contract_length_months = 1
        self.onetime_charge = 0
        self.onetime_promotion = 0
        self.upfront_charge = 0
        self.promo_months = 0
        self.promo_price = 0
        self.monthly_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.two_year_cost = 0
        self.social_media_apps = None
        self.data_social_media_mb = 999999
        self.minutes_all_net = 0
        self.sms_all_net = 0
        self.plan_data_mb = 0
        self.notes = None

class PrepaidType(object):
    def __init__(self, provider_name=None):
        self.country = 'Mexico'
        self.currency = 'MXN'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.network_name = provider_name
        self.source_url = None
        self.plan_name = None
        self.is_lte = True
        self.validity_period_days = None
        self.plan_data_mb = 0
        self.data_social_media_mb = 0
        self.social_media_apps = None
        self.package_price = 0
        self.minutes_all_net = 0
        self.sms_all_net = 0
        self.credit_value = 0
        self.sim_included = False
        self.notes = None

class DSLType(object):
    def __init__(self, provider_name=None):
        self.country = 'Mexico'
        self.currency = 'MXN'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.source_url = None
        self.plan_name = None
        self.contract_length_months = 1
        self.upfront_charge = 0
        self.promo_months = 0
        self.promo_price = 0
        self.monthly_price = 0
        self.actual_price = 0
        self.weighted_average_monthly_price = 0
        self.two_year_cost = 0
        self.download_speed = 0
        self.with_tv = None
        self.with_modem = None
        self.with_landline = None
        self.with_mobile = None
        self.data_cap = 0
        self.social_media_apps = None
        self.data_social_media_mb = 0
    


class DeviceOnlyType(object):
    def __init__(self, provider_name=None):
        self.country = 'Mexico'
        self.currency = 'MXN'
        self.scraper_date = datetime.today()
        self.website = provider_name
        self.provider_name = provider_name
        self.source_url = None
        self.device_name = None
        self.device_storage = None
        self.financing_upfront = None
        self.financing_price = None
        self.financing_months = None
        self.onetime_price = None
        self.plan_required = None
        
    