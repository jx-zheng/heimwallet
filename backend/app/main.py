# Backend API

from flask import Flask, Response, request
from flask_cors import CORS
from twilio.rest import Client
import pymongo
import os

app = Flask(__name__)
CORS(app)

# Database Vars

mongopw = os.environ.get('mongopw')
client = pymongo.MongoClient(f"mongodb://jxzheng:{mongopw}@ac-ya81al2-shard-00-00.3p6clyd.mongodb.net:27017,ac-ya81al2-shard-00-01.3p6clyd.mongodb.net:27017,ac-ya81al2-shard-00-02.3p6clyd.mongodb.net:27017/?ssl=true&replicaSet=atlas-udfjiq-shard-0&authSource=admin&retryWrites=true&w=majority")
db = client.ht6

db_transactions = db.transactions
db_users = db.users

# Twilio Vars

twilio_account_sid = os.environ['TWILIO_ACCOUNT_SID']
twilio_auth_token = os.environ['TWILIO_AUTH_TOKEN']
twilio_client = Client(twilio_account_sid, twilio_auth_token)
twilio_phone_number = '+12058399786'

# Phone numbers who we are expecting responses from
# key = phone number, value = price
pending_responses = {}

@app.route("/")
def index():
    return "hi you found the index"

# Usage: /set_spend_limit?guardian=<guardian_username>&patient=<patient_username>&limit=<int>
@app.route("/set_spend_limit")
def set_daily_spend_limit():
    guardian = request.args.get('guardian')
    patient = request.args.get('patient')
    limit = int(request.args.get('limit'))

    patient_record = get_patient_record(patient)
    # Basic authentication: check if the guardian is actually associated with that patient
    if(not patient_record["guardian"] == guardian):
        return Response("{'error': 'not authorized'}", status=403, mimetype='application/json')

    new_spend_limit = { "$set": {"daily_spend_limit": limit} }
    patient_query = {"username": patient}
    db_users.update_one(patient_query, new_spend_limit)

    return Response("{\"success\": \"authorize\"}", status=200, mimetype='application/json')

# Usage: /get_daily_limit?patient=<patient_username>
@app.route("/get_daily_limit")
def get_daily_spend_limit():
    patient = request.args.get('patient')
    spend_limit = get_patient_record(patient)["daily_spend_limit"]

    return Response(f"{{\"daily_limit\": {spend_limit}}}", status=200, mimetype='application/json')

# Usage: /get_remaining_daily_limit?patient=<patient_username>
@app.route("/get_remaining_daily_limit")
def get_remaining_daily_spend_limit():
    patient = request.args.get('patient')
    remaining_spend_limit = get_patient_record(patient)["remaining_spend_limit"]

    return Response(f"{{\"remaining_spend_limit\": {remaining_spend_limit}}}", status=200, mimetype='application/json')

# Usage: /get_managed_balance?patient=<patient_username>
@app.route("/get_managed_balance")
def get_managed_balance():
    patient = request.args.get('patient')
    managed_balance = get_patient_record(patient)["managed_account_balance"]

    return Response(f"{{\"managed_balance\": {managed_balance}}}", status=200, mimetype='application/json')

# Usage: /make_purchase?patient=<patient_username>&price=<int>
@app.route("/make_purchase")
def make_purchase():
    patient = request.args.get('patient')
    price = float(request.args.get('price'))
    patient_record = get_patient_record(patient)
    guardian_phone_number = patient_record["guardian_phone_number"]
    patient_name = patient_record["full_name"]
    remaining_spend_limit = float(patient_record["remaining_spend_limit"])
    managed_account_balance = float(patient_record["managed_account_balance"])

    #if(float(patient_record["managed_account_balance"]) < price):
    #    return Response("{'error', 'not enough funds'}", status=403, mimetype='application/json')

    if(remaining_spend_limit < price):
        message = twilio_client.messages.create(
            body=f'HeimWallet: Authorize ${price} transaction from {patient_name}? Location: (insert location)\n\nReply YES to authorize, NO to decline',
            from_=twilio_phone_number,
            to=guardian_phone_number
        )
        pending_responses[guardian_phone_number] = price
        return Response(f"{{\"status\": \"req_auth\", \"remaining_spend_limit\": null, \"managed_balance\": null}}", status=200, mimetype='application/json')

    # If we get here, the patient had enough to spend

    remaining_spend_limit = remaining_spend_limit - price
    managed_account_balance = managed_account_balance - price

    new_limits_and_balance = { "$set": {"remaining_spend_limit": remaining_spend_limit, "managed_account_balance": managed_account_balance} }
    patient_query = {"username": patient}
    db_users.update_one(patient_query, new_limits_and_balance)
    return Response(f"{{\"status\": \"success\", \"remaining_spend_limit\": {remaining_spend_limit}, \"managed_balance\": {managed_account_balance}}}", status=200, mimetype='application/json')

# Twilio calls this function in order to report a YES or NO
#@app.route("/sms_authorize_response")
#def sms_authorize_response():


# Internal helper function to get patient record from database
def get_patient_record(patient):
    patient = request.args.get('patient')
    patient_query = {"username": patient}
    return db_users.find(patient_query)[0]
