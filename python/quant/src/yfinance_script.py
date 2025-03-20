
import yfinance as yf

data = yf.download("MSFT", start="2017-01-01", end="2021-07-21")

print (data)