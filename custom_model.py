##This code below is only for Section A, Question D

import requests 

# Replace these variables with your Azure details 
endpoint = "https://joanna-instance.cognitiveservices.azure.com" 
api_key = "9JFbwS3l1s6bhZsWYt9P31bLRmSj79qgUgE7l93Ld9y4AdpN538mJQQJ99BAACYeBjFXJ3w3AAAEACOGVArc" 
model_name = "classifyfruit" 
 
# Endpoint URL with model-name query parameter 
analyze_url = f"{endpoint}/computervision/imageanalysis:analyze?model-name={model_name}&api-version=2023-02-01-preview" 
 
# Image URL
image_url = "https://customclassifyjsqh.blob.core.windows.net/testing/r0_87.jpg" 

headers = { 
    "Ocp-Apim-Subscription-Key": api_key, 
    "Content-Type": "application/json"
} 
 
data_to_send = { 
    "url": image_url
} 
 
# Make the POST request 
response_from_post = requests.post(analyze_url, headers=headers, json=data_to_send) 
 
# Check the response 
if response_from_post.status_code == 200: 
    analysis_results = response_from_post.json() 
    print("Analysis Results:\n", analysis_results)

else:  
    error  = response_from_post.json()
    print("Error:\n", error)