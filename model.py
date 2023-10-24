from flask import Flask , request
from flask_cors import CORS

import openai

openai.api_key = "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"

import streamlit as st
from langchain.document_loaders.csv_loader import CSVLoader
from langchain.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from dotenv import load_dotenv
import random
import requests

app = Flask(__name__)
CORS(app) 

@app.route('/', methods=['GET'])
def root():
    return 'Model Server running'


@app.route('/model_input', methods=['POST'])
def model_input():
    try:
        data = request.get_json()

        print('Received JSON data:')
        print(data)

        def mental_score():
            random_value = random.randint(50, 100)
            return random_value

        score = mental_score()

        print()
        print()

        def lang_chain():

            prompt_data = list(data.values())[len(data) - 1]

            # 1. Vectorise the sales response csv data
            loader = CSVLoader(file_path="output.csv")
            documents = loader.load()

            embeddings = OpenAIEmbeddings(openai_api_key=openai.api_key)

            db = FAISS.from_documents(documents, embeddings)

            def retrieve_info(query):
                similar_response = db.similarity_search(query, k=1)

                page_contents_array = [doc.page_content for doc in similar_response]

                # print(page_contents_array)

                return page_contents_array


            llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k-0613", openai_api_key=openai.api_key)

            template = """
            You are a world class mental health buddy named Encephalon. 
            I will share a prospect's message with you and you will give me the best answer that 
            I should send to this prospect based on past best practies, 
            and you will follow ALL of the rules below:

            1/ Response should be very similar or even identical to the past best practies, 
            in terms of length, ton of voice, logical arguments and other details

            2/ If the best practice are irrelevant, then try to mimic the style of the best practice to prospect's message

            Below is a message I received from the prospect:
            {message}

            Here is a list of best practies of how we normally respond to prospect in similar scenarios:
            {best_practice}

            Please write the best response that I should send to this prospect:
            """

            prompt = PromptTemplate(
                input_variables=["message", "best_practice"],
                template=template
            )

            chain = LLMChain(llm=llm, prompt=prompt)

            def generate_response(message):
                best_practice = retrieve_info(message)
                response = chain.run(message=message, best_practice=best_practice)
                return response

            responseOutput = generate_response(prompt_data)
            return responseOutput

        diagnosis = lang_chain()

        response_message = {
            "score" : score,
            "diagnosis" : diagnosis
        }
        
        print()
        print('Results were processed.')

        # Post the response message to the /results endpoint
        requests.post("http://localhost:3000/results", json=response_message)

        return 'JSON Data was received, processed and posted to /results'
    
    except Exception as e:
        # Handle any potential errors, e.g., invalid JSON format
        return {'error': str(e)}

if __name__ == "__main__":
    app.run(port=5000, debug=True)