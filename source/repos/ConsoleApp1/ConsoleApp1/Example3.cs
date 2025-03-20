using QuoteMedia.Streamer.Client;
using QuoteMedia.Streamer.Client.Auth;
using QuoteMedia.Streamer.Message.Control;
using QuoteMedia.Streamer.Message.Marketdata;
using System;
using System.Collections.Generic;
using System.Text;

namespace ConsoleApp1
{
    class Example3
    {
        // Adjust authentication credentials to your account.
        private static string TOKEN = "Bearer YourEnterpriseToken";
        private static string WMID = "501";

        private static string SERVICE_URI = "http://qa.quotemedia.com/cache/stream/v1";
        private static string[] SYMBOLS = new string[] { "GOOG", "MSFT" };
        private static MarketdataType[] DATATYPES = new MarketdataType[] { MarketdataType.QUOTE, MarketdataType.PRICEDATA };

        static void Main(string[] args)
        {
            // Create configuration, use fluent api to set properties.
            StreamConfig cfg = new StreamConfig();
            // Use factory to create stream from configuration.
            using (MarketdataStream stream = StreamerAPI.Create(cfg))
            {
                // Register callbacks
                stream.OnMessage = HandleMessage;
                stream.OnError = HandleError;
                stream.OnCtrlMessage = HandleCtrlMessage;
                // Open the stream                
                stream.Open(SERVICE_URI, new TokenCredentials(TOKEN, WMID));
                // Subscribe
                SubscribeResponse subscribed = stream.Subscribe(SYMBOLS, DATATYPES);
                if (subscribed.Code != ResponseCodes.OK_CODE) { throw new Exception("Subscribe failed."); }

                Console.WriteLine("Hit <ENTER> to exit.");
                Console.ReadLine();

                // Unsubscribe
                UnsubscribeResponse unsubscribed = stream.Unsubscribe(SYMBOLS, DATATYPES);
                if (unsubscribed.Code != ResponseCodes.OK_CODE) { throw new Exception("Unsubscribe failed"); }
            }
        }

        private static void HandleMessage(MarketdataMessage msg)
        {
            if (msg is Quote)
            {
                // Handle quote
            }
            else if (msg is PriceData)
            {
                // Handle pricedata
            }
            // ... handle other available message types
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
