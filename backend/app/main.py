# Backend API

from flask import Flask, Response, request
from flask_cors import CORS
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
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
db_pending_responses = db.pending_responses

# Twilio Vars

twilio_account_sid = os.environ['TWILIO_ACCOUNT_SID']
twilio_auth_token = os.environ['TWILIO_AUTH_TOKEN']
twilio_client = Client(twilio_account_sid, twilio_auth_token)
twilio_phone_number = '+12058399786'

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
    formatted_spend_limit = "{:.2f}".format(spend_limit)

    return Response(f"{{\"daily_limit\": {formatted_spend_limit}}}", status=200, mimetype='application/json')

# Usage: /get_remaining_daily_limit?patient=<patient_username>
@app.route("/get_remaining_daily_limit")
def get_remaining_daily_spend_limit():
    patient = request.args.get('patient')
    remaining_spend_limit = get_patient_record(patient)["remaining_spend_limit"]
    formatted_rsl = "{:.2f}".format(remaining_spend_limit)

    return Response(f"{{\"remaining_spend_limit\": {formatted_rsl}}}", status=200, mimetype='application/json')

# Usage: /get_managed_balance?patient=<patient_username>
@app.route("/get_managed_balance")
def get_managed_balance():
    patient = request.args.get('patient')
    managed_balance = get_patient_record(patient)["managed_account_balance"]
    formatted_mb = "{:.2f}".format(managed_balance)

    return Response(f"{{\"managed_balance\": {formatted_mb}}}", status=200, mimetype='application/json')

# Usage: /make_purchase?patient=<patient_username>&price=<int>
@app.route("/make_purchase")
def make_purchase():
    patient = request.args.get('patient')
    price = float(request.args.get('price'))
    formatted_price = "{:.2f}".format(price) 
    patient_record = get_patient_record(patient)
    guardian_phone_number = patient_record["guardian_phone_number"]
    patient_name = patient_record["full_name"]
    patient_username = patient_record["username"]
    remaining_spend_limit = float(patient_record["remaining_spend_limit"])
    managed_account_balance = float(patient_record["managed_account_balance"])

    if(remaining_spend_limit < price):
        message = twilio_client.messages.create(
            body=f'HeimWallet: Authorize ${formatted_price} transaction from {patient_name}? Location: (insert location)\n\nReply YES to authorize, NO to decline',
            from_=twilio_phone_number,
            to=guardian_phone_number
        )

        if(get_pending_response(guardian_phone_number)):
            # There's already a record for the phone number. For sake of logic simplicity, delete and recreate the pending record
            delete_pending_response(guardian_phone_number)

        add_pending_response(guardian_phone_number, price, patient_username, "pending")
        return Response(f"{{\"status\": \"req_auth\", \"remaining_spend_limit\": null, \"managed_balance\": null}}", status=200, mimetype='application/json')

    # If we get here, the patient had enough to spend

    remaining_spend_limit = remaining_spend_limit - price
    managed_account_balance = managed_account_balance - price
    formatted_rsl = "{:.2f}".format(remaining_spend_limit)
    formatted_mab = "{:.2f}".format(managed_account_balance)

    new_limits_and_balance = { "$set": {"remaining_spend_limit": remaining_spend_limit, "managed_account_balance": managed_account_balance} }
    patient_query = {"username": patient}
    db_users.update_one(patient_query, new_limits_and_balance)
    return Response(f"{{\"status\": \"success\", \"remaining_spend_limit\": {formatted_rsl}, \"managed_balance\": {formatted_mab}}}", status=200, mimetype='application/json')

# Usage: /check_for_auth?patient=<patient_username>
# This endpoint is to be polled frequently, and indicates whether the transaction has been authorized/declined
@app.route("/check_for_auth")
def check_for_auth():
    patient = request.args.get('patient')
    # so, this is kinda hacky, but we're going to get the patient phone number via the users collection and then poll the pending responses off that
    patient_record = get_patient_record(patient)
    guardian_phone_number = patient_record["guardian_phone_number"]
    formatted_rsl = "{:.2f}".format(patient_record["remaining_spend_limit"])
    formatted_mab = "{:.2f}".format(patient_record["managed_account_balance"])

    pending_record = get_pending_response(guardian_phone_number)

    if(pending_record["status"] == "pending"):
        return Response(f"{{\"status\": \"waiting\", \"remaining_spend_limit\": null, \"managed_balance\": null}}", status=200, mimetype='application/json')
    elif(pending_record["status"] == "approved"):
        return Response(f"{{\"status\": \"approved\", \"remaining_spend_limit\": {formatted_rsl}, \"managed_balance\": {formatted_mab}}}", status=200, mimetype='application/json')
    elif(pending_record["status"] == "denied"):
        return Response(f"{{\"status\": \"denied\", \"remaining_spend_limit\": {formatted_rsl}, \"managed_balance\": {formatted_mab}}}", status=200, mimetype='application/json')
    else:
        return Response("\"status\": \"we should have never gotten here..\"", status=500, mimetype='application/json')
    

# Twilio calls this function in order to report a YES or NO. !! Do not manually attempt to call this !!
@app.route("/sms_authorize_response", methods=['GET', 'POST'])
def sms_authorize_payment():

    body = request.values.get('Body', None)
    sender = request.values.get('From', None)

    resp = MessagingResponse()

    pending_record = get_pending_response(sender)
    if not pending_record:
        print(f"Nothing pending for {sender}")
        return None

    if pending_record["status"] != "pending":
        print(f"{sender} exists in records but isn't pending")
        return None

    price = float(pending_record["price"])
    formatted_price = "{:.2f}".format(price)

    if body == 'YES':
        resp.message(f"HeimWallet: Authorized purchase of ${formatted_price}")
        update_pending_response_status(sender, "approved")
        # update the patient's financial data
        patient_username = pending_record["patient_username"]
        patient_record = get_patient_record(patient_username)
        managed_account_balance = float(patient_record["managed_account_balance"])
        patient_query = {"username": patient_username}
        new_balance = { "$set": {"managed_account_balance": managed_account_balance - price} }
        db_users.update_one(patient_query, new_balance)
    elif body == 'NO':
        resp.message(f"HeimWallet: Rejected purchase of ${formatted_price}")
        update_pending_response_status(sender, "denied")
    else:
        resp.message("HeimWallet: Invalid authorization response.\n\nReply YES to authorize, NO to decline")

    return str(resp)

# Internal helper function to get patient record from database
def get_patient_record(patient):
    #patient = request.args.get('patient')
    patient_query = {"username": patient}
    return db_users.find(patient_query)[0]

# Internal helper function to add pending response
def add_pending_response(guardian_phone_number, price, patient_username, status):
    pending_response = {"guardian_phone_number": guardian_phone_number, "price": price, "patient_username": patient_username, "status": status}
    db_pending_responses.insert_one(pending_response)

# Internal helper function to get pending response
# Returns None if no pending response with that phone number
def get_pending_response(guardian_phone_number):
    pending_response_query = {"guardian_phone_number": guardian_phone_number}
    response = db_pending_responses.find_one(pending_response_query)
    
    return response

# Internal helper function to update pending response status
def update_pending_response_status(guardian_phone_number, status):
    new_status = { "$set": {"status": status} }
    pending_response_query = {"guardian_phone_number": guardian_phone_number}
    db_pending_responses.update_one(pending_response_query, new_status)
    return None

# Internal helper function to delete pending response
def delete_pending_response(guardian_phone_number):
    pending_response_query = {"guardian_phone_number": guardian_phone_number}
    db_pending_responses.delete_one(pending_response_query)
    return None
