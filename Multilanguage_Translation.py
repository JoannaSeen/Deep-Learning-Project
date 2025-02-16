#This code below is only for Section B, Part B, Question 4
from dotenv import load_dotenv
import os

# import namespaces
from azure.ai.translation.text import *
from azure.ai.translation.text.models import InputTextItem

# Import namespaces
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.questionanswering import QuestionAnsweringClient


def main():
    try:
        # Get Configuration Settings
        load_dotenv()
        
        ##For Q and A model
        ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
        ai_key = os.getenv('AI_SERVICE_KEY')
        ai_project_name = os.getenv('QA_PROJECT_NAME')
        ai_deployment_name = os.getenv('QA_DEPLOYMENT_NAME')
        ##For the translator SDK
        translatorRegion = os.getenv('TRANSLATOR_REGION')
        translatorKey = os.getenv('TRANSLATOR_KEY')

        

        # Create client using endpoint and key for Q&A
        credential = AzureKeyCredential(ai_key)
        ai_client = QuestionAnsweringClient(endpoint=ai_endpoint, credential=credential)

         # Create client using endpoint and key for Multilanguage
        credential_translator = TranslatorCredential(translatorKey, translatorRegion)
        client_translator = TextTranslationClient(credential_translator)

        # Submit a question and display the answer
        user_question = ''
        while user_question.lower() != 'quit':
            user_question = input('\nQuestion:\n')
            if user_question.lower() == 'quit':
                break

            user_question_text = [InputTextItem(text=user_question)]
            translated_text = client_translator.translate(content=user_question_text, to=["en"])
            translated_question = translated_text[0].translations[0].text
            detected_language = translated_text[0].detected_language
                #We only print the highest confidence results, which is the first array of the detected language
            detected_result = detected_language.language

            # Get response from Q&A model
            response = ai_client.get_answers(question=translated_question,
                                                project_name=ai_project_name,
                                                deployment_name=ai_deployment_name)
            if not response.answers:
                    print("No answers found.")
                    continue
            
            # We only want the highest confidence answer
            top_answer = response.answers[0].answer

            # Output the answer in the same language that the user enter
            if detected_result != 'en':
                translated_answer = [InputTextItem(text=top_answer)]
                translated_answer_output = client_translator.translate(content=translated_answer, to=[detected_result])
                # We only want to print the highest confidence translated answer
                translated_answer_top = translated_answer_output[0].translations[0].text
                print(f"Answer: {translated_answer_top}")
            
            else:
                print(f"Answer: {top_answer}")

    except Exception as ex:
        print(ex)


if __name__ == "__main__":
    main()
