# Backend API

from flask import Flask, Response, request
import pymongo
import os

app = Flask(__name__)

# Database Vars

mongopw = os.environ.get('mongopw')
client = pymongo.MongoClient(f"mongodb://jxzheng:{mongopw}@ac-ya81al2-shard-00-00.3p6clyd.mongodb.net:27017,ac-ya81al2-shard-00-01.3p6clyd.mongodb.net:27017,ac-ya81al2-shard-00-02.3p6clyd.mongodb.net:27017/?ssl=true&replicaSet=atlas-udfjiq-shard-0&authSource=admin&retryWrites=true&w=majority")
db = client.ht6

db_transactions = db.transactions
db_users = db.users

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
        return Response("{'error', 'not authorized'}", status=403, mimetype='application/json')

    new_spend_limit = { "$set": {"daily_spend_limit": limit} }
    patient_query = {"username": patient}
    db_users.update_one(patient_query, new_spend_limit)

    return Response("{'success', 'authorized'}", status=200, mimetype='application/json')

# Usage: /get_daily_limit?patient=<patient_username>
@app.route("/get_daily_limit")
def get_daily_spend_limit():
    patient = request.args.get('patient')
    spend_limit = get_patient_record(patient)["daily_spend_limit"]

    return Response(f"{{'daily_limit', '{spend_limit}'}}", status=200, mimetype='application/json')

# Usage: /get_managed_balance?patient=<patient_username>
@app.route("/get_managed_balance")
def get_managed_balance():
    patient = request.args.get('patient')
    managed_balance = get_patient_record(patient)["managed_account_balance"]

    return Response(f"{{'managed_balance', '{managed_balance}'}}", status=200, mimetype='application/json')

# Usage: /make_purchase?patient=<patient_username>
# @app.route("/make_purchase")

# Internal helper function to get patient record from database
def get_patient_record(patient):
    patient = request.args.get('patient')
    patient_query = {"username": patient}
    return db_users.find(patient_query)[0]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
