import os
import random
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders.csv_loader import CSVLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.vectorstores import FAISS

load_dotenv()

API_KEY = os.getenv("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")

print(API_KEY)

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def root():
    return "Model Server running"


@app.route("/model_input", methods=["POST"])
def model_input():
    try:
        data = request.get_json()

        print("Received JSON data:")
        print(data)

        def lang_chain():
            prompt_data = list(data.values())[len(data) - 1]

            print()
            print("prompt data recieved was :")
            print(prompt_data)

            # 1. Vectorise the sales response csv data
            try:
                loader = CSVLoader(
                    file_path="./output.csv",
                    csv_args={
                        "delimiter": ",",
                        "quotechar": '"',
                    },
                    encoding="utf-8",
                )
            except Exception as e:
                print("Error loading CSV file: " + str(e))
            documents = loader.load()

            embeddings = OpenAIEmbeddings(openai_api_key=API_KEY)

            db = FAISS.from_documents(documents, embeddings)

            def retrieve_info(query):
                similar_response = db.similarity_search(query, k=1)

                page_contents_array = [doc.page_content for doc in similar_response]

                return page_contents_array

            llm = ChatOpenAI(
                temperature=0,
                model="gpt-3.5-turbo-16k-0613",
                openai_api_key=API_KEY,
            )

            template = """
            You are a world class mental health buddy named Encephalon. 
            I will share a prospect's message with you and you will give me the best answer that 
            I should send to this prospect based on past best practices, 
            and you will follow ALL of the rules below:

            1/ Response should be very similar or even identical to the past best practices, 
            in terms of length, ton of voice, logical arguments and other details

            2/ If the best practice are irrelevant, then try to mimic the style of the best practice to prospect's message

            Below is a message I received from the prospect:
            {message}

            Here is a list of best practices of how we normally respond to prospects in similar scenarios:
            {best_practice}

            Please write the best response that I should send to this prospect:
            """

            prompt = PromptTemplate(
                input_variables=["message", "best_practice"], template=template
            )

            chain = LLMChain(llm=llm, prompt=prompt)

            def generate_response(message):
                best_practice = retrieve_info(message)
                response = chain.run(message=message, best_practice=best_practice)
                return response

            responseOutput = generate_response(prompt_data)
            return responseOutput

        diagnosis = lang_chain()

        def mental_score():
            random_value = random.randint(65, 80)
            return random_value

        score = mental_score()

        response_message = {"score": score, "diagnosis": diagnosis}

        print(response_message)
        print("Results were processed.")

        return jsonify(response_message)

    except Exception as e:
        # Handle any potential errors, e.g., invalid JSON format
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(port=5000, debug=True)
