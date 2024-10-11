import os
BDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


#local DB

DB = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'scraps_local',
        'USER': '<username>',
        'PASSWORD': '<password>'
       }
    }


"""
#server DB (will get credentials at some point)
DB = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'scraps',
        'USER': '<username>',
        'PASSWORD': '<passowrd>',
        'HOST': '134.209.76.189',
        'PORT': '5432',
    }
}
"""

# Assuming drivers are in your project root
FIREFOX_DRIVER = BDIR + '/geckodriver'
CHROME_DRIVER = BDIR + '/chromedriver'

# Token and key to access dropbox and google api
DROPBOX_TOKEN = "wLIkD6WI5KQAAAAAAAAAAVvwSQgkAWO7f0mzdRB4xflDT-9Y5kXDvduf6bG2toJh"
# DROPBOX_TOKEN = '5nXhtIx3qYAAAAAAAAAAx7_eOZ2pj-1pkpfxdSFPkqNHVYgEi2TazUJIiY1PjXwS'
GOOGLE_JSON = {
    "type": "service_account",
    "project_id": "scraper-reporter",
    "private_key_id": '9ac20205b2e0a64b02515f00875dd558d8c8f213',
    "private_key": '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDX+jVrevf7W0Ue\njeNNpTYxWwe4SLWQzRhDO1m3+PGfkxZ7mJwdM0bVq7kJih54e7vimLpOQFdIBK0p\nRrajSVjlANLS846JB3szV6Zdoi96ojFmDJYTZYN1zxNV0K4a89kx9jTREsA6uZae\ns2wIAMFsM4fI8Ousg/5ftemXzxxpwOiw1OCLj1xNtAcWY1iZ7yHHpDSBaQgREwLB\nrVjPnmRjdyR9lpTDhR7GmdPhR7fP3eHG33fc628+hHrl1QIyvT9RAVO+3XgpPf64\nO2aeCwCoheIqeik2Y6+aPR60yErRbSDYykBns1QEqhUUAB7kv+Ps4htzriFO0S0Z\nbAGUW1grAgMBAAECggEATxE+Kk136JDm0oM+Ukgn+VSqlFgmBE9ZUQ+yzku4ZWOL\nSQ87I+OITKQT1z613gTqaU/hcNFUQrzXifNl3Ix3G0s8Y1cf+OGAxHCTqta7zAkB\nzarQ7GPvBxuaqAGAI8Te4FAS0PGs5zLXRd1IsPtZ1FtfG/y7QsqFvxNRY67CZ6I4\nGItX9NvPkQN4FKj9TrSCBeXTQODqRDg8ZKqT93DqL16RKyLzZJkH3pfupah30yDR\nQRwNfJ+mf8TleI4q1/HQcuop6Q0ZhPhSmZL5VsD3R/cv0748TnpfVClGbajw2ahB\nVsNMIH/VJZrFK4+1b4ytDdtEn4UuE/QUWkH/703tXQKBgQD1sAHBGAdR4fPK9sYS\nTMDec7e3uCDM3AOYhFnd6rOnkfFsP3b1BlEe/eMfZekBjzy00j72HscszCOYGk5Y\nM/DEnijHMFlRT1wxi+dV0lzBuE/pbv91gjGrrHAWzrwgeWgm0iDTiZViiQEW3zFA\nNYsje0dyhwU484Xgb5polCucRQKBgQDhCvTd4cl5rG0/d5fVUJTBsDXSHLFuPDAQ\nYhhgo/WQ95BEPzXpzesiUk4zULRp3sdhfBnH8FT0xSF6FISd0dQOXnYDceTSO17E\njC0cQLYX4E1cyoCC4Yp822Tf6zfxvmb9yBuD8vNY2szR5qFaBt/7mRBOuPc60B5I\n6MSa2UZBrwKBgE7bVkTO3JKYjnJnsH1xKzp7M82BCO4X9AOA/4Mt8MnpGu8ek6Tj\niSgEX2DViesZOWfkT5cZm94yC36netvul+nTxczhJNnnOfUhLXgrU+BNs0B+gvoJ\ndr3eU//ODS3zKc3EBgs/jrYYuUPJEXrFdMpHqFAHLFLyPtchmxLT9AdtAoGBAK3t\nRODzrz5NiEXEDWH9HGsx3/ba3DrBY7hVyFdwgMsguqw0WluwHWlySSQZ3MXyOxBZ\n1KcVVOO0M7JhhzleQVE1qmnxLZNZ9V1cpUSvssxzO/daPsZowBrNiYISDjPVH05G\nyRVKwM7Mk/4qDExDAfs3CkZ9Z/5ZeP6Kf+DZyhXbAoGBAIVhCbfBqi1A3aen1U70\nhjEPrg1SsVuDiDMzQoNjabQyH79hEkiF63WyhJhfKk8Cf+S9toj1lKy0jGj+Qj0s\nRSuPFgpINB9upxC3MyvihsSBhnUDsKHn97dV7/3LgBsGgvZcdxWyJ21CKv+Qt3fD\ncyaI1E3YMdYGN8sO+8zQzzQ1\n-----END PRIVATE KEY-----',
    "client_email": "tarifica@scraper-reporter.iam.gserviceaccount.com",
    "client_id": '105694652949656533695',
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/tarifica%40scraper-reporter.iam.gserviceaccount.com"
}
DEBUG = "FALSE"
ARCH_DB_USER = ''
ARCH_DB_PW = ''
ARCH_DB_IP = ''
ACCESS_KEY_ID = 'AKIAUAWQJFP6Q36VWTHY'
ACCESS_SECRET_KEY = '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'
BUCKET_NAME = ''
SLACK_CLIENT_ID = ''
SLACK_CLIENT_SECRET = ''
SLACK_VERIFICATION_TOKEN = ''
SLACK_BOT_USER_TOKEN = ''
VERIFICATION_TOKEN = ''
DATA_CLEANING_URL = "https://etl.tarifica.online/dc/cleandata"
DATA_CLEANING_TOKEN = "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjQ2ODgxNDY1NTUsImlhdCI6MTU3Nzc0NjU1NSwibmJmIjoxNTc3NzQ2NTU1LCJpZGVudGl0eSI6IjEifQ.twuxZ495_huT51jtb5AHUO50i-A7N14W5OFywuQC8OE"

# pycharm ide
