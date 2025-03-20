using QuoteMedia.Streamer.Client;
using QuoteMedia.Streamer.Client.Auth;
using QuoteMedia.Streamer.Message.Control;
using QuoteMedia.Streamer.Message.Marketdata;
using System;
using System.Collections.Generic;
using System.Text;

namespace ConsoleApp1
{
    class Example2
    {
        private static readonly string WMID = "501";
        private static readonly string SERVICE_URI = "http://qa.quotemedia.com/cache/stream/v1";
        private static readonly string[] SYMBOLS = new string[] { "GOOG", "MSFT" };
        private static readonly MarketdataType[] TYPES = new MarketdataType[] { MarketdataType.QUOTE, MarketdataType.PRICEDATA };

        static void Main(string[] args)
        {
            StreamConfig cfg = new StreamConfig();
            using (MarketdataStream stream = StreamerAPI.Create(cfg))
            {
                // Register callbacks
                stream.OnMessage = HandleMessage;
                stream.OnError = HandleError;
                stream.OnCtrlMessage = HandleCtrlMessage;
                // Open stream
                stream.Open(SERVICE_URI, new WebmasterCredentials(WMID));
                // Subscribe
                SubscribeResponse subscribed = stream.Subscribe(SYMBOLS, TYPES);
                if (subscribed.Code != ResponseCodes.OK_CODE) { throw new Exception("Subscribe failed"); }

                Console.WriteLine("Hit <ENTER> to exit");
                Console.ReadLine();

                // Unsubscribe
                UnsubscribeResponse unsubscribed = stream.Unsubscribe(SYMBOLS, TYPES);
                if (unsubscribed.Code != ResponseCodes.OK_CODE) { throw new Exception("Unsubscribe failed"); }

            }
        }

        private static void HandleMessage(MarketdataMessage msg)
        {
            // Handle market data
        }

        private static void HandleError(Exception e)
        {
            // Handle error
        }

        private static void HandleCtrlMessage(CtrlMessage msg)
        {
            // Handle control messages.
        }
    }
}
