import speech_recognition as sr

r = sr.Recognizer()

with sr.Microphone() as source:
    print('talk')
    audio_text = r.listen(source)
    print("Times up")
    
    try:
        print("Text: " + r.recognize_google(audio_text, language="it-IT"))
    except:
        print("Sorry, try again")