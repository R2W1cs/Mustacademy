import logging; logging.basicConfig(level=logging.INFO); try: 
  from chatterbox import ChatterboxTTS; tts=ChatterboxTTS(); print('OK') 
except Exception as e: 
  print('ERR:', type(e).__name__, e)
