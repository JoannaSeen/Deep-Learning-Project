#This code below is only for Section B, Part B, Question 5
from dotenv import load_dotenv
import os

# Import namespaces
from azure.ai.translation.text import *
from azure.ai.translation.text.models import InputTextItem
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.questionanswering import QuestionAnsweringClient
import azure.cognitiveservices.speech as speech_sdk

def get_speech_voice(language_code):
    voice_mapping = {
        "en": "en-US-AriaNeural",
        "zh-CN": "zh-CN-XiaoxiaoNeural",
        "ms": "ms-MY-YasminNeural",
        "ta": "ta-SG-VenbaNeural"
    }
    return voice_mapping.get(language_code)

def speech_to_text():
    # Load Speech API keys and region
    ai_speech_key = os.getenv('SPEECH_KEY')
    ai_speech_region = os.getenv('SPEECH_REGION')
    
    # Configure Speech SDK
    speech_text_config = speech_sdk.SpeechConfig(subscription=ai_speech_key, region=ai_speech_region)
    
    # Specify the language model for recognition
    audio_config = speech_sdk.AudioConfig(use_default_microphone=True)
    
    # Create recognizer
    speech_recognizer = speech_sdk.SpeechRecognizer(speech_text_config, audio_config)
    
    print('Speak now...')

    # Start speech recognition
    speech = speech_recognizer.recognize_once_async().get()

    if speech.reason == speech_sdk.ResultReason.RecognizedSpeech:
        transcribed_text = speech.text
        return transcribed_text
    else:
        print(f"Speech recognition failed: {speech.reason}")
        if speech.reason == speech_sdk.ResultReason.Canceled:
            cancellation = speech.cancellation_details
            print(f"Cancellation details: {cancellation.reason}")
            print(f"Error details: {cancellation.error_details}")
        return None

def text_to_speech(text, language_code):
    ai_speech_key = os.getenv('SPEECH_KEY')
    ai_speech_region = os.getenv('SPEECH_REGION')
    text_speech_config = speech_sdk.SpeechConfig(subscription=ai_speech_key, region=ai_speech_region)
    text_speech_config.voice_name = get_speech_voice(language_code)
    text_speech_config.speech_synthesis_language = language_code
    speech_synthesizer = speech_sdk.SpeechSynthesizer(text_speech_config)
    speak = speech_synthesizer.speak_text_async(text).get()
    if speak.reason != speech_sdk.ResultReason.SynthesizingAudioCompleted:
        print(speak.reason)

def main():
    try:
        # Get Configuration Settings
        load_dotenv()
        
        ## For Q and A model
        ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
        ai_key = os.getenv('AI_SERVICE_KEY')
        ai_project_name = os.getenv('QA_PROJECT_NAME')
        ai_deployment_name = os.getenv('QA_DEPLOYMENT_NAME')
        
        ## For the translator SDK
        translatorRegion = os.getenv('TRANSLATOR_REGION')
        translatorKey = os.getenv('TRANSLATOR_KEY')

        # Create client using endpoint and key for Q&A
        credential = AzureKeyCredential(ai_key)
        ai_client = QuestionAnsweringClient(endpoint=ai_endpoint, credential=credential)

        # Create client using endpoint and key for Multilanguage
        credential_translator = TranslatorCredential(translatorKey, translatorRegion)
        client_translator = TextTranslationClient(credential_translator)

        # Ask user if they would like to use voice or type
        use_voice = input("Would you like to use voice input? (yes/no): ")
        user_question = ''
        
        while True:
            if use_voice.lower() == "yes":
                
                user_question = speech_to_text()
                
                if not user_question:
                    print("Speech-to-text failed or no speech detected.")
                    continue

            else:
                user_question = input("Please enter your question: ")

            # Check if question is valid
            if not user_question or user_question.lower() == 'quit':
                print("Exiting...")
                break

            # Detect language and translate to English
            user_question_text = [InputTextItem(text=user_question)]
            translated_text = client_translator.translate(content=user_question_text, to=["en"])
            translated_question = translated_text[0].translations[0].text
            detected_language = translated_text[0].detected_language
            detected_result = detected_language.language

            # Get response from Q&A model
            response = ai_client.get_answers(question=translated_question,
                                              project_name=ai_project_name,
                                              deployment_name=ai_deployment_name)
            if not response.answers:
                print("No answers found.")
                continue

            top_answer = response.answers[0].answer

            # Output the answer in the same language that the user entered
            if detected_result != 'en':
                translated_answer = [InputTextItem(text=top_answer)]
                translated_answer_output = client_translator.translate(content=translated_answer, to=[detected_result])
                translated_answer_top = translated_answer_output[0].translations[0].text
                print(f"Answer: {translated_answer_top}")
                text_to_speech(translated_answer_top, language_code=detected_result)
            else:
                print(f"Answer: {top_answer}")
                text_to_speech(top_answer, language_code="en")

    except Exception as ex:
        print(f"An error occurred: {ex}")

if __name__ == "__main__":
    main()
